import {
  Injectable,
  PipeTransform,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PhoneRegex, UserNameRegex } from '@taskmanager/constants';

@Injectable()
export class IdentityValidation implements PipeTransform {
  transform(value: any) {
    if (!value.match(PhoneRegex) || !value.match(UserNameRegex)) {
      throw new HttpException(
        `${value} is an invalid identity, please pass a valid identity`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return value;
  }
}
