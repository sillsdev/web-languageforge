import * as angular from 'angular';

import { RestApiService } from '../../../bellows/core/api/rest-api.service';
import { SendReceiveJob } from '../shared/model/send-receive-job.model';

export class TranslateSendReceiveApiService {
  static $inject: string[] = ['restApiService'];
  constructor(private restApiService: RestApiService) { }

  startJob(projectId: string): angular.IPromise<SendReceiveJob> {
    return this.restApiService.post('/api2/sr_jobs', projectId);
  }

  getJob(jobId: string): angular.IPromise<SendReceiveJob> {
    return this.restApiService.get('/api2/sr_jobs/' + jobId);
  }

  cancelJob(jobId: string): angular.IPromise<void> {
    return this.restApiService.delete('/api2/sr_jobs' + jobId);
  }
}
