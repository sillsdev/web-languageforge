import { Injectable } from '@angular/core';

import { ApiService } from './api.service';
import { BaseResourceService } from './base-resource-service';
import { UserAttributes, UserResource } from './resources/user-resource';

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseResourceService<UserResource, UserAttributes> {
  constructor(apiService: ApiService) {
    super(apiService);
  }

  get type(): string {
    return 'user';
  }
}
