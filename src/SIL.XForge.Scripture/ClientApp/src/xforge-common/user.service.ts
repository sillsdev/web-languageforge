import { Injectable } from '@angular/core';

import { AuthService } from './auth.service';
import { GetAllParameters, JSONAPIService, QueryObservable } from './jsonapi.service';
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

  async onlineChangePassword(newPassword: string): Promise<void> {
    const attrs: Partial<User> = { password: newPassword };
    await this.jsonApiService.onlineUpdateAttributes(this.identity(this.currentUserId), attrs);
  }

  getAll(parameters?: GetAllParameters<T>, include?: string[]): QueryObservable<T[]> {
    return this.jsonApiService.getAll(this.type, parameters, include);
  }
}
