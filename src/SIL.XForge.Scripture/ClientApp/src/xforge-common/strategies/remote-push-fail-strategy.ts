import { ConnectionStrategy } from '@orbit/coordinator';
import { Exception } from '@orbit/core';
import { NetworkError, Transform } from '@orbit/data';
import Store from '@orbit/store';

import { isOfflineRequest, isOnlineRequest } from '../request-type';

/**
 * This strategy is responsible for retrying update operations that occurred while offline.
 */
export class RemotePushFailStrategy extends ConnectionStrategy {
  constructor(remote: string, store: string, private readonly retryTimeout: number = 5000) {
    super({
      source: remote,
      on: 'pushFail',

      target: store,
      action: (transform: Transform, ex: Exception) => this.handlePushFail(transform, ex),

      blocking: true
    });
  }

  private async handlePushFail(transform: Transform, ex: Exception): Promise<void> {
    if (isOfflineRequest(transform) && ex instanceof NetworkError) {
      // Retry sending updates to server when push fails
      setTimeout(() => this.source.requestQueue.retry().catch(() => {}), this.retryTimeout);
    } else {
      const store = this.target as Store;
      if (store.transformLog.contains(transform.id)) {
        store.rollback(transform.id, -1);
      }
      await this.source.requestQueue.skip();
      if (isOnlineRequest(transform)) {
        await this.target.requestQueue.skip();
      }
    }
  }
}
