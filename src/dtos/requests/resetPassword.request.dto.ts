import { IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class ResetPassword {
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(20)
  password: string;
}
