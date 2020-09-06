import { AuthResponse, ProfileResponse } from '@groome/responses';

export interface UserResponse {
  token: AuthResponse;
  user: ProfileResponse;
}
