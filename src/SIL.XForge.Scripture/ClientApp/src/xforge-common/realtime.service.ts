import { Injectable } from '@angular/core';
import { RecordIdentity } from '@orbit/data';
import { underscore } from '@orbit/utils';
import * as localforage from 'localforage';
import ReconnectingWebSocket from 'reconnecting-websocket';
import * as RichText from 'rich-text';
import { Connection, types } from 'sharedb/lib/client';

import { environment } from '../environments/environment';
import { LocationService } from './location.service';
import { DomainModel } from './models/domain-model';
import { RealtimeData } from './models/realtime-data';
import { SharedbRealtimeDoc } from './realtime-doc';
import { RealtimeOfflineStore } from './realtime-offline-store';

types.register(RichText.type);

interface ConnectedData {
  promise: Promise<any>;
  refCount: number;
}

function serializeRecordIdentity(identity: RecordIdentity): string {
  return `${identity.type}:${identity.id}`;
}

@Injectable({
  providedIn: 'root'
})
export class RealtimeService {
  private readonly ws: ReconnectingWebSocket;
  private readonly connection: Connection;
  private readonly connectedDataMap = new Map<string, ConnectedData>();
  private readonly stores = new Map<string, RealtimeOfflineStore>();

  constructor(private readonly domainModel: DomainModel, private readonly locationService: LocationService) {
    const protocol = this.locationService.protocol === 'https:' ? 'wss:' : 'ws:';
    let url = `${protocol}//${this.locationService.hostname}`;
    if ('realtimePort' in environment && environment.realtimePort != null && environment.realtimePort !== 0) {
      url += `:${environment.realtimePort}`;
    }
    url += environment.realtimeUrl;

    this.ws = new ReconnectingWebSocket(url);
    this.connection = new Connection(this.ws);
  }

  connect<T extends RealtimeData>(identity: RecordIdentity): Promise<T> {
    const key = serializeRecordIdentity(identity);
    let connectedData = this.connectedDataMap.get(key);
    if (connectedData == null) {
      const sharedbDoc = this.connection.get(underscore(identity.type) + '_data', identity.id);
      const store = this.getStore(identity.type);
      const RealtimeDataType = this.domainModel.getRealtimeDataType(identity.type);
      const realtimeData = new RealtimeDataType(new SharedbRealtimeDoc(sharedbDoc), store);
      const promise = new Promise<any>((resolve, reject) => {
        realtimeData.subscribe().then(() => resolve(realtimeData), err => reject(err));
      });
      connectedData = { promise, refCount: 0 };
      this.connectedDataMap.set(key, connectedData);
    }
    connectedData.refCount++;
    return connectedData.promise;
  }

  disconnect(data: RealtimeData): Promise<void> {
    const key = serializeRecordIdentity(data);
    const connectedData = this.connectedDataMap.get(key);
    connectedData.refCount--;
    if (connectedData.refCount === 0) {
      this.connectedDataMap.delete(key);
      return data.dispose();
    }
    return Promise.resolve();
  }

  localDelete(identity: RecordIdentity): Promise<void> {
    const store = this.getStore(identity.type);
    return store.delete(identity.id);
  }

  private getStore(type: string): RealtimeOfflineStore {
    if (!this.stores.has(type)) {
      this.stores.set(
        type,
        new RealtimeOfflineStore(localforage.createInstance({ name: 'xforge-realtime', storeName: type }))
      );
    }
    return this.stores.get(type);
  }
}
