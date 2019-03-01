import { Snapshot } from 'sharedb/lib/client';

export interface RealtimeOfflineData {
  snapshot: Snapshot;
  pendingOps: any[];
}

/**
 * This class is an abstraction for the local database, i.e LocalForage/IndexedDB. This allows for easier unit testing.
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
