import { Injectable } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';

import { Observable } from 'rxjs';
import { JSONAPIService } from './jsonapi.service';
import { User } from './models/user';
import { ResourceService } from './resource.service';

@Injectable({
  providedIn: 'root'
})
export class UserService extends ResourceService {
  constructor(jsonApiService: JSONAPIService, private readonly oauthService: OAuthService) {
    super(User.TYPE, jsonApiService);
  }

  get currentUserId(): string {
    const claims = this.oauthService.getIdentityClaims();
    return claims['sub'];
  }

  onlineChangePassword(newPassword: string): Promise<void> {
    const attrs: Partial<User> = { password: newPassword };
    return this.jsonApiService.onlineUpdateAttributes(this.identity(this.currentUserId), attrs, false);
  }

  onlineAddUser(accountObject): Promise<any> {
    return this.jsonApiService.onlineCreate(accountObject, false);
  }

  onlineUpdateUser(updateUser): Promise<any> {
    let attrs: Partial<User> = {};
    if (updateUser.Password) {
      attrs = {
        active: updateUser.Active, email: updateUser.Email, name: updateUser.Name,
        role: updateUser.Role, username: updateUser.Username, password: updateUser.Password
      };
    } else {
      attrs = {
        active: updateUser.Active, email: updateUser.Email, name: updateUser.Name,
        role: updateUser.Role, username: updateUser.Username
      };
    }
    return this.jsonApiService.onlineUpdateAttributes(this.identity(updateUser.Id), attrs, false);
  }

  onlineGetUser(userId): Observable<any> {
    return this.jsonApiService.onlineGet(this.identity(userId));
  }

  onlineGetAllUser(): Observable<any> {
    return this.jsonApiService.onlineGetAll('user');
  }

  onlineDeleteUser(userId: string): Promise<any> {
    return this.jsonApiService.delete(this.identity(userId));
  }
}
