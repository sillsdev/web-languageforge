import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { distanceInWordsToNow } from 'date-fns';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { NoticeService } from 'xforge-common/notice.service';
import { ParatextService } from 'xforge-common/paratext.service';
import { SubscriptionDisposable } from 'xforge-common/subscription-disposable';
import { SFProject } from '../core/models/sfproject';
import { SyncJob } from '../core/models/sync-job';
import { SFProjectService } from '../core/sfproject.service';
import { SyncJobService } from '../core/sync-job.service';

@Component({
  selector: 'app-sync',
  templateUrl: './sync.component.html',
  styleUrls: ['./sync.component.scss']
})
export class SyncComponent extends SubscriptionDisposable implements OnInit {
  readonly projectReload$ = new BehaviorSubject<void>(null);
  syncJobActive: boolean = false;
  project: SFProject;
  percentComplete: number;

  private isFirstLoad: boolean = true;
  private activeJob: SyncJob;
  private paratextUsername: string;
  private projectId: string;
  private syncInProgress$: Observable<SyncJob>;
  private syncInProgressSub: Subscription;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly noticeService: NoticeService,
    private readonly paratextService: ParatextService,
    private readonly projectService: SFProjectService,
    private readonly syncJobService: SyncJobService
  ) {
    super();
  }

  get isLoading(): boolean {
    return this.isFirstLoad || this.noticeService.isLoading;
  }

  get isLoggedIntoParatext(): boolean {
    return this.paratextUsername && this.paratextUsername.length > 0;
  }

  get isProgressDeterminate(): boolean {
    return !!this.percentComplete && this.percentComplete > 0;
  }

  get lastSyncNotice(): string {
    if (!this.project) {
      return '';
    }
    if (
      this.project.lastSyncedDate == null ||
      this.project.lastSyncedDate === '' ||
      Date.parse(this.project.lastSyncedDate) <= 0
    ) {
      return 'Never been synced';
    } else {
      return 'Last sync was ' + distanceInWordsToNow(this.project.lastSyncedDate) + ' ago';
    }
  }

  get lastSyncDate() {
    const date = new Date(this.project.lastSyncedDate);
    return date.toLocaleString();
  }

  ngOnInit() {
    this.subscribe(
      this.route.params.pipe(
        tap(params => {
          this.noticeService.loadingStarted();
          this.projectId = params['projectId'];
        }),
        switchMap(() =>
          combineLatest(
            this.projectService.onlineGet(this.projectId, this.projectReload$),
            this.syncJobService.onlineGetActive(this.projectId),
            this.paratextService.getParatextUsername()
          )
        )
      ),
      ([project, activeJob, paratextUsername]) => {
        if (project != null) {
          this.project = project;
        }
        if (activeJob != null && activeJob.isActive && (!this.activeJob || this.activeJob.id !== activeJob.id)) {
          this.activeJob = activeJob;
          this.syncJobActive = true;
          this.listenAndProcessSync(activeJob.id);
        }
        if (paratextUsername != null) {
          this.paratextUsername = paratextUsername;
        }
        this.isFirstLoad = false;
        this.noticeService.loadingFinished();
      }
    );
  }

  logInWithParatext(): void {
    const url = '/projects/' + this.projectId + '/sync';
    this.paratextService.logIn(url);
  }

  async syncProject(): Promise<void> {
    this.syncJobActive = true;
    const jobId = await this.syncJobService.start(this.projectId);
    this.listenAndProcessSync(jobId);
  }

  private listenAndProcessSync(jobId: string): void {
    if (this.syncInProgressSub != null) {
      this.syncInProgressSub.unsubscribe();
    }
    this.syncInProgress$ = this.syncJobService.listen(jobId);
    this.syncInProgressSub = this.subscribe(this.syncInProgress$, job => {
      this.percentComplete = job.percentCompleted;
      if (!job.isActive) {
        this.percentComplete = undefined;
        this.syncInProgressSub.unsubscribe();
        this.syncJobActive = false;
        if (job.isIdle) {
          this.projectReload$.next(null);
          this.noticeService.show('Sucessfully synchronized ' + this.project.projectName + ' with Paratext.');
        } else {
          this.noticeService.show(
            'Something went wrong while synchronizing the ' +
              this.project.projectName +
              ' with Paratext. Please try again.'
          );
        }
      }
    });
  }
}
