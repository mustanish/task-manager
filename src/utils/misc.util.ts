import { generate } from 'otp-generator';
import { OtpDev, Envs } from '@taskmanager/constants';

export function generateOTP(length): string {
  return Envs.includes(process.env.NODE_ENV)
    ? OtpDev
    : generate(length, { specialChars: false });
}

/*export function copy<T>(target: T, source: object): T {
  Object.keys(target).forEach(key => {});
  return target;
}*/
