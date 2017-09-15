import { RangeStatic, StringMap } from 'quill';
import { SegmentFormat } from './quill/suggestions-theme';

export class Segment {
  private _text: string;
  private _range: RangeStatic;

  constructor(public readonly index: number) { }

  get text(): string {
    return this._text;
  }

  get range(): RangeStatic {
    return this._range;
  }

  update(text: string, range: RangeStatic, format: StringMap): boolean {
    this._text = text;
    this._range = range;
    return format.segment == null;
  }

  getFormat(): StringMap {
    const segmentFormat: SegmentFormat = {};
    return { segment: segmentFormat };
  }
}

export class TargetSegment extends Segment {
  isTrained: boolean = false;

  update(text: string, range: RangeStatic, format: StringMap): boolean {
    const isChanged = this.text != null && this.text !== text;
    const result = super.update(text, range, format);
    const segmentFormat: SegmentFormat = format.segment;
    if (segmentFormat != null) {
      const isTrained = segmentFormat.isTrained;
      if (isTrained != null) {
        this.isTrained = isTrained.toLowerCase() === 'true';
      }
    }
    if (isChanged) {
      this.isTrained = false;
      return true;
    }
    return result;
  }

  getFormat(): StringMap {
    const format = super.getFormat();
    format.segment.isTrained = this.isTrained.toString();
    return format;
  }
}
