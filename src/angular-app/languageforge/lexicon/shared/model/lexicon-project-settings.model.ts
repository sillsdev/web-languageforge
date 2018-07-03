import {ProjectSettings} from '../../../../bellows/shared/model/project-settings.model';
import {LexiconConfig} from './lexicon-config.model';
import {LexOptionList} from './option-list.model';
import {SendReceiveStatus} from './send-receive-status.model';

export class LexiconProjectSettings extends ProjectSettings {
  config: LexiconConfig;
  currentUserRole: string;
  hasSendReceive: boolean;
  lastSyncedDate: string;
  optionlists: LexOptionList[];
  sendReceive?: { status: SendReceiveStatus };
}
