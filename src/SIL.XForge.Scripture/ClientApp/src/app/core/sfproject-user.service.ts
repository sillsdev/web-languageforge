import { Injectable } from '@angular/core';

import { JsonApiService } from 'xforge-common/json-api.service';
import { ProjectUserService } from 'xforge-common/project-user.service';
import { SFProjectRef } from './models/sfproject';
import { SFProjectUser } from './models/sfproject-user';
import { SFUserRef } from './models/sfuser';

@Injectable({
  providedIn: 'root'
})
export class SFProjectUserService extends ProjectUserService<SFProjectUser> {
  constructor(jsonApiService: JsonApiService) {
    super(SFProjectUser.TYPE, jsonApiService);
  }

  protected newProjectUser(projectId: string, userId: string, role?: string): SFProjectUser {
    return new SFProjectUser({
      user: new SFUserRef(userId),
      project: new SFProjectRef(projectId),
      role
    });
  }
}
