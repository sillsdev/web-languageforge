import { Injectable } from '@angular/core';

import { BaseResourceService } from '@xforge-common/base-resource-service';
import { JSONAPIService } from '@xforge-common/json-api.service';
import { SFProjectAttributes, SFProjectResource } from '../shared/resources/sfproject-resource';

@Injectable({
  providedIn: 'root'
})
export class SFProjectService extends BaseResourceService<SFProjectResource, SFProjectAttributes> {
  constructor(jsonApiService: JSONAPIService) {
    super(jsonApiService);
  }

  get type(): string {
    return 'project';
  }
}
