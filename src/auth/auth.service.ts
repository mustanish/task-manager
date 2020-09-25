import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { VerifyIdentity, VerifyOtp, SignUp, SignIn } from '@taskmanager/requests';
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

  async verifyIdentity(request: VerifyIdentity): Promise<AuthResponse> {
    try {
      let user = await this.userRepository.create({
        phone: request.phone,
        platform: request.platform,
      });
      if (request.type === VerificationType.FORGOTACCOUNT) {
        user = await this.detail(request.phone);
        if (!user) {
          throw new HttpException(InvalidPhone, HttpStatus.BAD_REQUEST);
        }
      }
      const { userID } = await this.userRepository.save({
        ...user,
        otp: await user.hashOtp(generateOTP(OtpLength)),
        otpValidity: addTime(OtpValidity),
      });
      const accessToken = await this.generateToken(
        userID,
        'verifyOtp',
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

  async verifyOtp(user: User, request: VerifyOtp): Promise<AuthResponse> {
    try {
      const compareOtp = await user.compareOtp(request.otp);
      const difference = timeDiff(user.otpValidity);
      if (!compareOtp || difference <= 0) {
        throw new HttpException(InvalidOTP, HttpStatus.BAD_REQUEST);
      }
      [user.otp, user.otpValidity, user.phoneVerified] = [null, null, true];
      const { userID } = await this.userRepository.save(user);
      const accessToken = await this.generateToken(
        userID,
        'signUp',
        OtpValidity,
      );
      return { accessToken };
    } catch (error) {
      if (error.status === HttpStatus.BAD_REQUEST)
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      throw new HttpException(Unavailable, HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async signUp(user: User, request: SignUp): Promise<UserResponse> {
    try {
      const { userID } = await this.userRepository.save({
        ...user,
        name: request.name,
        password: await user.hashPassword(request.password),
        type: request.type,
        lastLogedIn: timeNow(),
      });
      const accessToken = await this.generateToken(
        userID,
        'access',
        AccessValidity,
      );
      const refreshToken = await this.generateToken(
        userID,
        'refresh',
        RefreshValidity,
      );
      return { token: { accessToken, refreshToken }, user: user.profile() };
    } catch (error) {
      throw new HttpException(Unavailable, HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async signIn(request: SignIn): Promise<UserResponse> {
    try {
      const user = await this.detail(request.identity);
      if (!user || !(await user.comparePassword(request.password))) {
        throw new HttpException(InvalidCredentials, HttpStatus.UNAUTHORIZED);
      }
      const { userID } = await this.userRepository.save({
        ...user,
        lastLogedIn: timeNow(),
      });
      const accessToken = await this.generateToken(
        userID,
        'access',
        AccessValidity,
      );
      const refreshToken = await this.generateToken(
        userID,
        'refresh',
        RefreshValidity,
      );
      return { token: { accessToken, refreshToken }, user: user.profile() };
    } catch (error) {
      if (error.status === HttpStatus.UNAUTHORIZED)
        throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
      throw new HttpException(Unavailable, HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async refresh(user: User): Promise<AuthResponse> {
    const accessToken = await this.generateToken(
      user.userID,
      'access',
      AccessValidity,
    );
    const refreshToken = await this.generateToken(
      user.userID,
      'refresh',
      RefreshValidity,
    );
    return { accessToken, refreshToken };
  }

  async detail(identity: string): Promise<User> {
    const query = this.userRepository.createQueryBuilder('user');
    query.where(`user.userName=:identity OR user.phone=:identity`, {
      identity,
    });
    try {
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
