import { Injectable } from '@angular/core';

import { JSONAPIService } from '@xforge-common/jsonapi.service';
import { record } from '@xforge-common/resource-utils';
import { SFPROJECT_USER, SFProjectUser } from '../shared/models/sfproject-user';

@Injectable({
  providedIn: 'root'
})
export class SFProjectUserService {
  constructor(private readonly jsonApiService: JSONAPIService) { }

  onlineCreate(resource: Partial<SFProjectUser>): Promise<string> {
    return this.jsonApiService.create(record(SFPROJECT_USER, resource), true, true);
  }
}
