import { RequestStrategy } from '@orbit/coordinator';
import { Transform } from '@orbit/data';

export class StoreRemoteUpdateStrategy extends RequestStrategy {
  constructor(store: string, remote: string) {
    super({
      source: store,
      on: 'beforeUpdate',

      target: remote,
      filter: (t: Transform) => t.options == null || !t.options.localOnly,
      action: 'push',

      blocking: false
    });
  }
}
