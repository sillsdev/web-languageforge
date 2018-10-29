import { Injectable } from '@angular/core';

import { JSONAPIService } from '@xforge-common/jsonapi.service';
import { ProjectService } from '@xforge-common/project.service';
import { SFProject } from '../shared/models/sfproject';

@Injectable({
  providedIn: 'root'
})
export class SFProjectService extends ProjectService<SFProject> {
  constructor(jsonApiService: JSONAPIService) {
    super(jsonApiService);
  }
}
