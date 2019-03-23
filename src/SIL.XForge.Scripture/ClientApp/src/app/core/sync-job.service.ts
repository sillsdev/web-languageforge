import { Injectable } from '@angular/core';
import { interval, Observable } from 'rxjs';
import { takeWhileInclusive } from 'rxjs-take-while-inclusive';
import { map, switchMap } from 'rxjs/operators';

import { JsonApiService } from 'xforge-common/json-api.service';
import { UserRef } from 'xforge-common/models/user';
import { ResourceService } from 'xforge-common/resource.service';
import { UserService } from 'xforge-common/user.service';
import { nameof } from 'xforge-common/utils';
import { SFProject, SFProjectRef } from './models/sfproject';
import { SyncJob } from './models/sync-job';

@Injectable({
  providedIn: 'root'
})
export class SyncJobService extends ResourceService {
  constructor(jsonApiService: JsonApiService, private readonly userService: UserService) {
    super(SyncJob.TYPE, jsonApiService);
  }

  onlineGet(id: string): Observable<SyncJob> {
    return this.jsonApiService.onlineGet<SyncJob>(this.identity(id)).pipe(map(r => r.data));
  }

  onlineGetActive(projectId: string): Observable<SyncJob> {
    return this.jsonApiService
      .onlineGetRelated<SyncJob>({ type: SFProject.TYPE, id: projectId }, nameof<SFProject>('activeSyncJob'))
      .pipe(map(r => r.data));
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
      owner: new UserRef(this.userService.currentUserId)
    });
    const newJob = await this.jsonApiService.onlineCreate(job);
    return newJob.id;
  }

  cancel(id: string): Promise<void> {
    return this.jsonApiService.onlineDelete(this.identity(id));
  }
}
