import { RecordHasOneRelationship } from '@orbit/data';

import {
  PROJECT_USER, ProjectUser, ProjectUserAttributes, ProjectUserRelationships
} from '@xforge-common/models/project-user';

export const SFPROJECT_USER = PROJECT_USER;

export interface SFProjectUserAttributes extends ProjectUserAttributes {
  translateConfig?: any;
}

export interface SFProjectUserRelationships extends ProjectUserRelationships {
  user?: RecordHasOneRelationship;
  project?: RecordHasOneRelationship;
}

export interface SFProjectUser extends ProjectUser {
  attributes?: SFProjectUserAttributes;
  relationships?: SFProjectUserRelationships;
}
