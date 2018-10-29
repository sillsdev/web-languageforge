import { Injectable } from '@angular/core';

import { JSONAPIService } from '@xforge-common/jsonapi.service';
import { ProjectService } from '@xforge-common/project.service';
import { SFProject } from '../shared/models/sfproject';
import { Text } from '../shared/models/text';

@Injectable({
  providedIn: 'root'
})
export class SFProjectService extends ProjectService<SFProject> {
  constructor(jsonApiService: JSONAPIService) {
    super(jsonApiService);
  }

  localGetTexts(project: SFProject | string): Text[] {
    if (typeof project === 'string') {
      project = this.jsonApiService.localGet(this.identity(project));
    }
    return this.jsonApiService.localGetMany(project.texts);
  }
}
