import { RequestStrategy } from '@orbit/coordinator';
import { Exception } from '@orbit/core';

export class StoreRemoteQueryStrategy extends RequestStrategy {
  constructor(store: string, remote: string) {
    super({
      source: store,
      on: 'beforeQuery',

      target: remote,
      action: 'pull',

      blocking: false,

      catch: (e: Exception) => {
        this.source.requestQueue.skip();
        this.target.requestQueue.skip();
        throw e;
      }
    });
  }
}
