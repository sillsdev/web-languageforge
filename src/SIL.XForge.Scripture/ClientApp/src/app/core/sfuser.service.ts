import { Injectable } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { Observable } from 'rxjs';

import { JSONAPIService } from '@xforge-common/jsonapi.service';
import { SFUser } from '../shared/models/sfuser';

@Injectable({
  providedIn: 'root'
})
export class SFUserService {
  constructor(private readonly jsonApiService: JSONAPIService, private readonly oauthService: OAuthService) { }

  get currentUserId(): string {
    const claims = this.oauthService.getIdentityClaims();
    return claims['sub'];
  }

  onlineGetCurrentUser(): Observable<SFUser> {
    return this.jsonApiService.onlineGet({ type: SFUser.TYPE, id: this.currentUserId });
  }
}
