import { Injectable } from '@angular/core';
import { Record } from '@orbit/data';
import { RemoteTranslationEngine } from '@sillsdev/machine';

import { AuthService } from 'xforge-common/auth.service';
import { JsonApiService } from 'xforge-common/json-api.service';
import { LocationService } from 'xforge-common/location.service';
import { InputSystem } from 'xforge-common/models/input-system';
import { ProjectService } from 'xforge-common/project.service';
import { nameof } from 'xforge-common/utils';
import { SFProject } from './models/sfproject';
import { ProjectRole, SFProjectRoles } from './models/sfproject-roles';

@Injectable({
  providedIn: 'root'
})
export class SFProjectService extends ProjectService<SFProject> {
  private static readonly ROLES: ProjectRole[] = [
    { role: SFProjectRoles.ParatextAdministrator, displayName: 'Administrator' },
    { role: SFProjectRoles.ParatextTranslator, displayName: 'Translator' }
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
}
