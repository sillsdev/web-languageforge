import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';

import { NoticeService } from 'xforge-common/notice.service';
import { SubscriptionDisposable } from 'xforge-common/subscription-disposable';
import { SyncJob } from '../core/models/sync-job';
import { ParatextService } from '../core/paratext.service';
import { SFProjectService } from '../core/sfproject.service';
import { SyncJobService } from '../core/sync-job.service';

@Component({
  selector: 'app-sync',
  templateUrl: './sync.component.html',
  styleUrls: ['./sync.component.scss']
})
export class SyncComponent extends SubscriptionDisposable implements OnInit {
  projectName: string;
  syncJobActive = false;
  lastSyncedDate: string;
  percentComplete: number;

  private paratextUsername: string;
  private projectId: string;
  private syncInProgress$: Observable<SyncJob>;

  constructor(
    private readonly datePipe: DatePipe,
    private readonly route: ActivatedRoute,
    private readonly paratextService: ParatextService,
    private readonly projectService: SFProjectService,
    private readonly syncJobService: SyncJobService,
    private readonly noticeService: NoticeService
  ) {
    super();
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.projectId = params['projectId'];
      this.updateLastSyncedDate();
    });
    this.subscribe(this.paratextService.getParatextUsername(), name => {
      this.paratextUsername = name;
    });
  }

  get isLoggedIntoParatext(): boolean {
    return this.paratextUsername && this.paratextUsername.length > 0;
  }

  get shouldDisplayLastSync(): boolean {
    return this.isLoggedIntoParatext && !this.syncJobActive;
  }

  logInWithParatext(): void {
    const url = '/projects/' + this.projectId + '/sync';
    this.paratextService.logIn(url);
  }

  async syncProject(): Promise<void> {
    const jobId = await this.syncJobService.start(this.projectId);
    this.syncInProgress$ = this.syncJobService.listen(jobId);
    this.syncJobActive = true;
    this.subscribe(this.syncInProgress$, job => {
      this.percentComplete = job.percentCompleted;
      if (!job.isActive) {
        this.syncJobActive = false;
        this.updateLastSyncedDate();
        this.noticeService.show('Sucessfully synchronized ' + this.projectName + ' with Paratext.');
      }
    });
  }

  private updateLastSyncedDate(): void {
    this.subscribe(this.projectService.onlineGet(this.projectId), p => {
      if (!this.projectName) {
        this.projectName = p.data.projectName;
      }
      this.lastSyncedDate = this.datePipe.transform(p.data.lastSyncedDate, 'dd MMMM yyyy');
    });
  }
}
