import { Injectable } from '@angular/core';

import { JsonApiService } from './json-api.service';
import { ProjectRef } from './models/project';
import { ProjectUser } from './models/project-user';
import { User, UserRef } from './models/user';
import { ResourceService } from './resource.service';

@Injectable()
export class ProjectUserService<T extends ProjectUser = ProjectUser> extends ResourceService {
  constructor(jsonApiService: JsonApiService) {
    super(ProjectUser.TYPE, jsonApiService);
  }

  onlineCreate(projectId: string, userId: string, role?: string): Promise<T> {
    const newProjectUser = this.jsonApiService.newResource<ProjectUser>(this.type, {
      user: this.jsonApiService.newResourceRef<UserRef>({ type: User.TYPE, id: userId }),
      project: this.jsonApiService.newResourceRef<ProjectRef>(this.identity(projectId)),
      role
    }) as T;
    return this.jsonApiService.onlineCreate(newProjectUser);
  }

  onlineDelete(id: string): Promise<void> {
    return this.jsonApiService.onlineDelete(this.identity(id));
  }

  async onlineUpdateRole(id: string, role: string): Promise<void> {
    await this.jsonApiService.onlineUpdateAttributes<ProjectUser>(this.identity(id), { role });
  }
}
