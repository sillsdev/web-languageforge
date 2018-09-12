import { Injectable } from '@angular/core';

import { ApiService } from '@xforge-common/api.service';
import { BaseResourceService } from '@xforge-common/base-resource-service';
import { SFProjectAttributes, SFProjectResource } from '../shared/resources/sfproject-resource';

@Injectable({
  providedIn: 'root'
})
export class SFProjectService extends BaseResourceService<SFProjectResource, SFProjectAttributes> {
  constructor(apiService: ApiService) {
    super(apiService);
  }

  get type(): string {
    return 'project';
  }
}
