import { Snapshot } from 'sharedb/lib/client';

export interface RealtimeOfflineData {
  snapshot: Snapshot;
  pendingOps: any[];
}

export class RealtimeOfflineStore {
  constructor(private readonly store: LocalForage) {}

  getItem(id: string): Promise<RealtimeOfflineData> {
    return this.store.getItem(id);
  }

  setItem(id: string, offlineData: RealtimeOfflineData): Promise<RealtimeOfflineData> {
    return this.store.setItem(id, offlineData);
  }
}
