import { IsIn, IsNotEmpty, Matches } from 'class-validator';
import { Platform, VerificationType } from '@taskmanager/enums';
import { PhoneRegex, InvalidPhone } from '@taskmanager/constants';

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
