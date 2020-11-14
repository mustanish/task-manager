import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import {
  VerifyIdentityRequest,
  VerifyOtpRequest,
  SignUpRequest,
  SignInRequest,
} from '@taskmanager/requests';
import { AuthResponse } from '@taskmanager/responses';
import { User } from '@taskmanager/entities';
import { AuthService } from './auth.service';
import { UserDetail } from '../user/user.decorator';
import { JwtGuard } from './jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(200)
  @Post('/verifyIdentity')
  async verifyIdentity(
    @Body(ValidationPipe) request: VerifyIdentityRequest,
  ): Promise<AuthResponse> {
    return this.authService.verifyIdentity(request);
  }

  @HttpCode(200)
  @Post('/verifyOtp')
  @UseGuards(JwtGuard)
  verifyOtp(
    @UserDetail() user: User,
    @Body(ValidationPipe) request: VerifyOtpRequest,
  ): Promise<AuthResponse> {
    return this.authService.verifyOtp(user, request);
  }

  @HttpCode(200)
  @Post('/signUp')
  @UseGuards(JwtGuard)
  signUp(
    @UserDetail() user: User,
    @Body(ValidationPipe) request: SignUpRequest,
  ) {
    return this.authService.signUp(user, request);
  }

  @HttpCode(200)
  @Post('/signIn')
  signIn(@Body(ValidationPipe) request: SignInRequest) {
    return this.authService.signIn(request);
  }

  @HttpCode(200)
  @Post('/refresh')
  @UseGuards(JwtGuard)
  refresh(@UserDetail() user: User) {
    return this.authService.refresh(user);
  }
}
