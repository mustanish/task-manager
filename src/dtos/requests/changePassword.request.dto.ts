import { MinLength, MaxLength, IsString } from 'class-validator';

export class ChangePasswordRequest {
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  oldPassword: string;

  @IsString()
  @MinLength(4)
  @MaxLength(20)
  newPassword: string;
}
