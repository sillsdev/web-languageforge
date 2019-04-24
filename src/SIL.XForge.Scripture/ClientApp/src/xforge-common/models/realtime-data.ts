import { RecordIdentity } from '@orbit/data';
import { merge, Observable, Subscription } from 'rxjs';

import { RealtimeDoc } from '../realtime-doc';
import { RealtimeOfflineData, RealtimeOfflineStore } from '../realtime-offline-store';

export interface RealtimeDataConstructor {
  readonly TYPE: string;

  new (doc: RealtimeDoc, store: RealtimeOfflineStore): RealtimeData;
}

export abstract class RealtimeData<T = any, Ops = any> implements RecordIdentity {
  private readonly subscription: Subscription;

  private offlineSnapshotVersion: number;

  constructor(
    public readonly type: string,
    private readonly doc: RealtimeDoc,
    private readonly store: RealtimeOfflineStore
  ) {
    this.subscription = merge(this.doc.remoteChanges(), this.doc.idle()).subscribe(() => this.updateOfflineData());
  }

  get id(): string {
    return this.doc.id;
  }

  get data(): T {
    return this.doc.data;
  }

  async subscribe(): Promise<void> {
    const offlineData = await this.store.getItem(this.id);
    if (offlineData != null) {
      if (offlineData.pendingOps.length > 0) {
        await this.doc.fetch();
        await Promise.all(offlineData.pendingOps.map(op => this.doc.submitOp(op)));
      } else {
        await this.doc.ingestSnapshot(offlineData.snapshot);
        this.offlineSnapshotVersion = this.doc.version;
      }
    }
    await this.doc.subscribe();
  }

  remoteChanges(): Observable<Ops> {
    return this.doc.remoteChanges();
  }

  async submit(ops: Ops, source?: any): Promise<void> {
    const submitPromise = this.doc.submitOp(ops, source);
    // update offline data when the op is first submitted
    this.updateOfflineData();
    await submitPromise;
    // update again when the op has been acknowledged
    this.updateOfflineData();
  }

  updateOfflineData(): void {
    if (this.doc.type == null) {
      return;
    }

    const pendingOps = this.doc.pendingOps.map(op => this.prepareDataForStore(op));

    // if the snapshot hasn't changed, then don't bother to update
    if (pendingOps.length === 0 && this.doc.version === this.offlineSnapshotVersion) {
      return;
    }

    this.offlineSnapshotVersion = this.doc.version;
    const offlineData: RealtimeOfflineData = {
      snapshot: {
        v: this.doc.version,
        data: this.prepareDataForStore(this.doc.data),
        type: this.doc.type
      },
      pendingOps
    };
    this.store.setItem(this.id, offlineData);
  }

  dispose(): Promise<void> {
    this.subscription.unsubscribe();
    return this.doc.destroy();
  }

  protected prepareDataForStore(data: T): any {
    return data;
  }
}
