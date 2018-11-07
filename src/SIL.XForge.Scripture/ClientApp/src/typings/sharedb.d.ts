declare module 'sharedb/lib/client' {
  import { EventEmitter } from 'events';

  export interface OTType {
    name: 'ot-text' | 'ot-json0' | 'ot-text-tp2' | 'rich-text';
    uri: string;
  }

  export interface Snapshot {
    v: number;
    data: any;
    type: string;
  }

  export namespace types {
    const defaultType: OTType;
    const map: { [id: string]: OTType };
    function register(type: OTType): void;
  }

  export interface Error {
    code: number;
    message: string;
  }

  export type Callback = (err: Error) => void;

  export interface Connection {
    get(collection: string, id: string): Doc;
    close(): void;
  }

  export const Connection: {
    prototype: Connection;
    new(socket: any): Connection;
  }

  export interface Doc extends EventEmitter {
    type: OTType;
    id: string;
    data: any;
    version: number;

    subscribed: boolean;
    wantSubscribe: boolean;

    inflightOp: any;
    pendingOps: any[];

    on(event: 'load' | 'no write pending' | 'nothing pending', callback: () => void): this;
    on(event: 'create', callback: (source: any) => void): this;
    on(event: 'op' | 'before op', callback: (ops: any, source: any) => void): this;
    on(event: 'del', callback: (data: any, source: any) => void): this;
    on(event: 'error', callback: Callback): this;

    off(event: 'load' | 'no write pending' | 'nothing pending', callback: () => void): this;
    off(event: 'create', callback: (source: any) => void): this;
    off(event: 'op' | 'before op', callback: (ops: any, source: any) => void): this;
    off(event: 'del', callback: (data: any, source: any) => void): this;
    off(event: 'error', callback: Callback): this;

    addListener(event: 'load' | 'no write pending' | 'nothing pending', callback: () => void): this;
    addListener(event: 'create', callback: (source: any) => void): this;
    addListener(event: 'op' | 'before op', callback: (ops: any, source: any) => void): this;
    addListener(event: 'del', callback: (data: any, source: any) => void): this;
    addListener(event: 'error', callback: Callback): this;

    removeListener(event: 'load' | 'no write pending' | 'nothing pending', callback: () => void): this;
    removeListener(event: 'create', callback: (source: any) => void): this;
    removeListener(event: 'op' | 'before op', callback: (ops: any, source: any) => void): this;
    removeListener(event: 'del', callback: (data: any, source: any) => void): this;
    removeListener(event: 'error', callback: Callback): this;

    fetch(callback: Callback): void;
    subscribe(callback: Callback): void;
    unsubscribe(callback: Callback): void;
    ingestSnapshot(snapshot: Snapshot, callback: Callback): void;
    destroy(callback: Callback): void;
    create(data: any, type?: OTType | string, options?: any, callback?: Callback): void;
    submitOp(data: any, options?: any, callback?: Callback): void;
    del(options: any, callback: Callback): void;
    whenNothingPending(callback: Callback): void;
    hasWritePending(): boolean;
    flush(): void;
  }
}
