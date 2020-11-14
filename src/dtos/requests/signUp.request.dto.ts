import {
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsAlpha,
  IsString,
} from 'class-validator';

export class SignUpRequest {
  @IsNotEmpty()
  @IsAlpha()
  name: string;

  @IsString()
  @MinLength(4)
  @MaxLength(20)
  password: string;
}
