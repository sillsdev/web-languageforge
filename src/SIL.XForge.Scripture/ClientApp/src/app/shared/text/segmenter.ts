import Quill, { RangeStatic } from 'quill';

/** A segmenter is responsible for parsing text and finding all segments and their locations. */
export abstract class Segmenter {
  protected readonly _segments: Map<string, RangeStatic> = new Map<string, RangeStatic>();
  protected _lastSegmentRef: string = '';

  constructor(protected readonly editor: Quill) {}

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

  hasSegmentRange(ref: string): boolean {
    return this._segments.has(ref);
  }

  getSegmentRange(ref: string): RangeStatic {
    return this._segments.get(ref);
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
