import { RecordIdentity } from '@orbit/data';
import { fromEvent, Observable, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Doc, Snapshot } from 'sharedb/lib/client';

export interface RealtimeDocConstructor {
  readonly TYPE: string;

  new (doc: Doc, store: LocalForage): RealtimeDoc;
}

interface OfflineData {
  snapshot: Snapshot;
  pendingOps: any[];
}

export abstract class RealtimeDoc<T = any> implements RecordIdentity {
  private readonly opSub: Subscription;
  private readonly pendingSub: Subscription;

  constructor(public readonly type: string, private readonly doc: Doc, private readonly store: LocalForage) {
    this.opSub = this.remoteChanges().subscribe(() => this.updateOfflineData());
    this.pendingSub = fromEvent(this.doc, 'no write pending').subscribe(() => this.updateOfflineData());
  }

  get id(): string {
    return this.doc.id;
  }

  get data(): T {
    return this.doc.data;
  }

  subscribe(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.store.getItem(this.id).then((offlineData: OfflineData) => {
        if (offlineData != null) {
          this.doc.ingestSnapshot(offlineData.snapshot, err => {
            if (err) {
              reject(err);
            }
            this.doc.pendingOps = offlineData.pendingOps;
            this.doc.flush();
            this._subscribe(resolve, reject);
          });
        } else {
          this._subscribe(resolve, reject);
        }
      });
    });
  }

  remoteChanges(): Observable<T> {
    return fromEvent<[T, any]>(this.doc, 'op').pipe(
      filter(([, source]) => !source),
      map(([ops]) => ops)
    );
  }

  submit(ops: T, source: any): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.doc.submitOp(ops, { source }, err => {
        if (err) {
          reject(err);
        } else {
          this.updateOfflineData();
          resolve();
        }
      });
      this.updateOfflineData();
    });
  }

  updateOfflineData(): void {
    const pendingOps = [];
    if (this.doc.hasWritePending()) {
      if (this.doc.inflightOp != null) {
        pendingOps.push(this.doc.inflightOp);
      }
      pendingOps.concat(this.doc.pendingOps);
    }
    const offlineData: OfflineData = {
      snapshot: {
        v: this.doc.version,
        data: this.doc.data,
        type: this.doc.type.name
      },
      pendingOps
    };
    this.store.setItem(this.id, offlineData);
  }

  dispose(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.pendingSub.unsubscribe();
      this.opSub.unsubscribe();
      this.doc.destroy(err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  private _subscribe(resolve: () => void, reject: (reason?: any) => void): void {
    this.doc.subscribe(err => {
      if (err) {
        reject(err);
      }
      resolve();
    });
  }
}
