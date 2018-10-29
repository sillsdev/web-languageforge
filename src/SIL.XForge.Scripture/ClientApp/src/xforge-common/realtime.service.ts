import { Injectable } from '@angular/core';
import { RecordIdentity } from '@orbit/data';
import { underscore } from '@orbit/utils';
import * as localforage from 'localforage';
import ReconnectingWebSocket from 'reconnecting-websocket';
import * as RichText from 'rich-text';
import { Connection, Doc, types } from 'sharedb/lib/client';

import { getRealtimeDataType, OfflineData, RealtimeData } from './models/realtime-data';

types.register(RichText.type);

@Injectable({
  providedIn: 'root'
})
export class RealtimeService {
  private readonly ws: ReconnectingWebSocket;
  private readonly connection: Connection;
  private readonly dataMap = new Map<RecordIdentity, Promise<any>>();
  private readonly stores = new Map<string, LocalForage>();

  constructor() {
    this.ws = new ReconnectingWebSocket('wss://' + window.location.host + '/sharedb/');
    this.connection = new Connection(this.ws);
  }

  connect<T extends RealtimeData>(identity: RecordIdentity): Promise<T> {
    if (!this.dataMap.has(identity)) {
      const doc = this.connection.get(underscore(identity.type), identity.id);
      const store = this.getStore(identity.type);
      const RealtimeDataType = getRealtimeDataType(identity.type);
      const data = new RealtimeDataType(doc, store);
      this.dataMap.set(identity, new Promise<any>((resolve, reject) => {
        data.subscribe().then(() => resolve(data), err => reject(err));
      }));
    }

    return this.dataMap.get(identity);
  }

  disconnect(data: RealtimeData): Promise<void> {
    this.dataMap.delete(data);
    return data.dispose();
  }

  private getStore(type: string): LocalForage {
    if (!this.stores.has(type)) {
      this.stores.set(type, localforage.createInstance({ name: type }));
    }
    return this.stores.get(type);
  }
}
