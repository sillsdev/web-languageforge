import { Injectable } from '@angular/core';
import { RecordIdentity } from '@orbit/data';
import { underscore } from '@orbit/utils';
import * as localforage from 'localforage';
import ReconnectingWebSocket from 'reconnecting-websocket';
import * as RichText from 'rich-text';
import { Connection, types } from 'sharedb/lib/client';
import { environment } from '../environments/environment';
import { AuthService } from './auth.service';
import { LocationService } from './location.service';
import { DomainModel } from './models/domain-model';
import { RealtimeData } from './models/realtime-data';
import { SharedbRealtimeDoc } from './realtime-doc';
import { RealtimeOfflineStore } from './realtime-offline-store';

types.register(RichText.type);

function serializeRecordIdentity(identity: RecordIdentity): string {
  return `${identity.type}:${identity.id}`;
}

@Injectable({
  providedIn: 'root'
})
export class RealtimeService {
  private readonly ws: ReconnectingWebSocket;
  private readonly connection: Connection;
  private readonly dataMap = new Map<string, Promise<RealtimeData>>();
  private readonly stores = new Map<string, RealtimeOfflineStore>();

  constructor(
    private readonly domainModel: DomainModel,
    private readonly locationService: LocationService,
    private readonly authService: AuthService
  ) {
    this.ws = new ReconnectingWebSocket(() => this.getUrl());
    this.connection = new Connection(this.ws);
  }

  get<T extends RealtimeData>(identity: RecordIdentity): Promise<T> {
    const key = serializeRecordIdentity(identity);
    let dataPromise = this.dataMap.get(key);
    if (dataPromise == null) {
      dataPromise = this.createData(identity);
      this.dataMap.set(key, dataPromise);
    }
    return dataPromise as Promise<T>;
  }

  reset(): void {
    for (const dataPromise of this.dataMap.values()) {
      this.disposeData(dataPromise);
    }
    this.dataMap.clear();
  }

  localDelete(identity: RecordIdentity): Promise<void> {
    const store = this.getStore(identity.type);
    return store.delete(identity.id);
  }

  private getUrl(): string {
    const protocol = this.locationService.protocol === 'https:' ? 'wss:' : 'ws:';
    let url = `${protocol}//${this.locationService.hostname}`;
    if ('realtimePort' in environment && environment.realtimePort != null && environment.realtimePort !== 0) {
      url += `:${environment.realtimePort}`;
    }
    url += environment.realtimeUrl + '?access_token=' + this.authService.accessToken;
    return url;
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

  private async createData(identity: RecordIdentity): Promise<RealtimeData> {
    const sharedbDoc = this.connection.get(underscore(identity.type) + '_data', identity.id);
    const store = this.getStore(identity.type);
    const RealtimeDataType = this.domainModel.getRealtimeDataType(identity.type);
    const realtimeData = new RealtimeDataType(new SharedbRealtimeDoc(sharedbDoc), store);
    await realtimeData.subscribe();
    return realtimeData;
  }

  private async disposeData(dataPromise: Promise<RealtimeData>) {
    const data = await dataPromise;
    await data.dispose();
  }
}
