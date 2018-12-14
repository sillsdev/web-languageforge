import { ResourceRef } from '@xforge-common/models/resource';
import { SyncJobBase, SyncJobState } from './sfdomain-model.generated';

export class SyncJob extends SyncJobBase {
  static readonly TYPE = 'syncJob';

  constructor(init?: Partial<SyncJob>) {
    super(init);
  }

  get isActive(): boolean {
    return this.state === SyncJobState.PENDING || this.state === SyncJobState.SYNCING;
  }
}
