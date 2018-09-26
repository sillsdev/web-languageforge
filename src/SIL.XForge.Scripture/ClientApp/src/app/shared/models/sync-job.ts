import { RecordHasOneRelationship } from '@orbit/data';

import { Resource, ResourceAttributes, ResourceRelationships } from '@xforge-common/models/resource';

export class SyncJobConstants {
  static readonly TYPE = 'syncJob';
}

export interface SyncJobAttributes extends ResourceAttributes {
  percentCompleted?: number;
  state?: 'PENDING' | 'SYNCING' | 'IDLE' | 'HOLD';
}

export interface SyncJobRelationships extends ResourceRelationships {
  owner?: RecordHasOneRelationship;
  project?: RecordHasOneRelationship;
}

export interface SyncJob extends Resource {
  attributes?: SyncJobAttributes;
  relationships?: SyncJobRelationships;
}
