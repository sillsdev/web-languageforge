import Quill, { RangeStatic, QuillOptionsStatic, BoundsStatic } from 'quill';

declare module 'quill' {
  export namespace Quill {
    const sources: {
      USER: 'user'
    };
    const events: {
      TEXT_CHANGE: 'text-change'
    };
  }

  export interface Quill {
    theme: Theme;
    selection: Selection
    container: any;
  }

  export interface Selection {
    lastRange: RangeStatic;
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
    constructor(quill: Quill, options: QuillOptionsStatic);
  }
}
