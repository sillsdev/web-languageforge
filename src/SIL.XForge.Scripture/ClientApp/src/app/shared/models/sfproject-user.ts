import { RecordHasOneRelationship } from '@orbit/data';

import { ProjectUser, ProjectUserAttributes } from '@xforge-common/models/project-user';
import { ResourceRelationships } from '@xforge-common/models/resource';

export interface SFProjectUserAttributes extends ProjectUserAttributes {
  translateConfig?: any;
}

export interface SFProjectUserRelationships extends ResourceRelationships {
  user?: RecordHasOneRelationship;
  project?: RecordHasOneRelationship;
}

export interface SFProjectUser extends ProjectUser {
  attributes?: SFProjectUserAttributes;
  relationships?: SFProjectUserRelationships;
}
