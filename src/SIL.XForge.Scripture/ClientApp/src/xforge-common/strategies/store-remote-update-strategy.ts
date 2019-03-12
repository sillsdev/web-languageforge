import { RequestStrategy } from '@orbit/coordinator';
import { Pushable, Source, Transform } from '@orbit/data';

import { isLocalRequest, isOnlineRequest } from '../request-type';
import { isNotFoundError } from '../utils';

export class StoreRemoteUpdateStrategy extends RequestStrategy {
  constructor(store: string, remote: string) {
    super({
      source: store,
      on: 'beforeUpdate',

      target: remote,
      filter: (transform: Transform) => !isLocalRequest(transform),
      action: (transform: Transform) => this.push(transform),

      blocking: (transform: Transform) => isOnlineRequest(transform)
    });
  }

  async push(transform: Transform): Promise<Transform[]> {
    try {
      return await (this.target as Source & Pushable).push(transform);
    } catch (err) {
      if (isOnlineRequest(transform) && !isNotFoundError(err)) {
        throw err;
      }
      return [];
    }
  }
}
