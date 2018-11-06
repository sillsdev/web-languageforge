import { Injectable } from '@angular/core';
import { interval, Observable } from 'rxjs';
import { takeWhileInclusive } from 'rxjs-take-while-inclusive';
import { switchMap } from 'rxjs/operators';

import { JSONAPIService } from '@xforge-common/jsonapi.service';
import { ResourceService } from '@xforge-common/resource.service';
import { nameof } from '@xforge-common/utils';
import { SFProject, SFProjectRef } from './models/sfproject';
import { SFUserRef } from './models/sfuser';
import { SyncJob } from './models/sync-job';
import { SFUserService } from './sfuser.service';

@Injectable({
  providedIn: 'root'
})
export class SyncJobService extends ResourceService {
  constructor(jsonApiService: JSONAPIService, private readonly userService: SFUserService) {
    super(SyncJob.TYPE, jsonApiService);
  }

  onlineGet(id: string): Observable<SyncJob> {
    return this.jsonApiService.onlineGet(this.identity(id), [], false);
  }

  onlineGetActive(projectId: string): Observable<SyncJob> {
    return this.jsonApiService.onlineGetRelated({ type: SFProject.TYPE, id: projectId },
      nameof<SFProject>('activeSyncJob'), [], false);
  }

  listen(jobId: string): Observable<SyncJob> {
    return interval(2000).pipe(
      switchMap(() => this.onlineGet(jobId)),
      takeWhileInclusive(j => j.isActive)
    );
  }

  async start(projectId: string): Promise<string> {
    const job = new SyncJob({
      project: new SFProjectRef(projectId),
      owner: new SFUserRef(this.userService.currentUserId)
    });
    return this.jsonApiService.onlineCreate(job, false);
  }

  cancel(id: string): Promise<void> {
    return this.jsonApiService.onlineDelete(this.identity(id), false);
  }
}
