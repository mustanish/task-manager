import {
  Injectable,
  PipeTransform,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { TaskStatus } from '@taskmanager/enums';

@Injectable()
export class TaskStatusValidation implements PipeTransform {
  transform(value: any) {
    if (!Object.values(TaskStatus).includes(value.toUpperCase())) {
      throw new HttpException(
        `${value} is an invalid status, please enter a valid status`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
