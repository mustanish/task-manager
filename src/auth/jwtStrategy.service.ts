import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Token } from '@taskmanager/entities';
import { Unauthorized, ScopedResources } from '@taskmanager/constants';
import { CacheService } from '../services/cache.service';
import { JwtPayload } from './jwtpayload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private cacheService: CacheService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('server.jwtSecret'),
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: JwtPayload): Promise<User> {
    const [route, { tokenID, scope }] = [request.url, payload];
    if (!this.tokenScope(scope, route))
      throw new HttpException(Unauthorized, HttpStatus.UNAUTHORIZED);

    const { userID } = await this.cacheService.get<Token>(tokenID);
    const user = await this.userRepository.findOne({ userID });
    return user;
  }

  tokenScope(scope: string, route: string): boolean {
    return (ScopedResources.includes(route) && route !== `/auth/${scope}`) ||
      (!ScopedResources.includes(route) && scope !== 'all')
      ? false
      : true;
  }
}
