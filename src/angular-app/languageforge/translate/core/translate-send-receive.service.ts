import * as angular from 'angular';

import { NoticeService } from '../../../bellows/core/notice/notice.service';
import { SendReceiveState } from '../../lexicon/shared/model/send-receive-status.model';
import { TranslateSendReceiveApiService } from '../core/translate-send-receive-api.service';
import { SendReceiveJob } from '../shared/model/send-receive-job.model';

export class TranslateSendReceiveService {
  private job: SendReceiveJob;
  private cloneStatusTimer: angular.IPromise<void>;
  private cloneTask: angular.IDeferred<void>;

  static $inject: string[] = ['translateSendReceiveApiService',
    '$interval', 'silNoticeService',
    '$q'];
  constructor(private readonly translateSendReceiveApiService: TranslateSendReceiveApiService,
              private readonly $interval: angular.IIntervalService, private readonly notice: NoticeService,
              private readonly $q: angular.IQService) { }

  startClone(projectId: string): angular.IPromise<void> {
    this.cloneTask = this.$q.defer();
    this.translateSendReceiveApiService.startJob(projectId).then(job => {
      this.job = job;
      this.cloneStatusTimer = this.$interval(() => this.updateCloneStatus(), 3000);
    });
    return this.cloneTask.promise;
  }

  private updateCloneStatus(): void {
    this.translateSendReceiveApiService.getJob(this.job.id).then(job => {
      if (job.state === SendReceiveState.Idle || job.state === SendReceiveState.Hold) {
        this.cancelCloneStatusTimer();
        this.cloneTask.resolve();
      }
      this.job = job;
    });
  }

  private cancelCloneStatusTimer(): void {
    if (this.cloneStatusTimer != null) {
      this.$interval.cancel(this.cloneStatusTimer);
      this.cloneStatusTimer = null;
    }
  }
}
