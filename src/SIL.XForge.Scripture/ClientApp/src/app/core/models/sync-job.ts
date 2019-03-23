import { SyncJobBase } from './sfdomain-model.generated';

export enum SyncJobState {
  PENDING = 'PENDING',
  SYNCING = 'SYNCING',
  IDLE = 'IDLE',
  HOLD = 'HOLD'
}

export class SyncJob extends SyncJobBase {
  state?: SyncJobState;

  constructor(init?: Partial<SyncJob>) {
    super(init);
  }

  get isActive(): boolean {
    return this.state === SyncJobState.PENDING || this.state === SyncJobState.SYNCING;
  }

  get isIdle(): boolean {
    return this.state === SyncJobState.IDLE;
  }
}

export { SyncJobRef } from './sfdomain-model.generated';
