import { DeltaStatic } from 'quill';
import { Doc } from 'sharedb/lib/client';

import { RealtimeData, realtimeData } from '@xforge-common/models/realtime-data';

@realtimeData
export class TextData extends RealtimeData<DeltaStatic> {
  static readonly TYPE = 'textData';

  constructor(doc: Doc, store: LocalForage) {
    super(TextData.TYPE, doc, store);
  }
}
