import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { VerifyTokenParams } from '@identity/models/verify-token-params';
import { ForgotPasswordParams } from './models/forgot-password-params';
import { IdentityResult } from './models/identity-result';
import { LogInParams } from './models/log-in-params';
import { LogInResult } from './models/log-in-result';
import { ResetPasswordParams } from './models/reset-password-params';
import { SignUpParams } from './models/sign-up-params';
import { VerifyEmailParams } from './models/verify-email-params';

@Injectable()
export class IdentityService {

  constructor(private readonly http: HttpClient) { }

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

  async signUp(params: SignUpParams): Promise<boolean> {
    const result = await this.callApi('sign-up', params);
    return result.success;
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
