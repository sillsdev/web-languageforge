import { Injectable } from '@angular/core';
import { RemoteTranslationEngine } from '@sillsdev/machine';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AuthService } from 'xforge-common/auth.service';
import { JsonApiService } from 'xforge-common/json-api.service';
import { LocationService } from 'xforge-common/location.service';
import { ProjectService } from 'xforge-common/project.service';
import { nameof } from 'xforge-common/utils';
import { SFProject } from './models/sfproject';
import { ProjectRole, SFProjectRoles } from './models/sfproject-roles';
import { Text } from './models/text';

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

  getTexts(id: string): Observable<Text[]> {
    return this.jsonApiService
      .getAllRelated<Text>(this.identity(id), nameof<SFProject>('texts'))
      .pipe(map(r => r.data));
  }
}
