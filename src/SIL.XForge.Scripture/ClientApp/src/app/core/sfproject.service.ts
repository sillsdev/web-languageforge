import { Injectable } from '@angular/core';

import { JSONAPIService } from '@xforge-common/jsonapi.service';
import { ProjectConstants } from '@xforge-common/models/project';
import { OptimisticResourceService } from '@xforge-common/optimistic-resource.service';
import { SFProject, SFProjectAttributes, SFProjectRelationships } from '../shared/models/sfproject';

@Injectable({
  providedIn: 'root'
})
export class SFProjectService
  extends OptimisticResourceService<SFProject, SFProjectAttributes, SFProjectRelationships> {

  constructor(jsonApiService: JSONAPIService) {
    super(jsonApiService, ProjectConstants.TYPE);
  }

  onlineCreate(resource: SFProject): Promise<string> {
    return this.jsonApiService.create(resource, true, true);
  }
}
