import { RangeStatic } from 'quill';

import { Segmenter } from './segmenter';

const PARA_STYLES: Set<string> = new Set<string>([
  'p',
  'm',
  'pmo',
  'pm',
  'pmc',
  'pmr',
  'pi',
  'mi',
  'cls',
  'li',
  'pc',
  'pr',
  'ph',
  'lit'
]);

function isParagraphStyle(style: string): boolean {
  style = style.replace(/[0-9]/g, '');
  return PARA_STYLES.has(style);
}

export class UsxSegmenter extends Segmenter {
  protected updateSegments(): void {
    const delta = this.editor.getContents();
    this.reset();
    const nextIds = new Map<string, number>();
    const paraVerses = new Map<string, RangeStatic>();
    let chapter = '';
    let curIndex = 0;
    let curRangeLen = 0;
    let curVerseRef = '';
    for (const op of delta.ops) {
      const len = typeof op.insert === 'string' ? op.insert.length : 1;
      if (op.insert !== '\n' && op.attributes == null) {
        curRangeLen += len;
      } else {
        if (op.insert === '\n' || op.attributes.para != null) {
          const style = op.attributes == null ? null : (op.attributes.para.style as string);
          if (style == null || isParagraphStyle(style)) {
            for (const _ch of op.insert) {
              if (curVerseRef !== '') {
                paraVerses.set(curVerseRef, { index: curIndex, length: curRangeLen });
                curIndex += curRangeLen;
                curRangeLen = 0;
              }

              for (let [verseRef, verseRange] of paraVerses) {
                if (this._segments.has(verseRef)) {
                  verseRef = this.getParagraphRef(nextIds, verseRef + '/' + style);
                }
                this._segments.set(verseRef, verseRange);
                this._lastSegmentRef = verseRef;
              }
              paraVerses.clear();
              curIndex++;
            }
            continue;
          }

          const ref = this.getParagraphRef(nextIds, style);
          this._segments.set(ref, { index: curIndex, length: curRangeLen });
          this._lastSegmentRef = ref;
          curVerseRef = '';
          paraVerses.clear();
          curIndex += curRangeLen + len;
          curRangeLen = 0;
        } else if (op.attributes.chapter != null) {
          chapter = op.insert.chapter;
          curVerseRef = '';
          curIndex += curRangeLen + len;
          curRangeLen = 0;
        } else if (op.attributes.verse != null) {
          if (curVerseRef !== '') {
            paraVerses.set(curVerseRef, { index: curIndex, length: curRangeLen });
          }
          curVerseRef = 'verse_' + chapter + '_' + op.insert.verse;
          curIndex += curRangeLen + len;
          curRangeLen = 0;
        } else {
          curRangeLen += len;
        }
      }
    }
  }

  private getParagraphRef(nextIds: Map<string, number>, prefix: string): string {
    let nextId = nextIds.get(prefix);
    if (nextId == null) {
      nextId = 1;
    }
    const id = nextId++;
    nextIds.set(prefix, nextId);
    return prefix + '_' + id;
  }
}
