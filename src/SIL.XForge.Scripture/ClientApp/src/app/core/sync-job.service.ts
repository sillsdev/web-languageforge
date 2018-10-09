import { Injectable } from '@angular/core';
import { interval, Observable, ReplaySubject } from 'rxjs';
import { concat, multicast, switchMap, take, takeWhile } from 'rxjs/operators';

import { JSONAPIService } from '@xforge-common/jsonapi.service';
import { hasOne, identity, record } from '@xforge-common/resource-utils';
import { SFPROJECT } from '../shared/models/sfproject';
import { SFUSER } from '../shared/models/sfuser';
import { SYNC_JOB, SyncJob } from '../shared/models/sync-job';
import { SFUserService } from './sfuser.service';

@Injectable({
  providedIn: 'root'
})
export class SyncJobService {
  static isActive(job: SyncJob): boolean {
    return job.attributes.state === 'PENDING' || job.attributes.state === 'SYNCING';
  }

  constructor(private readonly jsonApiService: JSONAPIService, private readonly userService: SFUserService) { }

  onlineGetById(id: string): Observable<SyncJob> {
    return this.jsonApiService.query(q => q.findRecord(identity(SYNC_JOB, id)), false);
  }

  onlineGetActive(projectId: string): Observable<SyncJob> {
    return this.jsonApiService.query(q => q.findRelatedRecord(identity(SFPROJECT, projectId), 'activeSyncJob'),
      false);
  }

  listen(jobId: string): Observable<SyncJob> {
    return interval(2000).pipe(
      switchMap(() => this.onlineGetById(jobId)),
      multicast(
        () => new ReplaySubject(1),
        jobs => jobs.pipe(
          takeWhile(j => SyncJobService.isActive(j)),
          concat(jobs.pipe(take(1)))
        )
      )
    );
  }

  async start(projectId: string): Promise<string> {
    const rec = record(SYNC_JOB, {
      relationships: {
        project: hasOne(SFPROJECT, projectId),
        owner: hasOne(SFUSER, this.userService.currentUserId)
      }
    });
    return this.jsonApiService.create(rec, false, true);
  }

  cancel(id: string): Promise<void> {
    return this.jsonApiService.delete(identity(SYNC_JOB, id), false, true);
  }
}
