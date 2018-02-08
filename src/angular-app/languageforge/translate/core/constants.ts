export class DocType {
  static readonly SOURCE = 'source';
  static readonly TARGET = 'target';
}

export enum SaveState {
  Unsaved,
  Saving,
  Saved,
  Unedited
}
