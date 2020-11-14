import {
  MinLength,
  MaxLength,
  IsString,
  IsNotEmpty,
  IsIn,
  IsOptional,
} from 'class-validator';
import { TaskStatus } from '@taskmanager/enums';

export class TaskRequest {
  @IsString()
  @MinLength(4)
  @MaxLength(100)
  title: string;

  @IsString()
  @MinLength(4)
  @MaxLength(500)
  @IsOptional()
  description: string;

  @IsNotEmpty()
  @IsIn([TaskStatus.OPEN, TaskStatus.INPROGRESS, TaskStatus.DONE])
  status: TaskStatus;
}
