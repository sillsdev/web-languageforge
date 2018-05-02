import * as angular from 'angular';

import { RelativeTimeFilterFunction } from '../../../core/filters';
import { NoticeService } from '../../../core/notice/notice.service';
import { SessionService } from '../../../core/session.service';
import { SendReceiveState } from '../../../shared/model/send-receive-state.model';
import { TranslateSendReceiveApiService } from '../core/translate-send-receive-api.service';
import { SendReceiveJob } from '../shared/model/send-receive-job.model';
import { TranslateProjectSettings } from '../shared/model/translate-project-settings.model';
import { TranslateProject } from '../shared/model/translate-project.model';
import { TranslateRights } from './translate-rights.service';

export class TranslateSendReceiveService {
  private job: SendReceiveJob;
  private syncStatusTimer: angular.IPromise<void>;
  private pendingMessageId: string = '';
  private checkForSyncTimer: angular.IPromise<void>;
  private lastSyncedDate: string = '';
  private listeners: Set<() => void> = new Set<() => void>();
  private cloneTask: angular.IDeferred<void>;

  static $inject: string[] = ['translateSendReceiveApiService',
    '$interval', 'silNoticeService',
    '$q', 'sessionService',
    '$filter'];
  constructor(private readonly translateSendReceiveApiService: TranslateSendReceiveApiService,
              private readonly $interval: angular.IIntervalService, private readonly notice: NoticeService,
              private readonly $q: angular.IQService, private sessionService: SessionService,
              private readonly $filter: angular.IFilterService) {
    this.listenForSync(false);
  }

  get isInProgress(): boolean {
    return this.job != null && this.job.state === SendReceiveState.Syncing;
  }

  get isStarted(): boolean {
    return this.job != null;
  }

  get syncStateNotice(): string {
    if (this.job == null) {
      return '';
    }

    switch (this.job.state) {
      case SendReceiveState.Syncing:
        return 'Syncing...';
      case SendReceiveState.Pending:
        return 'Pending';
      case SendReceiveState.Idle:
      case SendReceiveState.Synced:
        return 'Synced';
      case SendReceiveState.Unsynced:
        return 'Un-synced';
      case SendReceiveState.Hold:
        return 'On hold';
      default:
        return '';
    }
  }

  get lastSyncNotice(): string {
    if (this.lastSyncedDate == null || this.lastSyncedDate === '' || Date.parse(this.lastSyncedDate) <= 0) {
      return 'Never been synced';
    } else {
      const relativeTime = this.$filter<RelativeTimeFilterFunction>('relativetime');
      return 'Last sync was ' + relativeTime(this.lastSyncedDate);
    }
  }

  startClone(): angular.IPromise<void> {
    this.cloneTask = this.$q.defer<void>();
    this.startSyncInternal(true);
    return this.cloneTask.promise;
  }

  startSync(): void {
    this.startSyncInternal(false);
  }

  addSyncCompleteListener(listener: () => void): void {
    this.listeners.add(listener);
  }

  removeSyncCompleteListener(listener: () => void): void {
    this.listeners.delete(listener);
  }

  private listenForSync(forceRefresh: boolean): void {
    this.sessionService.getSession(forceRefresh).then(session => {
      if (session.project() != null) {
        this.lastSyncedDate = session.projectSettings<TranslateProjectSettings>().lastSyncedDate;
        this.startCheckForSyncTimer(session.project().id);
      }
    });
  }

  private startSyncInternal(clone: boolean) {
    this.cancelCheckForSyncTimer();
    this.sessionService.getSession()
      .then(session => this.translateSendReceiveApiService.startJob(session.project().id))
      .then(job => {
        this.job = job;
        this.startSyncStatusTimer(clone);
      });
  }

  private startSyncStatusTimer(clone: boolean): void {
    this.cancelSyncStatusTimer();
    this.syncStatusTimer = this.$interval(() => this.updateSyncStatus(clone), 3000);
  }

  private updateSyncStatus(clone: boolean): void {
    this.translateSendReceiveApiService.getJob(this.job.id).then(job => {
      if (!clone) {
        if (job.percentCompleted > 0) {
          this.notice.setPercentComplete(job.percentCompleted);
        } else {
          this.notice.cancelProgressBar();
        }

        if (job.state !== SendReceiveState.Syncing) {
          this.notice.cancelLoading();
        }

        switch (job.state) {
          case SendReceiveState.Pending:
            if (this.pendingMessageId === '') {
              this.pendingMessageId = this.notice.push(this.notice.INFO,
                'Please wait while other projects are being synchronized. ' +
                'You may continue to edit this project until it starts to synchronize.');
            }
            break;
          case SendReceiveState.Syncing:
            this.notice.removeById(this.pendingMessageId);
            this.pendingMessageId = '';
            this.notice.setLoading('Synchronizing with Paratext...');
            break;
          case SendReceiveState.Hold:
            this.notice.push(this.notice.ERROR, 'Well this is embarrassing. Something went ' +
                'wrong and your project is now on hold. Contact an administrator.');
            break;
          case SendReceiveState.Idle:
            if (this.job.state === SendReceiveState.Syncing) {
              this.notice.push(this.notice.SUCCESS, 'The project was successfully synchronized.');
            }
            break;
        }
      }

      if (job.state === SendReceiveState.Idle || job.state === SendReceiveState.Hold) {
        this.cancelSyncStatusTimer();
        for (const listener of this.listeners) {
          listener();
        }
        if (clone) {
          this.cloneTask.resolve();
          this.cloneTask = null;
        }
        this.listenForSync(true);
        this.job = null;
      } else {
        this.job = job;
      }
    });
  }

  private cancelSyncStatusTimer(): void {
    if (this.syncStatusTimer != null) {
      this.$interval.cancel(this.syncStatusTimer);
      this.syncStatusTimer = null;
    }
  }

  private startCheckForSyncTimer(projectId: string): void {
    this.checkForSyncTimer = this.$interval(() => this.checkForSync(projectId), 32000);
  }

  private checkForSync(projectId: string): void {
    this.translateSendReceiveApiService.getActiveJob(projectId).then(job => {
      if (job != null) {
        this.cancelCheckForSyncTimer();
        this.job = job;
        this.startSyncStatusTimer(false);
      }
    });
  }

  private cancelCheckForSyncTimer(): void {
    if (this.checkForSyncTimer != null) {
      this.$interval.cancel(this.checkForSyncTimer);
      this.checkForSyncTimer = null;
    }
  }
}
