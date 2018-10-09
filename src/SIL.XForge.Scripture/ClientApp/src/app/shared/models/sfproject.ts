import { RecordHasManyRelationship, RecordHasOneRelationship } from '@orbit/data';

import { InputSystem } from '@xforge-common/models/input-system';
import { Project, PROJECT, ProjectAttributes, ProjectRelationships } from '@xforge-common/models/project';
import { TaskConfig } from '@xforge-common/models/task-config';
import { TranslateConfig } from './translate-config';

export const SFPROJECT = PROJECT;

export interface SFProjectAttributes extends ProjectAttributes {
  paratextId?: string;
  inputSystem?: InputSystem;
  checkingConfig?: TaskConfig;
  translateConfig?: TranslateConfig;
}

export interface SFProjectRelationships extends ProjectRelationships {
  users?: RecordHasManyRelationship;
  activeSyncJob?: RecordHasOneRelationship;
}

export interface SFProject extends Project {
  attributes?: SFProjectAttributes;
  relationships?: SFProjectRelationships;
}
