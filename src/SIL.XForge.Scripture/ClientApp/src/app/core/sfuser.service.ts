import { Injectable } from '@angular/core';

import { AuthService } from '@xforge-common/auth.service';
import { JSONAPIService } from '@xforge-common/jsonapi.service';
import { UserService } from '@xforge-common/user.service';
import { SFProject } from './models/sfproject';
import { SFProjectUser } from './models/sfproject-user';
import { SFUser } from './models/sfuser';

@Injectable({
  providedIn: 'root'
})
export class SFUserService extends UserService<SFUser> {
  constructor(jsonApiService: JSONAPIService, authService: AuthService) {
    super(jsonApiService, authService);
  }

  localGetProjects(user: SFUser | string): SFProject[] {
    if (typeof user === 'string') {
      user = this.jsonApiService.localGet(this.identity(user));
    }
    return this.jsonApiService.localGetMany<SFProjectUser>(user.projects)
      .map(pu => this.jsonApiService.localGet<SFProject>(pu.project));
  }
}
