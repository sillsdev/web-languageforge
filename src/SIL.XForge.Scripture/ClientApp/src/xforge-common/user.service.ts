import { Injectable } from '@angular/core';

import { AuthService } from './auth.service';
import { JSONAPIService, QueryObservable } from './jsonapi.service';
import { ProjectUser } from './models/project-user';
import { User } from './models/user';
import { ResourceService } from './resource.service';
import { nameof } from './utils';

@Injectable()
export abstract class UserService extends ResourceService {
  constructor(jsonApiService: JSONAPIService, private readonly authService: AuthService) {
    super(User.TYPE, jsonApiService);
  }

  get currentUserId(): string {
    return this.authService.currentUserId;
  }

  async onlineChangePassword(newPassword: string): Promise<void> {
    const attrs: Partial<User> = { password: newPassword };
    await this.jsonApiService.onlineUpdateAttributes(this.identity(this.currentUserId), attrs);
  }

  onlineGetProjects(id: string): QueryObservable<ProjectUser[]> {
    return this.jsonApiService.onlineGetAllRelated(this.identity(id), nameof<User>('projects'));
  }
}
