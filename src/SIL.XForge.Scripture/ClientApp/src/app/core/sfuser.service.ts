import { Injectable } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';

import { JSONAPIService } from '@xforge-common/jsonapi.service';
import { UserService } from '@xforge-common/user.service';
import { SFProject } from '../shared/models/sfproject';
import { SFProjectUser } from '../shared/models/sfproject-user';
import { SFUser } from '../shared/models/sfuser';

@Injectable({
  providedIn: 'root'
})
export class SFUserService extends UserService<SFUser> {
  constructor(jsonApiService: JSONAPIService, oauthService: OAuthService) {
    super(jsonApiService, oauthService);
  }

  localGetProjects(user: SFUser): SFProject[] {
    return this.jsonApiService.localGetMany<SFProjectUser>(user.projects)
      .map(pu => this.jsonApiService.localGet<SFProject>(pu.project));
  }
}
