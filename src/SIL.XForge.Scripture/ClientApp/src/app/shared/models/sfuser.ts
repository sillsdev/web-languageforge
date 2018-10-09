import { RecordHasManyRelationship } from '@orbit/data';

import { User, USER, UserAttributes, UserRelationships } from '@xforge-common/models/user';

export const SFUSER = USER;

export type SFUserAttributes = UserAttributes;

export interface SFUserRelationships extends UserRelationships {
  projects?: RecordHasManyRelationship;
}

export interface SFUser extends User {
  relationships?: SFUserRelationships;
}
