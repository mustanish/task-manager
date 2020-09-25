import { MessageResponse } from '@taskmanager/responses';

export interface AuthResponse extends MessageResponse {
  accessToken: string;
  refreshToken?: string;
}
