declare module 'sharedb/lib/client' {
  export type DocCallback = (error: any) => void;
  export type OnOpsFunction = (op: any, source: any) => void;

  export interface Snapshot {
    v: number;
    data: any;
    type: string;
  }

  export interface OTType {
    name: string;
    uri: string;
  }

  export interface Connection {
    get(collection: string, id: string): Doc;
    close(): void;
  }

  export const Connection: {
    prototype: Connection;
    new(socket: WebSocket): Connection;
  }

  export interface Doc {
    type: OTType;
    id: string;
    data: any;
    version: number;
    fetch(callback: DocCallback): void;
    subscribe(callback: DocCallback): void;
    ingestSnapshot(snapshot: Snapshot, callback: DocCallback): void;
    destroy(): void;
    on(eventName: string, onOpsFunction: OnOpsFunction): void;
    create(data: any[], type?: string, options?: any, callback?: DocCallback): void;
    submitOp(op: any, options?: any, callback?: DocCallback): void;
    del(options?: any, callback?: DocCallback): void;
    whenNothingPending(callback: DocCallback): void;
    removeListener(eventName: string, onOpsFunction: OnOpsFunction): void;
  }

  export namespace types {
    const defaultType: OTType;
    const map: { [id: string]: OTType };
    function register(type: OTType): void;
  }
}
