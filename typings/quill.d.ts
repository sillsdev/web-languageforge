import Quill, { RangeStatic, QuillOptionsStatic, BoundsStatic } from 'quill';

declare module 'quill' {
  export namespace Quill {
    const sources: {
      API: 'api',
      SILENT: 'silent',
      USER: 'user'
    };
    const events: {
      EDITOR_CHANGE: 'editor-change',
      SELECTION_CHANGE: 'selection-change',
      TEXT_CHANGE: 'text-change'
    };
  }

  export interface Quill {
    theme: Theme;
    container: any;
  }

  export class Theme {
    quill: Quill;
    options: QuillOptionsStatic;
    constructor(quill: Quill, options: QuillOptionsStatic);
  }

  export class Tooltip {
    quill: Quill;
    boundsContainer: BoundsStatic | Element;
    root: any;
    constructor(quill: Quill, boundsContainer: BoundsStatic);
    hide(): void;
    position(reference: any): number;
    show(): void;
  }

  export class Module {
    quill: Quill;
    options: QuillOptionsStatic;
    constructor(quill: Quill, options: QuillOptionsStatic);
  }
}
