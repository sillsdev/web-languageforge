import { Injectable } from '@angular/core';

import { JSONAPIService } from '@xforge-common/jsonapi.service';
import { ResourceService } from '@xforge-common/resource.service';
import { ProjectUser } from './models/project-user';

@Injectable()
export class ProjectUserService<T extends ProjectUser = ProjectUser> extends ResourceService {
  constructor(jsonApiService: JSONAPIService) {
    super(ProjectUser.TYPE, jsonApiService);
  }

  onlineCreate(projectUser: T): Promise<string> {
    return this.jsonApiService.onlineCreate(projectUser);
  }
}
