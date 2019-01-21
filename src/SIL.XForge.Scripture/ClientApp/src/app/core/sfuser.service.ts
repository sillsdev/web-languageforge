import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AuthService } from '@xforge-common/auth.service';
import { JsonApiService } from '@xforge-common/json-api.service';
import { UserService } from '@xforge-common/user.service';
import { SFUser } from './models/sfuser';

@Injectable({
  providedIn: 'root'
})
export class SFUserService extends UserService<SFUser> {
  constructor(jsonApiService: JsonApiService, authService: AuthService, http: HttpClient) {
    super(SFUser.TYPE, jsonApiService, authService, http);
  }
}
