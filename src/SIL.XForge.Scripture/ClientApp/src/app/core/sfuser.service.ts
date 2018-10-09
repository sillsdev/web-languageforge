import { Injectable } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';

import { RecordIdentity } from '@orbit/data';
import { JSONAPIService } from '@xforge-common/jsonapi.service';
import { identity } from '@xforge-common/resource-utils';
import { Observable } from 'rxjs';
import { SFUser, SFUSER } from '../shared/models/sfuser';

@Injectable({
  providedIn: 'root'
})
export class SFUserService {
  constructor(private readonly jsonApiService: JSONAPIService, private readonly oauthService: OAuthService) { }

  get currentUserId(): string {
    const claims = this.oauthService.getIdentityClaims();
    return claims['sub'];
  }

  currentUserIdentity(): RecordIdentity {
    return identity(SFUSER, this.currentUserId);
  }

  onlineGetCurrentUser(): Observable<SFUser> {
    return this.jsonApiService.query(q => q.findRecord(identity(SFUSER, this.currentUserId)));
  }
}
