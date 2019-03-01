import { ConnectionStrategy } from '@orbit/coordinator';
import { Exception } from '@orbit/core';
import { FindRecord, FindRelatedRecord, FindRelatedRecords, Query, RecordIdentity } from '@orbit/data';
import Store from '@orbit/store';

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

      action: (q: Query, ex: Exception) => this.handlePullFail(q, ex),

      blocking: true
    });
  }

  private handlePullFail(query: Query, ex: Exception): void {
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
        store.update(t => t.removeRecord(record), { localOnly: true });
      }
    }

    this.source.requestQueue.skip();
  }
}
