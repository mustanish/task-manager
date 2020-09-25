export const PhoneRegex = /^([0]|\+\d{1,2})?(\d{10}|\d{11})(?:,([0]|\+\d{1,2})?(\d{10}|\d{11}))*$/;

export const UserNameRegex = /^[a-z0-9_-]{3,16}$/;

export const NameRegex = /^[a-zA-Z0-9 ]*$/;

export const TimeStampFormat = `YYYY-MM-DD HH:mm:ss`;

export const TimeUnit = `seconds`;

export const OtpLength = 6;

export const OtpDev = `000000`;

export const OtpValidity = 300;

export const AccessValidity = 3600;

export const RefreshValidity = 604800;

export const ScopedResources = [
  '/auth/verifyOtp',
  '/auth/signUp',
  '/auth/refresh',
];

export const Envs = ['development', 'testing'];
