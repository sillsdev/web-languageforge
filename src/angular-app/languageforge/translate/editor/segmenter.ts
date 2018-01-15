import { RangeStatic } from 'quill';
import { MachineService } from '../core/machine.service';
import { DocumentEditor } from './document-editor';

export abstract class Segmenter {
  protected readonly segments: Map<string, RangeStatic> = new Map<string, RangeStatic>();
  protected _lastSegmentRef: string = '';

  constructor(protected readonly doc: DocumentEditor) { }

  get lastSegmentRef(): string {
    return this._lastSegmentRef;
  }

  update(textChange: boolean): void {
    if (this._lastSegmentRef === '' || textChange) {
      this.updateSegments();
    }
  }

  reset(): void {
    this.segments.clear();
    this._lastSegmentRef = '';
  }

  getSegmentRange(ref: string): RangeStatic {
    if (this.doc.isTextEmpty) {
      return { index: 0, length: 0 };
    }

    return this.segments.has(ref) ? this.segments.get(ref) : { index: this.doc.quill.getLength() - 1, length: 0 };
  }

  getSegmentRef(range: RangeStatic): string {
    let segmentRef: string;
    if (range != null && range.length === 0) {
      for (const [ref, segmentRange] of this.segments) {
        if (range.index <= segmentRange.index + segmentRange.length) {
          segmentRef = ref;
          break;
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
      this.segments.set(i.toString(), segmentRanges[i]);
    }
    this._lastSegmentRef = (segmentRanges.length - 1).toString();
  }
}

export class UsxSegmenter extends Segmenter {
  protected updateSegments(): void {
    const delta = this.doc.quill.getContents();
    this.reset();
    const nextStyleIds = new Map<string, number>();
    let chapter = '';
    let verse = '';
    let curIndex = 0;
    let curRangeLen = 0;
    delta.forEach(op => {
      const len = typeof op.insert === 'string' ? op.insert.length : 1;
      if (op.attributes == null) {
        curRangeLen += len;
      } else {
        if (op.attributes.para != null) {
          const style = op.attributes.para.style as string;
          let nextId = nextStyleIds.get(style);
          if (nextId == null) {
            nextId = 0;
            nextStyleIds.set(style, nextId);
          }

          if (curRangeLen > 0) {
            this._lastSegmentRef = style + '_' + nextId;
            this.segments.set(this._lastSegmentRef, { index: curIndex, length: curRangeLen });
          }
          curIndex += curRangeLen + len;
          curRangeLen = 0;
          nextId++;
          nextStyleIds.set(style, nextId);
        } else if (op.attributes.chapter != null) {
          chapter = op.attributes.chapter.number as string;
          verse = '';
          this._lastSegmentRef = 'chapter_' + chapter;
          this.segments.set(this._lastSegmentRef, { index: curIndex, length: curRangeLen });
          curIndex += curRangeLen + len;
          curRangeLen = 0;
        } else if (op.attributes.verse != null) {
          if (verse !== '') {
            const verseText = this.doc.quill.getText(curIndex, curRangeLen);
            let verseRangeLen = curRangeLen;
            for (let i = verseText.length - 1; i >= 0 && UsxSegmenter.isWhitespace(verseText[i]); i--) {
              verseRangeLen--;
            }
            this._lastSegmentRef = 'verse_' + chapter + ':' + verse;
            this.segments.set(this._lastSegmentRef, { index: curIndex, length: verseRangeLen });
          }
          curIndex += curRangeLen;
          curRangeLen = len;
          verse = op.attributes.verse.number as string;
        } else {
          curRangeLen += len;
        }
      }
    });
  }

  private static isWhitespace(char: string): boolean {
    return /\s/.test(char);
  }
}
