import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { VerifyTokenParams } from '@identity/models/verify-token-params';
import { ForgotPasswordParams } from './models/forgot-password-params';
import { IdentityResult } from './models/identity-result';
import { LogInParams } from './models/log-in-params';
import { LogInResult } from './models/log-in-result';
import { ResetPasswordParams } from './models/reset-password-params';
import { SendInviteParams } from './models/send-invite-params';
import { SendInviteResult } from './models/send-invite-result';
import { SignUpParams } from './models/sign-up-params';
import { SignUpResult } from './models/sign-up-result';
import { VerifyEmailParams } from './models/verify-email-params';
import { VerifyRecaptchaParams } from './models/verify-recaptcha-params';

@Injectable()
export class IdentityService {
  constructor(private readonly http: HttpClient) {}

  logIn(params: LogInParams): Promise<LogInResult> {
    return this.callApi('log-in', params);
  }

  async forgotPassword(user: string): Promise<boolean> {
    const result = await this.callApi('forgot-password', { user } as ForgotPasswordParams);
    return result.success;
  }

  async resetPassword(params: ResetPasswordParams): Promise<boolean> {
    const result = await this.callApi('reset-password', params);
    return result.success;
  }

  async sendInvite(email: string): Promise<SendInviteResult> {
    return await this.callApi<SendInviteResult>('send-invite', { email } as SendInviteParams);
  }

  captchaId(): Promise<string> {
    return this.http.get<string>('identity-api/captcha-id').toPromise();
  }

  async verifyCaptcha(userResponse: string): Promise<boolean> {
    const response = { recaptchaResponse: userResponse } as VerifyRecaptchaParams;
    const result = await this.callApi('verify-recaptcha', response);
    return result.success;
  }

  async signUp(params: SignUpParams): Promise<SignUpResult> {
    const result = await this.callApi<SignUpResult>('sign-up', params);
    return result;
  }

  async verifyEmail(key: string): Promise<boolean> {
    const result = await this.callApi('verify-email', { key } as VerifyEmailParams);
    return result.success;
  }

  async verifyToken(token: string): Promise<boolean> {
    const result = await this.callApi('verify-token', { token } as VerifyTokenParams);
    return result.success;
  }

  private async callApi<T extends IdentityResult>(endpoint: string, params: any): Promise<T> {
    return this.http.post<T>('identity-api/' + endpoint, params).toPromise();
  }
}
