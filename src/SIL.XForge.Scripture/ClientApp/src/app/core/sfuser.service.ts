import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/internal/operators/map';

import { AuthService } from '@xforge-common/auth.service';
import { JSONAPIService } from '@xforge-common/jsonapi.service';
import { UserService } from '@xforge-common/user.service';
import { nameof } from '@xforge-common/utils';
import { SFProject } from './models/sfproject';
import { SFProjectUser } from './models/sfproject-user';
import { SFUser } from './models/sfuser';


@Injectable({
  providedIn: 'root'
})
export class SFUserService extends UserService {
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

  getAllUserProjects(): Observable<any> {
    const users$ = this.jsonApiService.onlineGetAll(SFUser.TYPE, undefined,
      [nameof<SFUser>('projects'), nameof<SFProjectUser>('project')]);
    const usersAndProjects$ = users$.pipe(map(users =>
      users.results.map(user => ({ user, projectNames: this.localGetProjects(user).map(p => p.projectName) }))));
    return usersAndProjects$;
  }
}
