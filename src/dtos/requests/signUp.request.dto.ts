import {
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsIn,
  IsAlpha,
  IsString,
  Matches,
} from 'class-validator';
import { UserType } from '@taskmanager/enums';

export class SignUp {
  @IsNotEmpty()
  @IsAlpha()
  name: string;

  @IsString()
  @MinLength(4)
  @MaxLength(20)
  password: string;

  @IsNotEmpty()
  @IsIn([UserType.OWNER, UserType.EMPLOYEE, UserType.CUSTOMER])
  type: UserType;
}
