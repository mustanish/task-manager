import { OtpDev } from '@groome/constants';
import { generate } from 'otp-generator';
import { cloneDeep, difference } from 'lodash';

export function generateOTP(length): string {
  return process.env.NODE_ENV !== 'development'
    ? generate(length, { specialChars: false })
    : OtpDev;
}

export function copy<T>(target: T, source: object): T {
  Object.keys(target).forEach(key => {});
  return target;
}
