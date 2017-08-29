import { RangeStatic, StringMap } from 'quill';
import { FormatMachine } from './quill/suggestions-theme';

export class Segment {
  text: string;
  learnt: {
    text: string,
    documentSetId: string,
    previousSelection: RangeStatic
  };
  blockEndIndex: number = -1;
  state: {
    status?: number,
    machineHasLearnt?: boolean
  } = {};

  constructor(text?: string) {
    this.text = text || '';
    this.learnt = {
      text: '',
      documentSetId: '',
      previousSelection: {
        index: undefined,
        length: undefined
      }
    };
  }

  setLearntText(): void {
    this.learnt.text = this.state.machineHasLearnt != null && this.state.machineHasLearnt ? this.text : '';
  }

  hasLearntText(text: string): boolean {
    return this.learnt.text.includes(text);
  }

  updateState(formats: StringMap): void {
    const format: FormatMachine = formats.state;
    this.state = {};
    if (format != null) {
      const status = format.status;
      if (status != null) {
        this.state.status = Number(status);
      }

      const machineHasLearnt = format.machineHasLearnt;
      if (machineHasLearnt != null) {
        this.state.machineHasLearnt = machineHasLearnt.toLowerCase() === 'true';
      }
    }
  }

  hasNoState(): boolean {
    return this.state.status == null && this.state.machineHasLearnt == null;
  }
}
