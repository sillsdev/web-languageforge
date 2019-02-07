import { Injectable } from '@angular/core';

import { JsonApiService } from 'xforge-common/json-api.service';
import { ProjectUserService } from 'xforge-common/project-user.service';
import { SFProject } from './models/sfproject';
import { SFProjectUser } from './models/sfproject-user';
import { SFUser } from './models/sfuser';

@Injectable({
  providedIn: 'root'
})
export class SFProjectUserService extends ProjectUserService<SFProjectUser> {
  constructor(jsonApiService: JsonApiService) {
    super(SFProjectUser.TYPE, jsonApiService, SFProject.TYPE, SFUser.TYPE);
  }
}
