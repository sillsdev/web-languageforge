import { Injectable } from '@angular/core';

import { JsonRpcService } from 'xforge-common/json-rpc.service';
import { ExternalSignUpResult } from './models/external-sign-up-result';
import { LinkAccountResult } from './models/link-account-result';
import { LogInResult } from './models/log-in-result';
import { SignUpResult } from './models/sign-up-result';

@Injectable()
export class IdentityService {
  constructor(private readonly jsonRpcService: JsonRpcService) {}

  logIn(userIdentifier: string, password: string, rememberLogIn: boolean, returnUrl?: string): Promise<LogInResult> {
    return this.invoke('logIn', userIdentifier, password, rememberLogIn, returnUrl);
  }

  forgotPassword(userIdentifier: string): Promise<boolean> {
    return this.invoke('forgotPassword', userIdentifier);
  }

  resetPassword(key: string, password: string): Promise<boolean> {
    return this.invoke('resetPassword', key, password);
  }

  verifyCaptcha(userResponse: string): Promise<boolean> {
    return this.invoke('verifyRecaptcha', userResponse);
  }

  signUp(name: string, password: string, email: string): Promise<SignUpResult> {
    return this.invoke('signUp', name, password, email);
  }

  resendLink(email: string): Promise<string> {
    return this.invoke('sendEmailVerificationLink', email);
  }

  verifyInvitedUser(email: string): Promise<boolean> {
    return this.invoke('verifyInvitedUser', email);
  }

  verifyEmail(key: string): Promise<boolean> {
    return this.invoke('verifyEmail', key);
  }

  verifyResetPasswordKey(key: string): Promise<boolean> {
    return this.invoke('verifyResetPasswordKey', key);
  }

  externalSignUp(): Promise<ExternalSignUpResult> {
    return this.invoke('externalSignUp');
  }

  linkAccount(userIdentifier: string, password: string): Promise<LinkAccountResult> {
    return this.invoke('linkAccount', userIdentifier, password);
  }

  private async invoke<T>(method: string, ...params: any[]): Promise<T> {
    return this.jsonRpcService.invoke<T>('identity-api', method, params);
  }
}
