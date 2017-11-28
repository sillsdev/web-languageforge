import { ProjectSettings } from '../../../../bellows/shared/model/project-settings.model';
import { LexiconConfig } from './lexicon-config.model';
import { SendReceiveStatus } from './send-receive-status.model';

export class LexiconProjectSettings extends ProjectSettings {
  config: LexiconConfig;
  currentUserRole: string;
  hasSendReceive: boolean;
  interfaceConfig: any;
  lastSyncedDate: string;
  optionlists: any;
  sendReceive?: { status: SendReceiveStatus };
}
