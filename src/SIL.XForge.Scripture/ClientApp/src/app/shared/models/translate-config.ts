import { InputSystem } from '@xforge-common/models/input-system';
import { TaskConfig } from '@xforge-common/models/task-config';

export interface TranslateConfig extends TaskConfig {
  sourceParatextId?: string;
  sourceInputSystem?: InputSystem;
}
