import { Injectable } from '@angular/core';

import { JsonApiService } from './json-api.service';
import { ProjectUser } from './models/project-user';
import { ResourceService } from './resource.service';

@Injectable()
export abstract class ProjectUserService<T extends ProjectUser = ProjectUser> extends ResourceService {
  constructor(
    type: string,
    jsonApiService: JsonApiService,
    private readonly projectType: string,
    private readonly userType: string
  ) {
    super(type, jsonApiService);
  }

  onlineCreate(projectId: string, userId: string, role?: string): Promise<T> {
    const init: Partial<ProjectUser> = {
      project: this.jsonApiService.newResourceRef({ type: this.projectType, id: projectId }),
      user: this.jsonApiService.newResourceRef({ type: this.userType, id: userId }),
      role
    };
    return this.jsonApiService.onlineCreate(this.jsonApiService.newResource(this.type, init) as T);
  }

  onlineDelete(id: string): Promise<void> {
    return this.jsonApiService.onlineDelete(this.identity(id));
  }

  async onlineUpdateRole(id: string, role: string): Promise<void> {
    await this.jsonApiService.onlineUpdateAttributes<ProjectUser>(this.identity(id), { role });
  }

  update(projectUser: T): Promise<T> {
    return this.jsonApiService.update(projectUser);
  }
}
