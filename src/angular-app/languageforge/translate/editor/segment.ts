import { RangeStatic, StringMap } from 'quill';
import { FormatMachine } from './quill/suggestions-theme';

export class Segment {
  public text: string;
  public learnt: {
    text: string,
    documentSetId: string,
    previousRange: RangeStatic
  };
  public blockEndIndex: number = -1;
  public state: {
    status?: number,
    machineHasLearnt?: boolean
  } = {};

  constructor(text?: string) {
    this.text = text || '';
    this.learnt = {
      text: '',
      documentSetId: '',
      previousRange: {
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
    let format: FormatMachine = formats['state'];
    this.state = {};
    if (format != null) {
      let status = format.status;
      if (status != null) {
        this.state.status = Number(status);
      }

      let machineHasLearnt = format.machineHasLearnt;
      if (machineHasLearnt != null) {
        this.state.machineHasLearnt = machineHasLearnt.toLowerCase() === 'true';
      }
    }
  }

  hasNoState(): boolean {
    return this.state.status == null && this.state.machineHasLearnt == null;
  }
}
