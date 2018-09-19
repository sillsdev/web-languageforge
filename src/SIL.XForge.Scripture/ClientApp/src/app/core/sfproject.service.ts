import { Injectable } from '@angular/core';

import { BaseResourceService } from '@xforge-common/base-resource-service';
import { JSONAPIService } from '@xforge-common/json-api.service';
import { SFProject, SFProjectAttributes, SFProjectConstants } from '../shared/resources/sfproject';

@Injectable({
  providedIn: 'root'
})
export class SFProjectService extends BaseResourceService<SFProject, SFProjectAttributes> {
  constructor(jsonApiService: JSONAPIService) {
    super(jsonApiService);
  }

  get type(): string {
    return SFProjectConstants.TYPE;
  }
}
