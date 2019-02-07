import { LatinSentenceTokenizer } from '@sillsdev/machine';
import { RangeStatic } from 'quill';

import { Segmenter } from './segmenter';

export class MachineSegmenter extends Segmenter {
  private readonly tokenizer = new LatinSentenceTokenizer();

  protected updateSegments(): void {
    const text = this.text;
    const segmentRanges: RangeStatic[] = this.tokenizer.tokenize(text).map(r => ({ index: r.start, length: r.length }));
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
