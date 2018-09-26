import { Injectable } from '@angular/core';

import { JSONAPIService } from '@xforge-common/jsonapi.service';
import { ProjectUserConstants } from '@xforge-common/models/project-user';
import { ResourceService } from '@xforge-common/resource.service';
import { SFProjectUser, SFProjectUserAttributes, SFProjectUserRelationships } from '../shared/models/sfproject-user';

@Injectable({
  providedIn: 'root'
})
export class SFProjectUserService
  extends ResourceService<SFProjectUser, SFProjectUserAttributes, SFProjectUserRelationships> {

  constructor(jsonApiService: JSONAPIService) {
    super(jsonApiService, ProjectUserConstants.TYPE);
  }

  onlineCreate(resource: SFProjectUser): Promise<string> {
    return this.jsonApiService.create(resource, true, true);
  }
}
