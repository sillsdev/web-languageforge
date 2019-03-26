import { DeltaStatic } from 'quill';

import { RealtimeData } from 'xforge-common/models/realtime-data';
import { RealtimeDoc } from 'xforge-common/realtime-doc';
import { RealtimeOfflineStore } from 'xforge-common/realtime-offline-store';
import { Text } from './text';

export type TextType = 'source' | 'target';

export function getTextDataIdStr(textId: string, chapter: number, textType: TextType): string {
  return `${textId}:${chapter}:${textType}`;
}

export class TextDataId {
  constructor(
    public readonly textId: string,
    public readonly chapter: number,
    public readonly textType: TextType = 'target'
  ) {}

  toString(): string {
    return getTextDataIdStr(this.textId, this.chapter, this.textType);
  }
}

export class TextData extends RealtimeData<DeltaStatic, DeltaStatic> {
  static readonly TYPE = Text.TYPE;
  VERSE_REGEXP = /^verse_[0-9]{1,}_[0-9]{1,}$/;

  constructor(doc: RealtimeDoc, store: RealtimeOfflineStore) {
    super(TextData.TYPE, doc, store);
  }

  get emptyVerseCount(): number {
    let emptyVerses = 0;
    for (const op of this.data.ops) {
      if (op.attributes && op.attributes.segment) {
        if (op.insert && op.insert.blank) {
          if (this.VERSE_REGEXP.test(op.attributes.segment)) {
            emptyVerses++;
          }
        }
      }
    }
    return emptyVerses;
  }

  protected prepareDataForStore(data: DeltaStatic): any {
    return { ops: data.ops };
  }
}
