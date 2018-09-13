import { Injectable } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';

import { BaseResourceService } from './base-resource-service';
import { JSONAPIService } from './json-api.service';
import { UserAttributes, UserResource } from './resources/user-resource';

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseResourceService<UserResource, UserAttributes> {
  constructor(jsonApiService: JSONAPIService, private readonly oauthService: OAuthService) {
    super(jsonApiService);
  }

  get type(): string {
    return 'user';
  }

  get currentUserId(): string {
    const claims = this.oauthService.getIdentityClaims();
    return claims['sub'];
  }

}
