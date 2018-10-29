import { Injectable } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';

import { GetAllParameters, JSONAPIService } from './jsonapi.service';
import { LiveQueryObservable } from './live-query-observable';
import { User } from './models/user';
import { ResourceService } from './resource.service';

@Injectable()
export class UserService<T extends User = User> extends ResourceService {
  constructor(jsonApiService: JSONAPIService, private readonly oauthService: OAuthService) {
    super(User.TYPE, jsonApiService);
  }

  get currentUserId(): string {
    const claims = this.oauthService.getIdentityClaims();
    return claims['sub'];
  }

  onlineChangePassword(newPassword: string): Promise<void> {
    const attrs: Partial<User> = { password: newPassword };
    return this.jsonApiService.onlineUpdateAttributes(this.identity(this.currentUserId), attrs, false);
  }

  getAll(parameters?: GetAllParameters<T>, include?: string[]): LiveQueryObservable<T[]> {
    return this.jsonApiService.getAll(this.type, parameters, include);
  }
}
