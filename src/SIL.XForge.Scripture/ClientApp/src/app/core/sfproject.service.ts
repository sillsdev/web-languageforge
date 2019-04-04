import { Injectable } from '@angular/core';
import { RemoteTranslationEngine } from '@sillsdev/machine';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { JsonApiService } from 'xforge-common/json-api.service';
import { ProjectService } from 'xforge-common/project.service';
import { nameof, objectId } from 'xforge-common/utils';
import { MachineHttpClient } from './machine-http-client';
import { SFProject } from './models/sfproject';
import { ProjectRole, SFProjectRoles } from './models/sfproject-roles';
import { SyncJobRef } from './models/sync-job';
import { Text } from './models/text';
import { TranslateMetrics } from './models/translate-metrics';

@Injectable({
  providedIn: 'root'
})
export class SFProjectService extends ProjectService<SFProject> {
  private static readonly ROLES: ProjectRole[] = [
    { role: SFProjectRoles.ParatextAdministrator, displayName: 'Administrator' },
    { role: SFProjectRoles.ParatextTranslator, displayName: 'Translator' }
  ];

  constructor(jsonApiService: JsonApiService, private readonly machineHttp: MachineHttpClient) {
    super(SFProject.TYPE, jsonApiService, SFProjectService.ROLES);
  }

  createTranslationEngine(projectId: string): RemoteTranslationEngine {
    return new RemoteTranslationEngine(projectId, this.machineHttp);
  }

  getTexts(id: string): Observable<Text[]> {
    return this.jsonApiService
      .getAllRelated<Text>(this.identity(id), nameof<SFProject>('texts'))
      .pipe(map(r => r.data));
  }

  addTranslateMetrics(id: string, metrics: TranslateMetrics): Promise<void> {
    return this.jsonApiService.onlineInvoke(this.identity(id), 'addTranslateMetrics', { metrics });
  }

  onlineCreate(project: SFProject): Promise<SFProject> {
    project.activeSyncJob = new SyncJobRef(objectId());
    return super.onlineCreate(project);
  }
}
