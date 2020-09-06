import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SuccessResponse } from '@groome/responses';
import { Success } from '@groome/constants';

@Injectable()
export class TransformResponse<T>
  implements NestInterceptor<T, SuccessResponse<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<SuccessResponse<T>> {
    return next.handle().pipe(
      map(data => ({
        status: Success,
        data,
      })),
    );
  }
}
