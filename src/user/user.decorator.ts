import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@taskmanager/entities';

export const UserDetail = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
