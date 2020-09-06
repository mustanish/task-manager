import { IsIn, IsNotEmpty, Matches } from 'class-validator';
import { Platform, VerificationType } from '@groome/enums';
import { PhoneRegex, InvalidPhone } from '@groome/constants';

export class VerifyIdentity {
  @IsNotEmpty()
  @Matches(PhoneRegex, { message: InvalidPhone })
  phone: string;

  @IsNotEmpty()
  @IsIn([
    Platform.FACEBOOK,
    Platform.GOOGLE,
    Platform.WHATSAPP,
    Platform.NORMAL,
  ])
  platform: Platform;

  @IsNotEmpty()
  @IsIn([VerificationType.CREATEACCOUNT, VerificationType.FORGOTACCOUNT])
  type: VerificationType;
}
