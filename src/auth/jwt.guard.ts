import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Unauthorized } from '@taskmanager/constants';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  handleRequest(err, user) {
    if (err || !user) {
      throw new HttpException(Unauthorized, HttpStatus.UNAUTHORIZED);
    }
    return user;
  }
}
