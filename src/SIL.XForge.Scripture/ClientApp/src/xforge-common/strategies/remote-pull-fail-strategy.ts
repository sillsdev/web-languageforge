import { ConnectionStrategy } from '@orbit/coordinator';
import { Exception } from '@orbit/core';
import { ClientError, FindRecord, Query } from '@orbit/data';
import Store from '@orbit/store';

export class RemotePullFailStrategy extends ConnectionStrategy {
  constructor(remote: string, store: string) {
    super({
      source: remote,
      on: 'pullFail',

      target: store,

      action: (q: Query, e: Exception) => this.handlePullFail(q, e),

      blocking: true
    });
  }

  private handlePullFail(query: Query, ex: Exception): void {
    // Purge a deleted record from the cache when getting a 404 from a findRecord query
    if (ex instanceof ClientError) {
      const response: Response = (ex as any).response;
      if (response.status === 404 && query.expression.op === 'findRecord') {
        const store = this.target as Store;
        store.update(t => t.removeRecord((query.expression as FindRecord).record), { localOnly: true });
      }
    }

    this.source.requestQueue.skip();
  }
}
