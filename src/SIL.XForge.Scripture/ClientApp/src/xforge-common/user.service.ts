import { Injectable } from '@angular/core';
import { RecordIdentity } from '@orbit/data';
import { OAuthService } from 'angular-oauth2-oidc';
import { Observable } from 'rxjs';

import { JSONAPIService } from './jsonapi.service';
import { ResourceRelationships } from './models/resource';
import { User, UserAttributes, UserContants } from './models/user';
import { ResourceService } from './resource.service';

@Injectable({
  providedIn: 'root'
})
export class UserService extends ResourceService<User, UserAttributes, ResourceRelationships> {
  constructor(jsonApiService: JSONAPIService, private readonly oauthService: OAuthService) {
    super(jsonApiService, UserContants.TYPE);
  }

  get currentUserId(): string {
    const claims = this.oauthService.getIdentityClaims();
    return claims['sub'];
  }

  currentUserIdentity(): RecordIdentity {
    return this.identity(this.currentUserId);
  }

  onlineGetCurrentUser(): Observable<User> {
    return this.jsonApiService.query(q => q.findRecord(this.identity(this.currentUserId)));
  }
}
