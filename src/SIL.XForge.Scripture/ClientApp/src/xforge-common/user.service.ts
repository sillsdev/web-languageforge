import { Injectable } from '@angular/core';

import { BaseResourceService } from './base-resource-service';
import { JSONAPIService } from './json-api.service';
import { UserAttributes, UserResource } from './resources/user-resource';

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseResourceService<UserResource, UserAttributes> {
  constructor(jsonApiService: JSONAPIService) {
    super(jsonApiService);
  }

  get type(): string {
    return 'user';
  }
}
