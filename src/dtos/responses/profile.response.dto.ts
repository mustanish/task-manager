import { UserType } from '@taskmanager/enums';

export interface ProfileResponse {
  name: string;
  userName?: string;
  phone: string;
  phoneVerified: boolean;
  type: UserType;
}
