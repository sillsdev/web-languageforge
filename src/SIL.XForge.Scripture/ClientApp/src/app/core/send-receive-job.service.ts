import { Injectable } from '@angular/core';

import { JSONAPIService } from '@xforge-common/json-api.service';
import { SendReceiveJob, SendReceiveJobConstants } from '../shared/resources/send-receive-job';
import { SFProjectConstants } from '../shared/resources/sfproject';

@Injectable({
  providedIn: 'root'
})
export class SendReceiveJobService {

  constructor(private readonly jsonApiService: JSONAPIService) { }

  get type(): string {
    return SendReceiveJobConstants.TYPE;
  }

  async start(projectId: string): Promise<string> {
    const job: SendReceiveJob = {
      id: undefined,
      type: this.type,
      relationships: {
        project: { data: { type: SFProjectConstants.TYPE, id: projectId } }
      }
    };
    await this.jsonApiService.create(job, false, true);
    return job.id;
  }

  getById(id: string): Promise<SendReceiveJob> {
    return this.jsonApiService.query(q => q.findRecord({ type: this.type, id }), false);
  }

  getActive(projectId: string): Promise<SendReceiveJob> {
    return this.jsonApiService.query(q =>
      q.findRelatedRecord({ type: SFProjectConstants.TYPE, id: projectId }, SFProjectConstants.ACTIVE_SEND_RECEIVE_JOB),
      false);
  }

  cancel(id: string): Promise<void> {
    return this.jsonApiService.delete({ type: this.type, id }, false, true);
  }
}
