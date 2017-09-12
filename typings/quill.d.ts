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

  export class SnowTheme extends Theme {
    extendToolbar(toolbar: any): void;
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

  export class Toolbar extends Module {
    controls: Array<[string, HTMLElement]>;
    handlers: { [format: string]: (value: any) => void; }

    attach(input: HTMLElement): void;
    update(range: RangeStatic): void;
  }
}
