import { RecordIdentity } from '@orbit/data';
import { merge, Observable, Subscription } from 'rxjs';

import { RealtimeDoc } from '../realtime-doc';
import { RealtimeOfflineData, RealtimeOfflineStore } from '../realtime-offline-store';

export interface RealtimeDataConstructor {
  readonly TYPE: string;

  new (doc: RealtimeDoc, store: RealtimeOfflineStore): RealtimeData;
}

/**
 * This is the base class for all realtime data models. This class manages the interaction between offline storage of
 * the data and the underlying realtime (ShareDB) document.
 *
 * @template T The actual data type.
 * @template Ops The operations data type.
 */
export abstract class RealtimeData<T = any, Ops = any> implements RecordIdentity {
  private readonly subscription: Subscription;

  private offlineSnapshotVersion: number;

  constructor(
    public readonly type: string,
    private readonly doc: RealtimeDoc,
    private readonly store: RealtimeOfflineStore
  ) {
    this.subscription = merge(this.doc.remoteChanges(), this.doc.idle(), this.doc.onCreate()).subscribe(() =>
      this.updateOfflineData()
    );
  }

  get id(): string {
    return this.doc.id;
  }

  get data(): Readonly<T> {
    return this.doc.data;
  }

  /**
   * Subscribes to remote changes for the realtime data.
   * For this record, update the RealtimeDoc cache, if any, from IndexedDB.
   *
   * @returns {Promise<void>} Resolves when succesfully subscribed to remote changes.
   */
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

  /** Fires when underlying data is recreated. */
  onCreate(): Observable<void> {
    return this.doc.onCreate();
  }

  /**
   * Returns an observable that emits whenever any remote changes occur.
   *
   * @returns {Observable<Ops>} The remote changes observable.
   */
  remoteChanges(): Observable<Ops> {
    return this.doc.remoteChanges();
  }

  /**
   * Submits the specified mutation operations. The operations are applied to the actual data and then submitted to the
   * realtime server. Data can only be updated using operations and should not be updated directly.
   *
   * @param {Ops} ops The operations to submit.
   * @param {*} [source] The source.
   * @returns {Promise<void>} Resolves when the operations have been successfully submitted.
   */
  async submit(ops: Ops, source?: any): Promise<void> {
    const submitPromise = this.doc.submitOp(ops, source);
    // update offline data when the op is first submitted
    this.updateOfflineData();
    await submitPromise;
    // update again when the op has been acknowledged
    this.updateOfflineData();
  }

  /**
   * Updates offline storage with the current state of the realtime data.
   */
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
        type: this.doc.type.name
      },
      pendingOps
    };
    this.store.setItem(this.id, offlineData);
  }

  /**
   * Unsubscribes and destroys this realtime data model.
   *
   * @returns {Promise<void>} Resolves when the data has been successfully disposed.
   */
  dispose(): Promise<void> {
    this.subscription.unsubscribe();
    return this.doc.destroy();
  }

  protected prepareDataForStore(data: T): any {
    return data;
  }
}
