import { ConnectionStrategy } from '@orbit/coordinator';
import { Exception } from '@orbit/core';
import { NetworkError, Transform } from '@orbit/data';
import Store from '@orbit/store';

export class RemotePushFailStrategy extends ConnectionStrategy {
  private static readonly RETRY_TIMEOUT = 5000;

  constructor(remote: string, store: string) {
    super({
      source: remote,
      on: 'pushFail',

      target: store,

      action: (t: Transform, e: Exception) => this.handlePushFail(t, e),

      blocking: true
    });
  }

  private handlePushFail(transform: Transform, ex: Exception): Promise<void> {
    if (ex instanceof NetworkError) {
      // Retry sending updates to server when push fails
      setTimeout(() => this.source.requestQueue.retry(), RemotePushFailStrategy.RETRY_TIMEOUT);
    } else {
      const store = this.target as Store;
      if (store.transformLog.contains(transform.id)) {
        store.rollback(transform.id, -1);
      }
      return this.source.requestQueue.skip();
    }
  }
}
