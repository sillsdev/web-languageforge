import { Injectable } from '@angular/core';
import { RecordIdentity } from '@orbit/data';
import { interval, Observable, ReplaySubject } from 'rxjs';
import { concat, multicast, switchMap, take, takeWhile } from 'rxjs/operators';

import { JSONAPIService } from '@xforge-common/jsonapi.service';
import { SFProject, SFProjectRef } from '../shared/models/sfproject';
import { SFUserRef } from '../shared/models/sfuser';
import { SyncJob } from '../shared/models/sync-job';
import { SFUserService } from './sfuser.service';

@Injectable({
  providedIn: 'root'
})
export class SyncJobService {
  constructor(private readonly jsonApiService: JSONAPIService, private readonly userService: SFUserService) { }

  onlineGetById(id: string): Observable<SyncJob> {
    return this.jsonApiService.onlineGet(this.identity(id), false);
  }

  onlineGetActive(projectId: string): Observable<SyncJob> {
    return this.jsonApiService.onlineGetRelated({ type: SFProject.TYPE, id: projectId }, 'activeSyncJob', false);
  }

  listen(jobId: string): Observable<SyncJob> {
    return interval(2000).pipe(
      switchMap(() => this.onlineGetById(jobId)),
      multicast(
        () => new ReplaySubject(1),
        jobs => jobs.pipe(
          takeWhile(j => j.isActive),
          concat(jobs.pipe(take(1)))
        )
      )
    );
  }

  async start(projectId: string): Promise<string> {
    const job = new SyncJob({
      project: new SFProjectRef(projectId),
      owner: new SFUserRef(this.userService.currentUserId)
    });
    return this.jsonApiService.create(job, false, true);
  }

  cancel(id: string): Promise<void> {
    return this.jsonApiService.delete(this.identity(id), false, true);
  }

  private identity(id: string): RecordIdentity {
    return { type: SyncJob.TYPE, id };
  }
}
