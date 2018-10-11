import { Injectable } from '@angular/core';

import { JSONAPIService } from '@xforge-common/jsonapi.service';
import { OptimisticResourceService } from '@xforge-common/optimistic-resource.service';
import { SFProject } from '../shared/models/sfproject';

@Injectable({
  providedIn: 'root'
})
export class SFProjectService extends OptimisticResourceService<SFProject> {

  constructor(jsonApiService: JSONAPIService) {
    super(jsonApiService, SFProject.TYPE);
  }

  onlineCreate(resource: SFProject): Promise<string> {
    return this.jsonApiService.create(resource, true, true);
  }
}
