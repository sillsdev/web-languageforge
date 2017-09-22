import { RangeStatic, StringMap } from 'quill';

export class Segment {
  private _text: string;
  private _range: RangeStatic;
  private initialText: string;

  constructor(public readonly index: number) { }

  get text(): string {
    return this._text;
  }

  get range(): RangeStatic {
    return this._range;
  }

  get isChanged(): boolean {
    return this._text !== this.initialText;
  }

  update(text: string, range: RangeStatic): void {
    this._text = text;
    this._range = range;
    if (this.initialText == null) {
      this.initialText = text;
    }
  }
}
