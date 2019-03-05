import { ConnectionStrategy } from '@orbit/coordinator';
import { Exception } from '@orbit/core';
import { FindRecord, FindRelatedRecord, FindRelatedRecords, Query, RecordIdentity } from '@orbit/data';
import Store from '@orbit/store';

import { isOnlineRequest, RequestType } from '../request-type';
import { isNotFoundError } from '../utils';

/**
 * This strategy is responsible for handling remote query request failures. It deletes any records locally if a 404 is
 * returned from the server when fetching.
 */
export class RemotePullFailStrategy extends ConnectionStrategy {
  constructor(remote: string, store: string) {
    super({
      source: remote,
      on: 'pullFail',

      target: store,
      action: (query: Query, ex: Exception) => this.handlePullFail(query, ex),

      blocking: true
    });
  }

  private async handlePullFail(query: Query, ex: Exception): Promise<void> {
    await this.source.requestQueue.skip();
    if (isOnlineRequest(query)) {
      await this.target.requestQueue.skip();
    }
    if (isNotFoundError(ex)) {
      let record: RecordIdentity;
      switch (query.expression.op) {
        case 'findRecord':
          const findRecord = query.expression as FindRecord;
          record = findRecord.record;
          break;
        case 'findRelatedRecord':
          const findRelatedRecord = query.expression as FindRelatedRecord;
          record = findRelatedRecord.record;
          break;
        case 'findRelatedRecords':
          const findRelatedRecords = query.expression as FindRelatedRecords;
          record = findRelatedRecords.record;
          break;
      }

      if (record != null) {
        const store = this.target as Store;
        await store.update(t => t.removeRecord(record), { requestType: RequestType.LocalOnly });
      }
    }
  }
}
