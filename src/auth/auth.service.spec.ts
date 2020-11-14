import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '@taskmanager/entities';
import {
  VerifyIdentityRequest,
  VerifyOtpRequest,
  SignInRequest,
  SignUpRequest,
} from '@taskmanager/requests';
import { ProfileResponse } from '@taskmanager/responses';
import { ErrorCode, Platform, VerificationType } from '@taskmanager/enums';
import {
  UniquePhone,
  InvalidPhone,
  OTPMsg,
  Unavailable,
  OtpValidity,
  InvalidOTP,
  InvalidCredentials,
} from '@taskmanager/constants';
import { addTime } from '@taskmanager/utils';
import { AuthService } from './auth.service';
import { CacheService } from '../services/cache.service';

const mockuser = new User();

const mockJwtSerivice = () => ({
  sign: jest.fn(),
});

const mockCacheSerivice = () => ({
  set: jest.fn(),
});

const mockUserRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  createQueryBuilder: jest.fn(),
});

describe('AuthService', () => {
  let authService;
  let jwtService;
  let cacheService;
  let userRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useFactory: mockJwtSerivice },
        { provide: CacheService, useFactory: mockCacheSerivice },
        { provide: getRepositoryToken(User), useFactory: mockUserRepository },
      ],
    }).compile();
    authService = module.get(AuthService);
    jwtService = module.get(JwtService);
    cacheService = module.get(CacheService);
    userRepository = module.get(getRepositoryToken(User));
  });

  describe('Verify Identity', () => {
    let queryMethods;

    beforeEach(() => {
      queryMethods = {
        where: jest.fn(),
        getOne: jest.fn(),
      };
      userRepository.create.mockResolvedValue(mockuser);
      userRepository.createQueryBuilder.mockReturnValue(queryMethods);
    });

    const request: VerifyIdentityRequest = {
      phone: `0000000000`,
      platform: Platform.WHATSAPP,
      type: VerificationType.CREATEACCOUNT,
    };

    test(`verify user's identity before signup`, async () => {
      const [id, token] = [`123`, `123`];
      userRepository.save.mockResolvedValue({ id });
      jwtService.sign.mockResolvedValue(token);
      const response = await authService.verifyIdentity(request);
      expect(response.accessToken).toEqual(token);
      expect(response.message).toEqual(OTPMsg);
    });

    test(`verify user's identity before reset password`, async () => {
      const [id, token] = [`123`, `123`];
      queryMethods.getOne.mockResolvedValue(mockuser);
      userRepository.save.mockResolvedValue({ id });
      jwtService.sign.mockResolvedValue(token);
      const response = await authService.verifyIdentity({
        ...request,
        type: VerificationType.FORGOTACCOUNT,
      });
      expect(response.accessToken).toEqual(token);
      expect(response.message).toEqual(OTPMsg);
    });

    test(`throws a ConflictException when user already exist incase of signup`, async () => {
      userRepository.save.mockRejectedValue({ code: ErrorCode.UNIQUE });
      try {
        await authService.verifyIdentity(request);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toEqual(UniquePhone);
        expect(error.status).toEqual(HttpStatus.CONFLICT);
      }
    });

    test(`throws a BadRequestException when user does not exist incase of reset password`, async () => {
      queryMethods.getOne.mockResolvedValue(null);
      try {
        await authService.verifyIdentity({
          ...request,
          type: VerificationType.FORGOTACCOUNT,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toEqual(InvalidPhone);
        expect(error.status).toEqual(HttpStatus.BAD_REQUEST);
      }
    });

    test(`throws a ServiceUnavailableException`, async () => {
      userRepository.save.mockRejectedValue(`unhandled`);
      try {
        await authService.verifyIdentity(request);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toEqual(Unavailable);
        expect(error.status).toEqual(HttpStatus.SERVICE_UNAVAILABLE);
      }
    });
  });

  describe('Verify Otp', () => {
    const request: VerifyOtpRequest = {
      otp: `000000`,
    };

    test(`able to verify otp`, async () => {
      const [id, token] = [`123`, `123`];
      mockuser.compareOtp = jest.fn().mockResolvedValue(true);
      userRepository.save.mockResolvedValue({ id });
      jwtService.sign.mockResolvedValue(token);
      const response = await authService.verifyOtp(
        { ...mockuser, otpValidity: addTime(OtpValidity) },
        request,
      );
      expect(response.accessToken).toEqual(token);
    });

    test(`throws a BadRequestException incase of wrong otp`, async () => {
      mockuser.compareOtp = jest.fn().mockResolvedValue(false);
      try {
        await authService.verifyOtp(
          { ...mockuser, otpValidity: addTime(OtpValidity) },
          request,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toEqual(InvalidOTP);
        expect(error.status).toEqual(HttpStatus.BAD_REQUEST);
      }
    });

    test(`throws a BadRequestException incase of expired otp`, async () => {
      mockuser.compareOtp = jest.fn().mockResolvedValue(true);
      try {
        await authService.verifyOtp(mockuser, request);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toEqual(InvalidOTP);
        expect(error.status).toEqual(HttpStatus.BAD_REQUEST);
      }
    });

    test(`throws a ServiceUnavailableException`, async () => {
      mockuser.compareOtp = jest.fn().mockResolvedValue(true);
      userRepository.save.mockRejectedValue(`unhandled`);
      try {
        await authService.verifyOtp(
          { ...mockuser, otpValidity: addTime(OtpValidity) },
          request,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toEqual(Unavailable);
        expect(error.status).toEqual(HttpStatus.SERVICE_UNAVAILABLE);
      }
    });
  });

  describe('SignUp', () => {
    const request: SignUpRequest = {
      name: `mustanish`,
      password: `test`,
    };

    test(`able to sign up successfully`, async () => {
      const [id, token] = [`123`, `123`];
      const profile: ProfileResponse = {
        name: `mustanish`,
        phone: `123`,
        phoneVerified: true,
      };
      mockuser.profile = jest.fn().mockReturnValue(profile);
      userRepository.save.mockResolvedValue({ id });
      jwtService.sign.mockResolvedValue(token);
      const response = await authService.signUp(mockuser, request);
      expect(response.token.accessToken).toEqual(token);
      expect(response.token.refreshToken).toEqual(token);
      expect(response.user).toEqual(profile);
    });

    test(`throws a ServiceUnavailableException`, async () => {
      userRepository.save.mockRejectedValue(`unhandled`);
      try {
        await authService.signUp(mockuser, request);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toEqual(Unavailable);
        expect(error.status).toEqual(HttpStatus.SERVICE_UNAVAILABLE);
      }
    });
  });

  describe('SignIn', () => {
    let queryMethods;

    beforeEach(() => {
      queryMethods = {
        where: jest.fn(),
        getOne: jest.fn(),
      };
      userRepository.createQueryBuilder.mockReturnValue(queryMethods);
    });

    const request: SignInRequest = {
      identity: `123`,
      password: `123`,
    };

    test(`able to sign in successfully`, async () => {
      const [id, token] = [`123`, `123`];
      const profile: ProfileResponse = {
        name: `mustanish`,
        phone: `123`,
        phoneVerified: true,
      };
      queryMethods.getOne.mockResolvedValue(mockuser);
      mockuser.comparePassword = jest.fn().mockResolvedValue(true);
      mockuser.profile = jest.fn().mockReturnValue(profile);
      userRepository.save.mockResolvedValue({ id });
      jwtService.sign.mockResolvedValue(token);
      const response = await authService.signIn(request);
      expect(response.token.accessToken).toEqual(token);
      expect(response.token.refreshToken).toEqual(token);
      expect(response.user).toEqual(profile);
    });

    test(`throws UnauthorizedException when user does not exist`, async () => {
      queryMethods.getOne.mockResolvedValue(null);
      mockuser.comparePassword = jest.fn().mockResolvedValue(true);
      try {
        await authService.signIn(request);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toEqual(InvalidCredentials);
        expect(error.status).toEqual(HttpStatus.UNAUTHORIZED);
      }
    });

    test(`throws UnauthorizedException when wrong password is provided`, async () => {
      queryMethods.getOne.mockResolvedValue(mockuser);
      mockuser.comparePassword = jest.fn().mockResolvedValue(false);
      try {
        await authService.signIn(request);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toEqual(InvalidCredentials);
        expect(error.status).toEqual(HttpStatus.UNAUTHORIZED);
      }
    });

    test(`throws ServiceUnavailableException`, async () => {
      queryMethods.getOne.mockResolvedValue(mockuser);
      mockuser.comparePassword = jest.fn().mockResolvedValue(true);
      userRepository.save.mockRejectedValue(`unhandled`);
      try {
        await authService.signIn(request);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toEqual(Unavailable);
        expect(error.status).toEqual(HttpStatus.SERVICE_UNAVAILABLE);
      }
    });
  });

  describe('Refresh Token', () => {
    test(`able to reresh token `, async () => {
      const [id, token] = [`123`, `123`];
      userRepository.save.mockResolvedValue({ id });
      jwtService.sign.mockResolvedValue(token);
      const response = await authService.refresh(mockuser);
      expect(response.accessToken).toEqual(token);
      expect(response.refreshToken).toEqual(token);
    });
  });

  describe('Profile Detail', () => {
    let queryMethods;

    beforeEach(() => {
      queryMethods = {
        where: jest.fn(),
        getOne: jest.fn(),
      };
      userRepository.createQueryBuilder.mockReturnValue(queryMethods);
    });

    test(`able to get details of a profile`, async () => {
      queryMethods.getOne.mockResolvedValue(mockuser);
      const response = await authService.detail(`123`);
      expect(userRepository.createQueryBuilder).toHaveBeenCalledWith('user');
      expect(queryMethods.where).toHaveBeenCalledWith(
        `user.userName=:identity OR user.phone=:identity`,
        {
          identity: `123`,
        },
      );
      expect(response).toEqual(mockuser);
    });

    test(`throws a ServiceUnavailableException`, async () => {
      queryMethods.getOne.mockRejectedValue(`unhandled`);
      try {
        await authService.detail(`123`);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toEqual(Unavailable);
        expect(error.status).toEqual(HttpStatus.SERVICE_UNAVAILABLE);
      }
    });
  });

  describe('Generate Token', () => {
    test(`able to generate token`, async () => {
      const token = `123`;
      jwtService.sign.mockResolvedValue(token);
      const response = await authService.generateToken(`123`, `test`, 0);
      expect(response).toEqual(token);
    });
  });
});
