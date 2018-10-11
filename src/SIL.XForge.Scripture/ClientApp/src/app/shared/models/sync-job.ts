import { resource, Resource, ResourceRef, resourceRef } from '@xforge-common/models/resource';
import { SFProjectRef } from './sfproject';
import { SFUserRef } from './sfuser';

@resource
export class SyncJob extends Resource {
  static readonly TYPE = 'syncJob';

  percentCompleted?: number;
  state?: 'PENDING' | 'SYNCING' | 'IDLE' | 'HOLD';

  owner?: SFUserRef;
  project?: SFProjectRef;

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
