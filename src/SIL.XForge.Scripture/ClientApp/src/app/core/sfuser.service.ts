import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/internal/operators/map';

import { UserService } from '@xforge-common/user.service';
import { nameof } from '@xforge-common/utils';
import { SFProject } from './models/sfproject';
import { SFProjectUser } from './models/sfproject-user';
import { SFUser } from './models/sfuser';

@Injectable({
  providedIn: 'root'
})
export class SFUserService extends UserService {
  getAllUserProjects(): Observable<any> {
    const users$ = this.jsonApiService.onlineGetAll<SFUser>(SFUser.TYPE, {}, [
      nameof<SFUser>('projects'),
      nameof<SFProjectUser>('project')
    ]);
    return users$.pipe(
      map(users =>
        users.results.map(user => ({
          user,
          projectNames: users
            .getManyIncluded<SFProjectUser>(user.projects)
            .map(pu => users.getIncluded<SFProject>(pu.project))
            .map(p => p.projectName)
        }))
      )
    );
  }
}
