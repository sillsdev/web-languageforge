import { Injectable } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';

import { JSONAPIService } from './jsonapi.service';
import { User } from './models/user';
import { ResourceService } from './resource.service';

@Injectable({
  providedIn: 'root'
})
export class UserService extends ResourceService {
  constructor(jsonApiService: JSONAPIService, private readonly oauthService: OAuthService) {
    super(User.TYPE, jsonApiService);
  }

  get currentUserId(): string {
    const claims = this.oauthService.getIdentityClaims();
    return claims['sub'];
  }

  onlineChangePassword(newPassword: string): Promise<void> {
    return this.jsonApiService.onlineUpdateAttributes(this.identity(this.currentUserId), { password: newPassword },
      false);
  }
}
