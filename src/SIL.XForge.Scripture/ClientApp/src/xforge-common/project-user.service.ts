import { JsonApiService } from './json-api.service';
import { ProjectUser } from './models/project-user';
import { UserRef } from './models/user';
import { ResourceService } from './resource.service';

export abstract class ProjectUserService<T extends ProjectUser = ProjectUser> extends ResourceService {
  constructor(type: string, jsonApiService: JsonApiService, private readonly projectType: string) {
    super(type, jsonApiService);
  }

  onlineCreate(projectId: string, userId: string, role?: string): Promise<T> {
    const init: Partial<ProjectUser> = {
      project: this.jsonApiService.newResourceRef({ type: this.projectType, id: projectId }),
      user: new UserRef(userId),
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

  update(projectUser: T): Promise<void> {
    return this.jsonApiService.update(projectUser);
  }
}
