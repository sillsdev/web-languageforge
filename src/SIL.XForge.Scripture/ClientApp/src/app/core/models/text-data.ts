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

  constructor(doc: RealtimeDoc, store: RealtimeOfflineStore) {
    super(TextData.TYPE, doc, store);
  }

  protected prepareDataForStore(data: DeltaStatic): any {
    return { ops: data.ops };
  }
}
