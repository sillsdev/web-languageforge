import { DeltaStatic } from 'quill';

import { RealtimeData } from 'xforge-common/models/realtime-data';
import { RealtimeDoc } from 'xforge-common/realtime-doc';
import { RealtimeOfflineStore } from 'xforge-common/realtime-offline-store';
import { Text } from './text';

export class TextData extends RealtimeData<DeltaStatic, DeltaStatic> {
  static readonly TYPE = Text.TYPE;

  constructor(doc: RealtimeDoc, store: RealtimeOfflineStore) {
    super(TextData.TYPE, doc, store);
  }

  protected prepareDataForStore(data: DeltaStatic): any {
    return { ops: data.ops };
  }
}
