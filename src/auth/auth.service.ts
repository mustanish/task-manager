import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import {
  VerifyIdentityRequest,
  VerifyOtpRequest,
  SignUpRequest,
  SignInRequest,
} from '@taskmanager/requests';
import { AuthResponse, UserResponse } from '@taskmanager/responses';
import { generateOTP, addTime, timeDiff, timeNow } from '@taskmanager/utils';
import { User, Token } from '@taskmanager/entities';
import {
  OTPMsg,
  OtpLength,
  OtpValidity,
  Unavailable,
  UniquePhone,
  InvalidPhone,
  InvalidOTP,
  InvalidCredentials,
  AccessValidity,
  RefreshValidity,
} from '@taskmanager/constants';
import { ErrorCode, VerificationType } from '@taskmanager/enums';
import { CacheService } from '../services/cache.service';
import { JwtPayload } from './jwtpayload.interface';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private cacheService: CacheService,
  ) {}

  async verifyIdentity(request: VerifyIdentityRequest): Promise<AuthResponse> {
    try {
      let user = await this.userRepository.create(request);
      if (request.type === VerificationType.FORGOTACCOUNT) {
        user = await this.detail(request.phone);
        if (!user) {
          throw new HttpException(InvalidPhone, HttpStatus.BAD_REQUEST);
        }
      }
      const { id } = await this.userRepository.save({
        ...user,
        otp: await user.hashOtp(generateOTP(OtpLength)),
        otpType: request.type,
        otpValidity: addTime(OtpValidity),
      });
      const accessToken = await this.generateToken(
        id,
        `verifyOtp`,
        OtpValidity,
      );
      return { accessToken, message: OTPMsg };
    } catch (error) {
      if (error.code === ErrorCode.UNIQUE)
        throw new HttpException(UniquePhone, HttpStatus.CONFLICT);
      else if (error.status === HttpStatus.BAD_REQUEST)
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      else throw new HttpException(Unavailable, HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async verifyOtp(
    user: User,
    request: VerifyOtpRequest,
  ): Promise<AuthResponse> {
    try {
      const compareOtp = await user.compareOtp(request.otp);
      const difference = timeDiff(user.otpValidity);
      if (!compareOtp || difference <= 0) {
        throw new HttpException(InvalidOTP, HttpStatus.BAD_REQUEST);
      }
      [user.otp, user.otpValidity, user.phoneVerified] = [null, null, true];
      const { id, otpType } = await this.userRepository.save(user);
      const accessToken = await this.generateToken(
        id,
        otpType === VerificationType.CREATEACCOUNT ? `signUp` : `resetPassword`,
        OtpValidity,
      );
      return { accessToken };
    } catch (error) {
      if (error.status === HttpStatus.BAD_REQUEST)
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      throw new HttpException(Unavailable, HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async signUp(user: User, request: SignUpRequest): Promise<UserResponse> {
    try {
      const { id } = await this.userRepository.save({
        ...user,
        ...request,
        password: await user.hashPassword(request.password),
        lastLogedIn: timeNow(),
      });
      const accessToken = await this.generateToken(
        id,
        `access`,
        AccessValidity,
      );
      const refreshToken = await this.generateToken(
        id,
        `refresh`,
        RefreshValidity,
      );
      return { token: { accessToken, refreshToken }, user: user.profile() };
    } catch (error) {
      throw new HttpException(Unavailable, HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async signIn(request: SignInRequest): Promise<UserResponse> {
    try {
      const user = await this.detail(request.identity);
      if (!user || !(await user.comparePassword(request.password))) {
        throw new HttpException(InvalidCredentials, HttpStatus.UNAUTHORIZED);
      }
      const { id } = await this.userRepository.save({
        ...user,
        lastLogedIn: timeNow(),
      });
      const accessToken = await this.generateToken(
        id,
        `access`,
        AccessValidity,
      );
      const refreshToken = await this.generateToken(
        id,
        `refresh`,
        RefreshValidity,
      );
      return { token: { accessToken, refreshToken }, user: user.profile() };
    } catch (error) {
      if (error.status === HttpStatus.UNAUTHORIZED)
        throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
      throw new HttpException(Unavailable, HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async refresh({ id }: User): Promise<AuthResponse> {
    const accessToken = await this.generateToken(id, `access`, AccessValidity);
    const refreshToken = await this.generateToken(
      id,
      `refresh`,
      RefreshValidity,
    );
    return { accessToken, refreshToken };
  }

  async detail(identity: string): Promise<User> {
    try {
      const query = this.userRepository.createQueryBuilder(`user`);
      query.where(`user.userName=:identity OR user.phone=:identity`, {
        identity,
      });
      return await query.getOne();
    } catch (error) {
      throw new HttpException(Unavailable, HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async generateToken(
    userID: string,
    scope: string,
    expiresIn: number,
  ): Promise<string> {
    const tokenID = uuidv4();
    const jwtPyload: JwtPayload = { tokenID, scope };
    const value: Token = { userID, scope };
    const token = this.jwtService.sign(jwtPyload, { expiresIn });
    this.cacheService.set<Token>(tokenID, value, expiresIn);
    return token;
  }
}
