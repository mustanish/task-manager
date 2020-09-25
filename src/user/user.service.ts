import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResetPassword, ChangePassword, UpdateProfile } from '@taskmanager/requests';
import { ProfileResponse, MessageResponse } from '@taskmanager/responses';
import { User } from '@taskmanager/entities';
import {
  Unavailable,
  InvalidCredentials,
  UniquePhone,
  UpdatePassword,
} from '@taskmanager/constants';
import { ErrorCode } from '@taskmanager/enums';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private authService: AuthService,
  ) {}

  async resetPassword(
    user: User,
    request: ResetPassword,
  ): Promise<MessageResponse> {
    try {
      await this.userRepository.save({
        ...user,
        password: await user.hashPassword(request.password),
      });
      return { message: UpdatePassword };
    } catch (error) {
      throw new HttpException(Unavailable, HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async changePassword(
    user: User,
    request: ChangePassword,
  ): Promise<MessageResponse> {
    try {
      if (!(await user.comparePassword(request.oldPassword))) {
        throw new HttpException(InvalidCredentials, HttpStatus.UNAUTHORIZED);
      }
      await this.userRepository.save({
        ...user,
        password: await user.hashPassword(request.newPassword),
      });
      return { message: UpdatePassword };
    } catch (error) {
      throw new HttpException(Unavailable, HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async profile(identity: string): Promise<ProfileResponse> {
    return await (await this.authService.detail(identity)).profile();
  }

  async updateProfile(
    user: User,
    request: UpdateProfile,
  ): Promise<ProfileResponse> {
    try {
      await this.userRepository.save({
        ...user,
        name: request.name,
        userName: request.userName,
        phone: request.phone,
      });
      return this.profile(user.phone);
    } catch (error) {
      if (error.code === ErrorCode.UNIQUE)
        throw new HttpException(UniquePhone, HttpStatus.CONFLICT);
      throw new HttpException(Unavailable, HttpStatus.SERVICE_UNAVAILABLE);
    }
  }
}
