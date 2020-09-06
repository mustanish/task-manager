import { IsNotEmpty, MinLength, MaxLength, IsString } from 'class-validator';

export class SignIn {
  @IsNotEmpty()
  identity: string;

  @IsString()
  @MinLength(4)
  @MaxLength(20)
  password: string;
}
