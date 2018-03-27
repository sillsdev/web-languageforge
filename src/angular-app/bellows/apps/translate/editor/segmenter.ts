import { RangeStatic } from 'quill';
import { MachineService } from '../core/machine.service';
import { DocumentEditor } from './document-editor';

export abstract class Segmenter {
  protected readonly _segments: Map<string, RangeStatic> = new Map<string, RangeStatic>();
  protected _lastSegmentRef: string = '';

  constructor(protected readonly doc: DocumentEditor) { }

  get lastSegmentRef(): string {
    return this._lastSegmentRef;
  }

  get segments(): IterableIterator<[string, RangeStatic]> {
    return this._segments.entries();
  }

  update(textChange: boolean): void {
    if (this._lastSegmentRef === '' || textChange) {
      this.updateSegments();
    }
  }

  reset(): void {
    this._segments.clear();
    this._lastSegmentRef = '';
  }

  getSegmentRange(ref: string): RangeStatic {
    if (this.doc.isTextEmpty) {
      return { index: 0, length: 0 };
    }

    return this._segments.has(ref) ? this._segments.get(ref) : { index: this.doc.quill.getLength() - 1, length: 0 };
  }

  getSegmentRef(range: RangeStatic): string {
    let segmentRef: string;
    let maxOverlap = -1;
    if (range != null) {
      for (const [ref, segmentRange] of this.segments) {
        const segEnd = segmentRange.index + segmentRange.length;
        if (range.index <= segEnd) {
          const rangeEnd = range.index + range.length;
          const overlap = Math.min(rangeEnd, segEnd) - Math.max(range.index, segmentRange.index);
          if (overlap > maxOverlap) {
            segmentRef = ref;
            maxOverlap = overlap;
          }
          if (rangeEnd <= segEnd) {
            break;
          }
        }
      }
    }
    return segmentRef;
  }

  protected abstract updateSegments(): void;
}

export class MachineSegmenter extends Segmenter {
  constructor(doc: DocumentEditor, private readonly machine: MachineService) {
    super(doc);
  }

  protected updateSegments(): void {
    const text = this.doc.quill.getText().substr(0, this.doc.quill.getLength() - 1);
    const segmentRanges = this.machine.tokenizeDocumentText(this.doc.docType, text);
    if (segmentRanges.length === 0) {
      segmentRanges.push({ index: 0, length: 0 });
    } else {
      const lastSegmentRange = segmentRanges[segmentRanges.length - 1];
      const lastSegmentEnd = lastSegmentRange.index + lastSegmentRange.length;
      if (lastSegmentEnd < text.length) {
        segmentRanges.push({ index: text.length, length: 0 });
      }
    }
    this.reset();
    for (let i = 0; i < segmentRanges.length; i++) {
      this._segments.set(i.toString(), segmentRanges[i]);
    }
    this._lastSegmentRef = (segmentRanges.length - 1).toString();
  }
}

export class UsxSegmenter extends Segmenter {
  private static readonly ParagraphStyles: Set<string> = new Set<string>([
    'p', 'm', 'pmo', 'pm', 'pmc', 'pmr', 'pi', 'mi', 'cls', 'li', 'pc', 'pr', 'ph', 'lit'
  ]);

  protected updateSegments(): void {
    const delta = this.doc.quill.getContents();
    this.reset();
    const nextIds = new Map<string, number>();
    const paraVerses = new Map<string, RangeStatic>();
    let chapter = '';
    let curIndex = 0;
    let curRangeLen = 0;
    let curVerseRef = '';
    for (const op of delta.ops) {
      const len = typeof op.insert === 'string' ? op.insert.length : 1;
      if (op.attributes == null) {
        curRangeLen += len;
      } else {
        if (op.attributes.para != null) {
          const style = op.attributes.para.style as string;
          if (UsxSegmenter.isParagraphStyle(style)) {
            for (const ch of op.insert) {
              if (curVerseRef !== '') {
                paraVerses.set(curVerseRef, { index: curIndex, length: curRangeLen });
                curIndex += curRangeLen;
                curRangeLen = 0;
              }

              for (let [verseRef, verseRange] of paraVerses) {
                if (this._segments.has(verseRef)) {
                  verseRef = UsxSegmenter.getParagraphRef(nextIds, verseRef + '/' + style);
                }
                this._segments.set(verseRef, verseRange);
                this._lastSegmentRef = verseRef;
              }
              paraVerses.clear();
              curIndex++;
            }
            continue;
          }

          const ref = UsxSegmenter.getParagraphRef(nextIds, style);
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

  private static getParagraphRef(nextIds: Map<string, number>, prefix: string): string {
    let nextId = nextIds.get(prefix);
    if (nextId == null) {
      nextId = 1;
    }
    const id = nextId++;
    nextIds.set(prefix, nextId);
    return prefix + '_' + id;
  }

  private static isParagraphStyle(style: string): boolean {
    style = style.replace(/[0-9]/g, '');
    return UsxSegmenter.ParagraphStyles.has(style);
  }
}
