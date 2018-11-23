import { SyncStrategy } from '@orbit/coordinator';

export class RemoteStoreSyncStrategy extends SyncStrategy {
  constructor(remote: string, store: string) {
    super({
      source: remote,

      target: store,

      blocking: false
    });
  }
}
