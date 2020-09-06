import { MessageResponse } from '@groome/responses';

export interface AuthResponse extends MessageResponse {
  accessToken: string;
  refreshToken?: string;
}
