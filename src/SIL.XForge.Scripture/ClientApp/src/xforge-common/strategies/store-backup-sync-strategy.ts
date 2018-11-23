import { SyncStrategy } from '@orbit/coordinator';

export class StoreBackupSyncStrategy extends SyncStrategy {
  constructor(store: string, backup: string) {
    super({
      source: store,

      target: backup,

      blocking: true
    });
  }
}
