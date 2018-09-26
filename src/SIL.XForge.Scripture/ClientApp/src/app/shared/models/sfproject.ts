import { RecordHasManyRelationship, RecordHasOneRelationship } from '@orbit/data';

import { InputSystem } from '@xforge-common/models/input-system';
import { Project, ProjectAttributes } from '@xforge-common/models/project';
import { ResourceRelationships } from '@xforge-common/models/resource';
import { TaskConfig } from '@xforge-common/models/task-config';
import { TranslateConfig } from './translate-config';

export interface SFProjectAttributes extends ProjectAttributes {
  paratextId?: string;
  inputSystem?: InputSystem;
  checkingConfig?: TaskConfig;
  translateConfig?: TranslateConfig;
}

export interface SFProjectRelationships extends ResourceRelationships {
  users?: RecordHasManyRelationship;
  activeSyncJob?: RecordHasOneRelationship;
}

export interface SFProject extends Project {
  attributes?: SFProjectAttributes;
  relationships?: SFProjectRelationships;
}
