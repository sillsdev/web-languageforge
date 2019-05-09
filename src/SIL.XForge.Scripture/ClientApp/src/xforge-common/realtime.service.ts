import { Injectable } from '@angular/core';
import { RecordIdentity } from '@orbit/data';
import { underscore } from '@orbit/utils';
import * as localforage from 'localforage';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { Connection } from 'sharedb/lib/client';
import { environment } from '../environments/environment';
import { LocationService } from './location.service';
import { DomainModel } from './models/domain-model';
import { RealtimeData } from './models/realtime-data';
import { SharedbRealtimeDoc } from './realtime-doc';
import { RealtimeOfflineStore } from './realtime-offline-store';

function serializeRecordIdentity(identity: RecordIdentity): string {
  return `${identity.type}:${identity.id}`;
}

/**
 * The realtime service is responsible for retrieving realtime data models. This service transparently manages the
 * interaction between three data sources: a memory cache, an IndexedDB database, and a realtime collaboration server
 * (ShareDB). Models are cached and reused until the service is reset.
 */
@Injectable({
  providedIn: 'root'
})
export class RealtimeService {
  private ws: ReconnectingWebSocket;
  private connection: Connection;
  private readonly dataMap = new Map<string, Promise<RealtimeData>>();
  private readonly stores = new Map<string, RealtimeOfflineStore>();
  private resetPromise: Promise<void> = Promise.resolve();
  private accessToken: string;

  constructor(private readonly domainModel: DomainModel, private readonly locationService: LocationService) {}

  init(accessToken: string): void {
    this.accessToken = accessToken;
    this.ws = new ReconnectingWebSocket(() => this.getUrl());
    this.connection = new Connection(this.ws);
  }

  setAccessToken(accessToken: string): void {
    this.accessToken = accessToken;
  }

  /**
   * Gets the realtime data with the specified identity. It is not necessary to subscribe to the returned model.
   *
   * @param {RecordIdentity} identity The data identity.
   * @returns {Promise<T>} The realtime data.
   */
  async get<T extends RealtimeData>(identity: RecordIdentity): Promise<T> {
    // wait for pending reset to complete before getting data
    await this.resetPromise;
    const key = serializeRecordIdentity(identity);
    let dataPromise = this.dataMap.get(key);
    if (dataPromise == null) {
      dataPromise = this.createData(identity);
      this.dataMap.set(key, dataPromise);
    }
    return await (dataPromise as Promise<T>);
  }

  /**
   * Resets the realtime data cache.
   */
  reset(): void {
    if (this.dataMap.size > 0) {
      this.resetPromise = this.clearDataMap();
    }
  }

  /**
   * Deletes realtime data from local storage.
   *
   * @param {RecordIdentity} identity The data identity.
   * @returns {Promise<void>} Resolves when the data has been deleted.
   */
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
    url += environment.realtimeUrl + '?access_token=' + this.accessToken;
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

  private async clearDataMap(): Promise<void> {
    const disposePromises: Promise<void>[] = [];
    for (const dataPromise of this.dataMap.values()) {
      disposePromises.push(this.disposeData(dataPromise));
    }
    this.dataMap.clear();
    await Promise.all(disposePromises);
  }

  private async disposeData(dataPromise: Promise<RealtimeData>): Promise<void> {
    const data = await dataPromise;
    await data.dispose();
  }
}
