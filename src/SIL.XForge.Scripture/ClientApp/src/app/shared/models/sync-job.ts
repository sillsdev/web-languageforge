import { resource, ResourceRef, resourceRef } from '@xforge-common/models/resource';
import { SFProjectData } from './sfproject-data';

@resource
export class SyncJob extends SFProjectData {
  static readonly TYPE = 'syncJob';

  percentCompleted?: number;
  state?: 'PENDING' | 'SYNCING' | 'IDLE' | 'HOLD';

  constructor(init?: Partial<SyncJob>) {
    super(SyncJob.TYPE, init);
  }

  get isActive(): boolean {
    return this.state === 'PENDING' || this.state === 'SYNCING';
  }
}

@resourceRef
export class SyncJobRef extends ResourceRef {
  static readonly TYPE = SyncJob.TYPE;

  constructor(id: string) {
    super(SyncJobRef.TYPE, id);
  }
}
