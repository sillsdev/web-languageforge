import * as RichText from 'rich-text';
import { fromEvent, Observable, of, Subject, merge } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Doc, OTType, Snapshot, types } from 'sharedb/lib/client';

types.register(RichText.type);

/**
 * This interface represents a realtime document. Realtime documents can be concurrently updated by multiple users. The
 * realtime document is synchronized in realtime for all users.
 */
export interface RealtimeDoc {
  readonly id: string;
  readonly data: any;
  readonly version: number;
  readonly type: OTType;
  readonly pendingOps: any[];

  idle(): Observable<void>;
  fetch(): Promise<void>;
  ingestSnapshot(snapshot: Snapshot): Promise<void>;
  subscribe(): Promise<void>;
  submitOp(op: any, source?: any): Promise<void>;

  /** Fires when underlying data is recreated. */
  onCreate(): Observable<void>;

  /** Fires when there are changes to underlying data. */
  remoteChanges(): Observable<any>;

  destroy(): Promise<void>;
}

/**
 * This is a ShareDB implementation of the realtime document interface.
 * 
 * Cache for an IndexedDB record. Also allows access thru to a mongodb record.
 * See RealtimeData for syncing this with IndexedDB.
 */
export class SharedbRealtimeDoc implements RealtimeDoc {
  constructor(private readonly doc: Doc) {}

  get id(): string {
    return this.doc.id;
  }

  get data(): any {
    return this.doc.data;
  }

  get version(): number {
    return this.doc.version;
  }

  get type(): OTType {
    return this.doc.type;
  }

  get pendingOps(): any[] {
    const pendingOps = [];
    if (this.doc.hasWritePending()) {
      if (this.doc.inflightOp != null && this.doc.inflightOp.op != null) {
        pendingOps.push(this.doc.inflightOp.op);
      }

      for (const opInfo of this.doc.pendingOps) {
        if (opInfo.op != null) {
          pendingOps.push(opInfo.op);
        }
      }
    }
    return pendingOps;
  }

  idle(): Observable<void> {
    return fromEvent(this.doc, 'no write pending');
  }

  onCreate(): Observable<void> {
    return fromEvent(this.doc, 'create');
  }

  fetch(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.doc.fetch(err => {
        if (err != null) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  ingestSnapshot(snapshot: Snapshot): Promise<void> {
    return new Promise((resolve, reject) => {
      this.doc.ingestSnapshot(snapshot, err => {
        if (err != null) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  subscribe(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.doc.subscribe(err => {
        if (err != null) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  submitOp(op: any, source?: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const options: any = {};
      if (source != null) {
        options.source = source;
      }
      this.doc.submitOp(op, options, err => {
        if (err != null) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  remoteChanges(): Observable<any> {
    return fromEvent<[any, any]>(this.doc, 'op').pipe(
      filter(([, source]) => !source),
      map(([ops]) => ops)
    );
  }

  destroy(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.doc.destroy(err => {
        if (err != null) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

/**
 * This is a memory-based implementation of the realtime document interface. It is useful for unit tests.
 */
export class MemoryRealtimeDoc implements RealtimeDoc {
  version: number = 1;
  readonly pendingOps: any[] = [];

  constructor(public readonly type: OTType, public readonly id: string, public data: any) {}

  onCreateSubject = new Subject<void>();

  idle(): Observable<void> {
    return of();
  }

  fetch(): Promise<void> {
    return Promise.resolve();
  }

  ingestSnapshot(_snapshot: Snapshot): Promise<void> {
    return Promise.resolve();
  }

  subscribe(): Promise<void> {
    return Promise.resolve();
  }

  submitOp(op: any, _source?: any): Promise<void> {
    if (op != null && this.type.normalize != null) {
      op = this.type.normalize(op);
    }
    this.data = this.type.apply(this.data, op);
    this.version++;
    return Promise.resolve();
  }

  remoteChanges(): Observable<any> {
    return of();
  }

  onCreate(): Observable<void> {
    return this.onCreateSubject.asObservable();
  }

  destroy(): Promise<void> {
    return Promise.resolve();
  }
}
