import { Injectable } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';

import { BaseResourceService } from './base-resource-service';
import { JSONAPIService } from './json-api.service';
import { User, UserAttributes, UserContants } from './resources/user';

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseResourceService<User, UserAttributes> {
  constructor(jsonApiService: JSONAPIService, private readonly oauthService: OAuthService) {
    super(jsonApiService);
  }

  get type(): string {
    return UserContants.TYPE;
  }

  get currentUserId(): string {
    const claims = this.oauthService.getIdentityClaims();
    return claims['sub'];
  }

}
