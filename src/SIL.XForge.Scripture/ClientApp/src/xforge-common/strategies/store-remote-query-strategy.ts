import { RequestStrategy } from '@orbit/coordinator';
import { Pullable, Query, Source, Transform } from '@orbit/data';

import { isLocalRequest, isOnlineRequest } from '../request-type';
import { isNotFoundError } from '../utils';

export class StoreRemoteQueryStrategy extends RequestStrategy {
  constructor(store: string, remote: string) {
    super({
      source: store,
      on: 'beforeQuery',

      target: remote,
      filter: (query: Query) => !isLocalRequest(query),
      action: (query: Query) => this.pull(query),

      blocking: (query: Query) => isOnlineRequest(query)
    });
  }

  async pull(query: Query): Promise<Transform[]> {
    try {
      return await (this.target as Source & Pullable).pull(query);
    } catch (err) {
      if (isOnlineRequest(query) && !isNotFoundError(err)) {
        throw err;
      }
      return [];
    }
  }
}
