import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AuthService } from './auth.service';
import { JsonApiService, QueryObservable } from './json-api.service';
import { ProjectUser } from './models/project-user';
import { User } from './models/user';
import { ResourceService } from './resource.service';
import { nameof } from './utils';

/**
 * Provides operations on user objects. See also SFUserService.
 */
@Injectable()
export abstract class UserService extends ResourceService {
  constructor(jsonApiService: JsonApiService, private readonly authService: AuthService) {
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

  /** Get currently-logged in user. */
  getUser(): QueryObservable<User> {
    return this.jsonApiService.get<User>(this.identity(this.currentUserId));
  }

  /**
   * Update user attributes in database optimistically.
   * Pass a Partial<User> specifying the attributes to update.
   */
  updateUserAttributes(updatedAttributes: Partial<User>): Promise<User> {
    return this.jsonApiService.updateAttributes<User>(this.identity(this.currentUserId), updatedAttributes);
  }

  onlineAddUser(userAccountDetail: any): Promise<any> {
    return this.jsonApiService.onlineCreate(userAccountDetail);
  }

  onlineUpdateUser(updateUser: any): Promise<any> {
    let attrs: Partial<User> = {};
    if (updateUser.Password) {
      attrs = { active: updateUser.Active, email: updateUser.Email, name: updateUser.Name,
        role: updateUser.Role, username: updateUser.Username, password: updateUser.Password
      };
    } else {
      attrs = {
        active: updateUser.Active, email: updateUser.Email, name: updateUser.Name,
        role: updateUser.Role, username: updateUser.Username
      };
    }
    return this.jsonApiService.onlineUpdateAttributes(this.identity(updateUser.Id), attrs);
  }

  onlineGetUser(userId: string): Observable<any> {
    return this.jsonApiService.onlineGet(this.identity(userId));
  }

  onlineDeleteUser(userId: string): Promise<any> {
    return this.jsonApiService.onlineDelete(this.identity(userId));
  }
}
