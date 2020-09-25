import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { VerifyIdentity, VerifyOtp, SignUp, SignIn } from '@taskmanager/requests';
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
    @Body(ValidationPipe) request: VerifyIdentity,
  ): Promise<AuthResponse> {
    return this.authService.verifyIdentity(request);
  }

  @HttpCode(200)
  @Post('/verifyOtp')
  @UseGuards(JwtGuard)
  verifyOtp(
    @UserDetail() user: User,
    @Body(ValidationPipe) request: VerifyOtp,
  ): Promise<AuthResponse> {
    return this.authService.verifyOtp(user, request);
  }

  @HttpCode(200)
  @Post('/signup')
  @UseGuards(JwtGuard)
  signUp(@UserDetail() user: User, @Body(ValidationPipe) request: SignUp) {
    return this.authService.signUp(user, request);
  }

  @HttpCode(200)
  @Post('/signin')
  signIn(@Body(ValidationPipe) request: SignIn) {
    return this.authService.signIn(request);
  }

  @HttpCode(200)
  @Post('/refresh')
  @UseGuards(JwtGuard)
  refresh(@UserDetail() user: User) {
    return this.authService.refresh(user);
  }
}
