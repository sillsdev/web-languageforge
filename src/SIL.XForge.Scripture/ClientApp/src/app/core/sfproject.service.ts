import { Injectable } from '@angular/core';
import { Record } from '@orbit/data';

import { JsonApiService } from '@xforge-common/json-api.service';
import { InputSystem } from '@xforge-common/models/input-system';
import { ProjectRole } from '@xforge-common/models/project-role';
import { ProjectService } from '@xforge-common/project.service';
import { nameof } from '@xforge-common/utils';
import { SFProject } from './models/sfproject';

@Injectable({
  providedIn: 'root'
})
export class SFProjectService extends ProjectService<SFProject> {
  private static readonly ROLES: ProjectRole[] = [
    { role: 'pt_administrator', displayName: 'Administrator' },
    { role: 'pt_translator', displayName: 'Translator' }
  ];

  constructor(jsonApiService: JsonApiService) {
    super(jsonApiService, SFProjectService.ROLES);
  }

  protected isSearchMatch(record: Record, value: string): boolean {
    if (super.isSearchMatch(record, value)) {
      return true;
    }

    const inputSystem = record.attributes[nameof<SFProject>('inputSystem')] as InputSystem;
    if (inputSystem != null && inputSystem.languageName.toLowerCase().includes(value)) {
      return true;
    }
    return false;
  }
}
