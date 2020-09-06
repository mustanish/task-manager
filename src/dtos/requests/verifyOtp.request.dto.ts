import { Length } from 'class-validator';

export class VerifyOtp {
  @Length(6, 6)
  otp: string;
}
