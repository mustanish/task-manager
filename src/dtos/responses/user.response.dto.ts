import { AuthResponse, ProfileResponse } from '@taskmanager/responses';

export interface UserResponse {
  token: AuthResponse;
  user: ProfileResponse;
}
