import * as OtJson0 from 'ot-json0';
import { fromEvent, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Doc, Snapshot } from 'sharedb/lib/client';

export interface RealtimeDoc {
  readonly id: string;
  readonly data: any;
  readonly version: number;
  readonly type: string;
  readonly pendingOps: any[];

  idle(): Observable<void>;
  fetch(): Promise<void>;
  ingestSnapshot(snapshot: Snapshot): Promise<void>;
  subscribe(): Promise<void>;
  submitOp(data: any, source?: any): Promise<void>;
  remoteChanges(): Observable<any>;
  destroy(): Promise<void>;
}

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

  get type(): string {
    if (this.doc.type == null) {
      return null;
    }
    return this.doc.type.name;
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

  fetch(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.doc.fetch(err => {
        if (err != null) {
          reject(err);
        } else {
          if (this.doc.type === null) {
            this.doc.create([], OtJson0.type.name, { source: 'realtime-doc' }, createErr => {
              if (createErr) {
                reject(createErr);
              } else {
                resolve();
              }
            });
          } else {
            resolve();
          }
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
    return new Promise(async (resolve, reject) => {
      if (this.doc.type === null) {
        await this.fetch();
      }
      this.doc.subscribe(err => {
        if (err != null) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  submitOp(data: any, source?: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const options: any = {};
      if (source != null) {
        options.source = source;
      }
      this.doc.submitOp(data, options, err => {
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
