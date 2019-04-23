import { Operation, Query, QueryBuilder, QueryExpression, QueryTerm, Transform, TransformBuilder } from '@orbit/data';
import Quill, { RangeStatic, QuillOptionsStatic, BoundsStatic } from 'quill';

/* SystemJS module definition */
declare var module: NodeModule;
interface NodeModule {
  id: string;
}

declare module '@orbit/data' {
  export type QueryBuilderFunc = (b: QueryBuilder) => QueryOrExpression;
  export type QueryOrExpression = Query | QueryExpression | QueryTerm | QueryBuilderFunc;
  export function buildQuery(
    queryOrExpression: QueryOrExpression,
    queryOptions?: object,
    queryId?: string,
    queryBuilder?: QueryBuilder
  ): Query;

  export type TransformBuilderFunc = (b: TransformBuilder) => TransformOrOperations;
  export type TransformOrOperations = Transform | Operation | Operation[] | TransformBuilderFunc;
}

declare module 'quill' {
  export interface History {
    clear(): void;
    undo(): void;
    redo(): void;
    cutoff(): void;
  }

  export interface Quill {
    theme: Theme;
    container: Element;
    scrollingContainer: Element;
    selection: Selection;
    history: History;
  }

  export interface Selection {
    getBounds(index: number, length?: number): ClientRect;
  }

  export class Theme {
    quill: Quill;
    options: QuillOptionsStatic;
    constructor(quill: Quill, options: QuillOptionsStatic);
  }

  export class SnowTheme extends Theme {
    pickers: Picker[];
    extendToolbar(toolbar: any): void;
  }

  export class Tooltip {
    quill: Quill;
    boundsContainer: HTMLElement;
    root: HTMLElement;
    constructor(quill: Quill, boundsContainer: HTMLElement);
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
    handlers: { [format: string]: (value: any) => void };

    attach(input: HTMLElement): void;
    update(range: RangeStatic): void;
  }

  export class Picker {
    update(): void;
  }
}
