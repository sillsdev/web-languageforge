import { DeltaStatic } from 'quill';
import { Doc } from 'sharedb/lib/client';

import { RealtimeDoc } from 'xforge-common/models/realtime-doc';
import { Text } from './text';

export class TextData extends RealtimeDoc<DeltaStatic> {
  static readonly TYPE = Text.TYPE;

  constructor(doc: Doc, store: LocalForage) {
    super(TextData.TYPE, doc, store);
  }
}
