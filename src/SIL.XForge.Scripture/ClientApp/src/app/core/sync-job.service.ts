import { Injectable } from '@angular/core';
import { interval, Observable, ReplaySubject } from 'rxjs';
import { concat, multicast, switchMap, take, takeWhile } from 'rxjs/operators';

import { JSONAPIService } from '@xforge-common/jsonapi.service';
import { ResourceService } from '@xforge-common/resource.service';
import { UserService } from '@xforge-common/user.service';
import { SyncJob, SyncJobAttributes, SyncJobConstants, SyncJobRelationships } from '../shared/models/sync-job';
import { SFProjectService } from './sfproject.service';

@Injectable({
  providedIn: 'root'
})
export class SyncJobService extends ResourceService<SyncJob, SyncJobAttributes, SyncJobRelationships> {
  static isActive(job: SyncJob): boolean {
    return job.attributes.state === 'PENDING' || job.attributes.state === 'SYNCING';
  }

  constructor(jsonApiService: JSONAPIService, private readonly userService: UserService,
    private readonly projectService: SFProjectService
  ) {
    super(jsonApiService, SyncJobConstants.TYPE);
  }

  onlineGetById(id: string): Observable<SyncJob> {
    return this.jsonApiService.query(q => q.findRecord(this.identity(id)), false);
  }

  onlineGetActive(projectId: string): Observable<SyncJob> {
    return this.jsonApiService.query(q =>
      q.findRelatedRecord(this.projectService.identity(projectId), 'activeSyncJob'), false);
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
    const job: SyncJob = {
      id: undefined,
      type: this.type,
      relationships: {
        project: this.projectService.hasOne(projectId),
        owner: this.userService.hasOne(this.userService.currentUserId)
      }
    };
    return this.jsonApiService.create(job, false, true);
  }

  cancel(id: string): Promise<void> {
    return this.jsonApiService.delete(this.identity(id), false, true);
  }
}
