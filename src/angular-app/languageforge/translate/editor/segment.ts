import { RangeStatic, StringMap } from 'quill';
import { MachineFormat } from './quill/suggestions-theme';

export class Segment {
  isTrained: boolean = false;

  constructor(public index: number, public text: string, public range: RangeStatic) { }

  updateFromFormat(format: StringMap): void {
    const machineFormat: MachineFormat = format.segment;
    if (machineFormat != null) {
      const isTrained = machineFormat.isTrained;
      if (isTrained != null) {
        this.isTrained = isTrained.toLowerCase() === 'true';
      }
    }
  }

  getFormat(): StringMap {
    const machineFormat: MachineFormat = {};
    machineFormat.isTrained = this.isTrained.toString();
    return { segment: machineFormat };
  }
}
