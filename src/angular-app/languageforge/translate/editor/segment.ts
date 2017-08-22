import { RangeStatic, StringMap } from 'quill';

export class Segment {
  public text: string;
  public learnt: {
    text: string,
    documentSetId: string,
    previousRange: RangeStatic
  };
  public blockEndIndex: number = -1;
  public state: StringMap = {};

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
    this.learnt.text = this.state['machineHasLearnt'] ? this.text : '';
  }

  hasLearntText(text: string): boolean {
    return this.learnt.text.includes(text);
  }

  updateState(formats: StringMap): void {
    let state: StringMap = formats['state'];
    if (state != null) {
      let status = state['status'];
      if (status != null) {
        state['status'] = Number(status);
      }

      let machineHasLearnt = state['machineHasLearnt'];
      if (machineHasLearnt != null && typeof machineHasLearnt === 'string') {
        state['machineHasLearnt'] = machineHasLearnt.toLowerCase() === 'true';
      }

      this.state = state;
    } else {
      this.state = {};
    }
  }

  hasNoState(): boolean {
    return this.state['status'] == null && this.state['machineHasLearnt'] == null;
  }
}
