import { InputSystem } from '@xforge-common/models/input-system';
import { Project, ProjectRef } from '@xforge-common/models/project';
import { TaskConfig } from '@xforge-common/models/task-config';
import { SFProjectUserRef } from './sfproject-user';
import { SyncJobRef } from './sync-job';
import { TextRef } from './text';
import { TranslateConfig } from './translate-config';

export class SFProject extends Project {
  paratextId?: string;
  inputSystem?: InputSystem;
  checkingConfig?: TaskConfig;
  translateConfig?: TranslateConfig;

  users?: SFProjectUserRef[];
  activeSyncJob?: SyncJobRef;
  texts?: TextRef[];

  constructor(init?: Partial<SFProject>) {
    super(init);
  }
}

export class SFProjectRef extends ProjectRef { }
