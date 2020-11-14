import {
  PhoneRegex,
  InvalidPhone,
  UserNameRegex,
  InvalidUserName,
  NameRegex,
} from '@taskmanager/constants';
import { IsNotEmpty, IsOptional, Matches } from 'class-validator';

export class UpdateProfileRequest {
  @IsNotEmpty()
  @IsOptional()
  @Matches(NameRegex, { message: InvalidPhone })
  name: string;

  @IsNotEmpty()
  @IsOptional()
  @Matches(UserNameRegex, { message: InvalidUserName })
  userName: string;

  @IsNotEmpty()
  @IsOptional()
  @Matches(PhoneRegex, { message: InvalidPhone })
  phone: string;
}
