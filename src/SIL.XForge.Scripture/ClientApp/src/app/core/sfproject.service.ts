import { Injectable } from '@angular/core';
import { Record } from '@orbit/data';
import { RemoteTranslationEngine } from '@sillsdev/machine';

import { AuthService } from 'xforge-common/auth.service';
import { JsonApiService } from 'xforge-common/json-api.service';
import { LocationService } from 'xforge-common/location.service';
import { InputSystem } from 'xforge-common/models/input-system';
import { ProjectRole } from 'xforge-common/models/project-role';
import { ProjectService } from 'xforge-common/project.service';
import { nameof } from 'xforge-common/utils';
import { SFProject } from './models/sfproject';

@Injectable({
  providedIn: 'root'
})
export class SFProjectService extends ProjectService<SFProject> {
  private static readonly ROLES: ProjectRole[] = [
    { role: 'pt_administrator', displayName: 'Administrator' },
    { role: 'pt_translator', displayName: 'Translator' }
  ];

  constructor(
    jsonApiService: JsonApiService,
    private readonly authService: AuthService,
    private readonly locationService: LocationService
  ) {
    super(SFProject.TYPE, jsonApiService, SFProjectService.ROLES);
  }

  createTranslationEngine(projectId: string): RemoteTranslationEngine {
    return new RemoteTranslationEngine(
      projectId,
      this.locationService.origin + '/machine-api',
      this.authService.accessToken
    );
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
