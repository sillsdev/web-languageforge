import { Injectable } from '@angular/core';

import { JsonRpcService } from '@xforge-common/json-rpc.service';
import { LogInResult } from './models/log-in-result';
import { SignUpResult } from './models/sign-up-result';

@Injectable()
export class IdentityService {
  constructor(private readonly jsonRpcService: JsonRpcService) {}

  logIn(user: string, password: string, rememberLogIn: boolean, returnUrl?: string): Promise<LogInResult> {
    return this.invoke('logIn', user, password, rememberLogIn, returnUrl);
  }

  forgotPassword(user: string): Promise<boolean> {
    return this.invoke('forgotPassword', user);
  }

  resetPassword(key: string, password: string): Promise<boolean> {
    return this.invoke('resetPassword', key, password);
  }

  verifyCaptcha(userResponse: string): Promise<boolean> {
    return this.invoke('verifyRecaptcha', userResponse);
  }

  signUp(name: string, password: string, email: string, recaptcha: string): Promise<SignUpResult> {
    return this.invoke('signUp', name, password, email, recaptcha);
  }

  verifyEmail(key: string): Promise<boolean> {
    return this.invoke('verifyEmail', key);
  }

  verifyResetPasswordKey(key: string): Promise<boolean> {
    return this.invoke('verifyResetPasswordKey', key);
  }

  async verifyInvitedUser(email: string): Promise<boolean> {
    const result = await this.callApi('verify-invited-user', { email } as VerifyInvitedUserParams);
    return result.success;
  }

  private async invoke<T>(method: string, ...params: any[]): Promise<T> {
    return this.jsonRpcService.invoke<T>('identity-api', method, params);
  }
}
