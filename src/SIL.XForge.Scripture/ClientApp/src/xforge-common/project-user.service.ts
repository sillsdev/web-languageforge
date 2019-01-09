import { Injectable } from '@angular/core';

import { JsonApiService } from './json-api.service';
import { ProjectUser } from './models/project-user';
import { ResourceService } from './resource.service';

@Injectable()
export abstract class ProjectUserService<T extends ProjectUser = ProjectUser> extends ResourceService {
  constructor(type: string, jsonApiService: JsonApiService) {
    super(type, jsonApiService);
  }

  onlineCreate(projectId: string, userId: string, role?: string): Promise<T> {
    return this.jsonApiService.onlineCreate(this.newProjectUser(projectId, userId, role));
  }

  onlineDelete(id: string): Promise<void> {
    return this.jsonApiService.onlineDelete(this.identity(id));
  }

  async onlineUpdateRole(id: string, role: string): Promise<void> {
    await this.jsonApiService.onlineUpdateAttributes<ProjectUser>(this.identity(id), { role });
  }

  protected abstract newProjectUser(projectId: string, userId: string, role?: string): T;
}
