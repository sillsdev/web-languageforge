import { Snapshot } from 'sharedb/lib/client';

/** Structure of a record in the xforge-realtime IndexedDB database. */
export interface RealtimeOfflineData {
  snapshot: Snapshot;
  pendingOps: any[];
}

/**
 * This class is an abstraction for the offline storage of realtime documents. Each instance is used to store documents
 * for a particular type. This implemenation is based on LocalForage/IndexedDB. This abstraction can be mocked for
 * easier unit testing.
 */
export class RealtimeOfflineStore {
  constructor(private readonly store: LocalForage) {}

  getItem(id: string): Promise<RealtimeOfflineData> {
    return this.store.getItem(id);
  }

  setItem(id: string, offlineData: RealtimeOfflineData): Promise<RealtimeOfflineData> {
    return this.store.setItem(id, offlineData);
  }

  delete(id: string): Promise<void> {
    return this.store.removeItem(id);
  }
}
