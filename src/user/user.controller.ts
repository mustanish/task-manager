import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  Get,
  UseGuards,
  Param,
  Patch,
} from '@nestjs/common';
import {
  ResetPasswordRequest,
  ChangePasswordRequest,
  UpdateProfileRequest,
} from '@taskmanager/requests';
import { User } from '@taskmanager/entities';
import { IdentityValidation } from '@taskmanager/pipes';
import { UserService } from './user.service';
import { UserDetail } from './user.decorator';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('user')
@UseGuards(JwtGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Patch('/resetPassword')
  resetPassword(
    @UserDetail() user: User,
    @Body(ValidationPipe) request: ResetPasswordRequest,
  ) {
    return this.userService.resetPassword(user, request);
  }

  @Patch('/changePassword')
  changePassword(
    @UserDetail() user: User,
    @Body(ValidationPipe) request: ChangePasswordRequest,
  ) {
    return this.userService.changePassword(user, request);
  }

  @Get('/:identity')
  profile(@Param('identity', IdentityValidation) identity: string) {
    return this.userService.profile(identity);
  }

  @Patch('/')
  updateProfile(
    @UserDetail() user: User,
    @Body(ValidationPipe) request: UpdateProfileRequest,
  ) {
    return this.userService.updateProfile(user, request);
  }
}
