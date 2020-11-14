import { Length } from 'class-validator';

export class VerifyOtpRequest {
  @Length(6, 6)
  otp: string;
}
