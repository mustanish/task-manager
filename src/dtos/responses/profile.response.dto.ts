import { UserType } from '@groome/enums';

export interface ProfileResponse {
  name: string;
  userName?: string;
  phone: string;
  phoneVerified: boolean;
  type: UserType;
}
