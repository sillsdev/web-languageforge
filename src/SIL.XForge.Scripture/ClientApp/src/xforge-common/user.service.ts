import { Injectable } from '@angular/core';

import { AuthService } from './auth.service';
import { GetAllParameters, JSONAPIService } from './jsonapi.service';
import { LiveQueryObservable } from './live-query-observable';
import { User } from './models/user';
import { ResourceService } from './resource.service';

@Injectable()
export class UserService<T extends User = User> extends ResourceService {
  constructor(jsonApiService: JSONAPIService, private readonly authService: AuthService) {
    super(User.TYPE, jsonApiService);
  }

  get currentUserId(): string {
    return this.authService.currentUserId;
  }

  onlineChangePassword(newPassword: string): Promise<void> {
    const attrs: Partial<User> = { password: newPassword };
    return this.jsonApiService.onlineUpdateAttributes(this.identity(this.currentUserId), attrs, false);
  }

  getAll(parameters?: GetAllParameters<T>, include?: string[]): LiveQueryObservable<T[]> {
    return this.jsonApiService.getAll(this.type, parameters, include);
  }
}
