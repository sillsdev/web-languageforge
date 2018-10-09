import { Injectable } from '@angular/core';

import { JSONAPIService } from '@xforge-common/jsonapi.service';
import { OptimisticResourceService } from '@xforge-common/optimistic-resource.service';
import { record } from '@xforge-common/resource-utils';
import { SFProject, SFPROJECT, SFProjectAttributes } from '../shared/models/sfproject';

@Injectable({
  providedIn: 'root'
})
export class SFProjectService extends OptimisticResourceService<SFProject, SFProjectAttributes> {

  constructor(jsonApiService: JSONAPIService) {
    super(jsonApiService, SFPROJECT);
  }

  onlineCreate(resource: Partial<SFProject>): Promise<string> {
    return this.jsonApiService.create(record(this.type, resource), true, true);
  }
}
