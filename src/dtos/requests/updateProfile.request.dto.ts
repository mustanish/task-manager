import {
  PhoneRegex,
  InvalidPhone,
  UserNameRegex,
  InvalidUserName,
  NameRegex,
} from '@groome/constants';
import { IsNotEmpty, Matches } from 'class-validator';

export class UpdateProfile {
  @IsNotEmpty()
  @Matches(NameRegex, { message: InvalidPhone })
  name: string;

  @IsNotEmpty()
  @Matches(UserNameRegex, { message: InvalidUserName })
  userName: string;

  @IsNotEmpty()
  @Matches(PhoneRegex, { message: InvalidPhone })
  phone: string;
}
