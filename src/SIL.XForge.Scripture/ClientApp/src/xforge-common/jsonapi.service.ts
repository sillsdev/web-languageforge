import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import Coordinator, {
  ConnectionStrategy, LogTruncationStrategy, RequestStrategy, SyncStrategy
} from '@orbit/coordinator';
import { Exception } from '@orbit/core';
import {
  buildQuery, ClientError, FindRecord, FindRecordsTerm, NetworkError, Operation, Query, QueryOrExpression, Record,
  RecordIdentity, RecordRelationship, ReplaceRecordOperation, Schema, SchemaSettings, Transform, TransformOrOperations
} from '@orbit/data';
import IndexedDBSource from '@orbit/indexeddb';
import IndexedDBBucket from '@orbit/indexeddb-bucket';
import Store from '@orbit/store';
import { clone, Dict, eq, extend } from '@orbit/utils';
import { ObjectId } from 'bson';
import { from, fromEventPattern, merge, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { XForgeJSONAPISource } from './jsonapi/xforge-jsonapi-source';
import { LiveQueryObservable } from './live-query-observable';
import { getResourceRefType, getResourceType, Resource, ResourceRef } from './models/resource';

@Injectable({
  providedIn: 'root'
})
export class JSONAPIService {
  private static readonly STORE = 'store';
  private static readonly REMOTE = 'remote';
  private static readonly BACKUP = 'backup';
  private static readonly RETRY_TIMEOUT = 5000;

  private schema: Schema;
  private bucket: IndexedDBBucket;
  private store: Store;
  private remote: XForgeJSONAPISource;
  private backup: IndexedDBSource;
  private coordinator: Coordinator;

  constructor(private readonly http: HttpClient) { }

  async init(accessToken: string): Promise<void> {
    const schemaDef = await this.http.get<SchemaSettings>('api/schema',
      { headers: { 'Content-Type': 'application/json' } }).toPromise();
    schemaDef.generateId = () => new ObjectId().toHexString();
    this.schema = new Schema(schemaDef);

    this.bucket = new IndexedDBBucket({
      namespace: 'xforge-state'
    });

    this.store = new Store({
      schema: this.schema,
      bucket: this.bucket
    });

    this.remote = new XForgeJSONAPISource({
      schema: this.schema,
      bucket: this.bucket,
      name: JSONAPIService.REMOTE,
      host: window.location.origin,
      namespace: 'api'
    });

    this.backup = new IndexedDBSource({
      schema: this.schema,
      bucket: this.bucket,
      name: JSONAPIService.BACKUP,
      namespace: 'xforge'
    });

    this.coordinator = new Coordinator({
      sources: [this.store, this.remote, this.backup],
      strategies: [
        // Do not queue queries that fail
        new RequestStrategy({
          source: JSONAPIService.STORE,
          on: 'queryFail',

          action: () => this.store.requestQueue.skip(),

          blocking: true
        }),
        // Purge a deleted resource from the cache when get() is called on it
        new RequestStrategy({
          source: JSONAPIService.REMOTE,
          on: 'pullFail',

          action: (q: Query, e: Exception) => this.purgeDeletedResource(q, e),

          blocking: true
        }),
        // Purge deleted resources from the cache when getAll() is called
        new ConnectionStrategy({
          source: JSONAPIService.REMOTE,
          on: 'pull',

          action: (q: Query, t: Transform[]) => this.purgeDeletedResources(q, t),
          filter: (q: Query) => q.expression.op === 'findRecords'
        }),
        // Retry sending updates to server when push fails
        new RequestStrategy({
          source: JSONAPIService.REMOTE,
          on: 'pushFail',

          action: (t: Transform, e: Exception) => this.handleFailedPush(t, e),

          blocking: true
        }),
        // Query the remote server whenever the store is queried
        new RequestStrategy({
          source: JSONAPIService.STORE,
          on: 'beforeQuery',

          target: JSONAPIService.REMOTE,
          action: 'pull',

          blocking: (q: Query) => q.options.blocking,

          catch: (e: Exception) => {
            this.store.requestQueue.skip();
            this.remote.requestQueue.skip();
            throw e;
          }
        }),
        // Update the remote server whenever the store is updated
        new RequestStrategy({
          source: JSONAPIService.STORE,
          on: 'beforeUpdate',

          target: JSONAPIService.REMOTE,
          filter: (t: Transform) => this.shouldUpdate(t, JSONAPIService.REMOTE),
          action: 'push',

          blocking: (t: Transform) => t.options.blocking
        }),
        // Sync all changes received from the remote server to the store
        new SyncStrategy({
          source: JSONAPIService.REMOTE,

          target: JSONAPIService.STORE,

          blocking: false
        }),
        // Sync all changes to the store to IndexedDB
        new SyncStrategy({
          source: JSONAPIService.STORE,

          target: JSONAPIService.BACKUP,
          filter: (t: Transform) => this.shouldUpdate(t, JSONAPIService.BACKUP),

          blocking: true
        }),
        new LogTruncationStrategy()
      ]
    });

    this.setAccessToken(accessToken);

    // restore backup
    const transforms = await this.backup.pull(q => q.findRecords());
    await this.store.sync(transforms);
    await this.coordinator.activate();
  }

  setAccessToken(accessToken: string): void {
    this.remote.defaultFetchSettings.headers['Authorization'] = 'Bearer ' + accessToken;
  }

  get(identity: RecordIdentity, persist = true): LiveQueryObservable<any> {
    return this.liveQuery(q => q.findRecord(identity), persist);
  }

  getRelated(identity: RecordIdentity, relationship: string, persist = true): LiveQueryObservable<any> {
    return this.liveQuery(q => q.findRelatedRecord(identity, relationship), persist);
  }

  getAll(type: string, expressionBuilder = (t: FindRecordsTerm) => t, persist = true): LiveQueryObservable<any[]> {
    return this.liveQuery(q => expressionBuilder(q.findRecords(type)), persist);
  }

  getAllRelated(identity: RecordIdentity, relationship: string, persist = true): LiveQueryObservable<any[]> {
    return this.liveQuery(q => q.findRelatedRecords(identity, relationship), persist);
  }

  create(resource: Resource, persist = true): Promise<string> {
    return this._create(resource, persist, false);
  }

  replace(resource: Resource, persist = true): Promise<void> {
    return this._replace(resource, persist, false);
  }

  update(resource: Resource, persist = true): Promise<void> {
    return this._update(resource, persist, false);
  }

  updateAttributes(identity: RecordIdentity, attrs: Dict<any>, persist = true): Promise<void> {
    return this._updateAttributes(identity, attrs, persist, false);
  }

  delete(identity: RecordIdentity, persist = true): Promise<void> {
    return this._delete(identity, persist, false);
  }

  replaceAllRelated(identity: RecordIdentity, relationship: string, related: RecordIdentity[], persist = true
  ): Promise<void> {
    return this._replaceAllRelated(identity, relationship, related, persist, false);
  }

  setRelated(identity: RecordIdentity, relationship: string, related: RecordIdentity, persist = true): Promise<void> {
    return this._setRelated(identity, relationship, related, persist, false);
  }

  onlineGet(identity: RecordIdentity, persist = true): Observable<any> {
    return this.query(q => q.findRecord(identity), persist);
  }

  onlineGetRelated(identity: RecordIdentity, relationship: string, persist = true): Observable<any> {
    return this.query(q => q.findRelatedRecord(identity, relationship), persist);
  }

  onlineGetAll(type: string, expressionBuilder = (t: FindRecordsTerm) => t, persist = true): Observable<any[]> {
    return this.query(q => expressionBuilder(q.findRecords(type)), persist);
  }

  onlineGetAllRelated(identity: RecordIdentity, relationship: string, persist = true): Observable<any[]> {
    return this.query(q => q.findRelatedRecords(identity, relationship), persist);
  }

  onlineCreate(resource: Resource, persist = true): Promise<string> {
    return this._create(resource, persist, true);
  }

  onlineReplace(resource: Resource, persist = true): Promise<void> {
    return this._replace(resource, persist, true);
  }

  onlineUpdate(resource: Resource, persist = true): Promise<void> {
    return this._update(resource, persist, true);
  }

  onlineUpdateAttributes(identity: RecordIdentity, attrs: Dict<any>, persist = true): Promise<void> {
    return this._updateAttributes(identity, attrs, persist, true);
  }

  onlineDelete(identity: RecordIdentity, persist = true): Promise<void> {
    return this._delete(identity, persist, true);
  }

  onlineReplaceAllRelated(identity: RecordIdentity, relationship: string, related: RecordIdentity[], persist = true
  ): Promise<void> {
    return this._replaceAllRelated(identity, relationship, related, persist, true);
  }

  onlineSetRelated(identity: RecordIdentity, relationship: string, related: RecordIdentity, persist = true): Promise<void> {
    return this._setRelated(identity, relationship, related, persist, true);
  }

  private liveQuery(queryOrExpression: QueryOrExpression, persist: boolean): LiveQueryObservable<any> {
    const query = buildQuery(queryOrExpression, this.getOptions(persist, false), undefined, this.store.queryBuilder);

    const patch$ = fromEventPattern(
      handler => this.store.cache.on('patch', handler),
      handler => this.store.cache.off('patch', handler),
    );

    const reset$ = fromEventPattern(
      handler => this.store.cache.on('reset', handler),
      handler => this.store.cache.off('reset', handler),
    );

    const source$ = merge(patch$, reset$).pipe(
      map(() => this.getCachedResults(query)),
      startWith(this.getCachedResults(query))
    );

    const observable = new LiveQueryObservable(source$, this.store, query);
    observable.update();
    return observable;
  }

  private query(queryOrExpression: QueryOrExpression, persist: boolean): Observable<any> {
    return from(this.store.query(queryOrExpression, this.getOptions(persist, true)))
      .pipe(map(r => this.convertResults(r)));
  }

  private async _create(resource: Resource, persist: boolean, blocking: boolean): Promise<string> {
    const record = this.createRecord(resource);
    this.schema.initializeRecord(record);
    resource.id = record.id;
    await this.transform(t => t.addRecord(record), persist, blocking);
    return record.id;
  }

  private _replace(resource: Resource, persist: boolean, blocking: boolean): Promise<void> {
    const record = this.createRecord(resource);
    return this.transform(t => t.replaceRecord(record), persist, blocking);
  }

  private _update(resource: Resource, persist: boolean, blocking: boolean): Promise<void> {
    const updatedRecord = this.createRecord(resource);
    const record = this.store.cache.query(q => q.findRecord(resource)) as Record;
    return this.transform(t => {
      const ops: Operation[] = [];

      const updatedAttrs = this.getUpdatedProps(record.attributes, updatedRecord.attributes);
      for (const attrName of updatedAttrs) {
        ops.push(t.replaceAttribute(record, attrName, updatedRecord.attributes[attrName]));
      }

      const updatedRels = this.getUpdatedProps(record.relationships, updatedRecord.relationships);
      for (const relName of updatedRels) {
        const relData = updatedRecord.relationships[relName].data;
        if (relData instanceof Array) {
          ops.push(t.replaceRelatedRecords(record, relName, relData));
        } else {
          ops.push(t.replaceRelatedRecord(record, relName, relData));
        }
      }
      return ops;
    }, persist, blocking);
  }

  private _updateAttributes(identity: RecordIdentity, attrs: Dict<any>, persist: boolean, blocking: boolean
  ): Promise<void> {
    return this.transform(t => {
      const ops: Operation[] = [];
      for (const [name, value] of Object.entries(attrs)) {
        ops.push(t.replaceAttribute(identity, name, value));
      }
      return ops;
    }, persist, blocking);
  }

  private _delete(identity: RecordIdentity, persist: boolean, blocking: boolean): Promise<void> {
    return this.transform(t => t.removeRecord(identity), persist, blocking);
  }

  private _replaceAllRelated(identity: RecordIdentity, relationship: string, related: RecordIdentity[],
    persist: boolean, blocking: boolean
  ): Promise<void> {
    return this.transform(t => t.replaceRelatedRecords(identity, relationship, related), persist, blocking);
  }

  private _setRelated(identity: RecordIdentity, relationship: string, related: RecordIdentity, persist: boolean,
    blocking: boolean
  ): Promise<void> {
    return this.transform(t => t.replaceRelatedRecord(identity, relationship, related), persist, blocking);
  }

  private transform(transformOrOperations: TransformOrOperations, persist: boolean, blocking: boolean): Promise<any> {
    return this.store.update(transformOrOperations, this.getOptions(persist, blocking));
  }

  private getOptions(persist: boolean, blocking: boolean): any {
    const update = [JSONAPIService.REMOTE];
    if (persist) {
      update.push(JSONAPIService.BACKUP);
    }

    return { update, blocking };
  }

  private getUpdatedProps(current: Dict<any>, updated: Dict<any>): string[] {
    const updatedProps: string[] = [];
    if (updated != null) {
      for (const name in updated) {
        if (updated.hasOwnProperty(name)) {
          const value = updated[name];
          if (current == null || !eq(current[name], value)) {
            updatedProps.push(name);
          }
        }
      }
    }
    return updatedProps;
  }

  private getCachedResults(query: Query): any {
    try {
      return this.convertResults(this.store.cache.query(query));
    } catch (ex) {
      return null;
    }
  }

  private convertResults(results: Record | Record[]): Resource | Resource[] {
    if (results instanceof Array) {
      return results.map(r => this.createResource(r));
    }
    return this.createResource(results);
  }

  private createResource(record: Record): Resource {
    const ResourceType = getResourceType(record.type);
    const resource = new ResourceType();
    resource.id = record.id;
    if (record.attributes != null) {
      extend(resource, record.attributes);
    }
    if (record.relationships != null) {
      for (const relName in record.relationships) {
        if (record.relationships.hasOwnProperty(relName)) {
          const relData = record.relationships[relName].data;
          if (relData instanceof Array) {
            resource[relName] = relData.map(ri => this.createResourceRef(ri));
          } else {
            resource[relName] = this.createResourceRef(relData);
          }
        }
      }
    }
    return resource;
  }

  private createResourceRef(identity: RecordIdentity): ResourceRef {
    if (identity === null) {
      return null;
    }
    const ResourceRefType = getResourceRefType(identity.type);
    return new ResourceRefType(identity.id);
  }

  private createRecord(resource: Resource): Record {
    const record: Record = {
      id: resource.id,
      type: resource.type
    };
    const model = this.schema.getModel(resource.type);
    if (model.attributes != null) {
      record.attributes = { };
      for (const attrName in model.attributes) {
        if (model.attributes.hasOwnProperty(attrName)) {
          const value = resource[attrName];
          if (value !== undefined) {
            record.attributes[attrName] = clone(value);
          }
        }
      }
    }
    if (model.relationships != null) {
      record.relationships = { };
      for (const relName in model.relationships) {
        if (model.relationships.hasOwnProperty(relName)) {
          const ref = resource[relName] as ResourceRef | ResourceRef[];
          if (ref !== undefined) {
            let recRel: RecordRelationship;
            if (ref instanceof Array) {
              recRel = { data: ref.map(r => this.createRecordIdentity(r)) };
            } else {
              recRel = { data: this.createRecordIdentity(ref) };
            }
            record.relationships[relName] = recRel;
          }
        }
      }
    }
    return record;
  }

  private createRecordIdentity(ref: ResourceRef): RecordIdentity {
    if (ref === null) {
      return null;
    }
    return { type: ref.type, id: ref.id };
  }

  private shouldUpdate(transform: Transform, source: string): boolean {
    if (transform.options == null || transform.options.update == null) {
      return true;
    }
    const update: string[] = transform.options.update;
    return update.includes(source);
  }

  private purgeDeletedResource(query: Query, ex: Exception): void {
    if (ex instanceof ClientError) {
      const response: Response = (ex as any).response;
      if (response.status === 404 && query.expression.op === 'findRecord') {
        this.removeFromBackup([(query.expression as FindRecord).record]);
      }
    }
  }

  private purgeDeletedResources(query: Query, result: Transform[]): void {
    const cachedResources: Record[] = this.store.cache.query(query);
    if (cachedResources.length === 0) {
      return;
    }

    const transform = result[0];
    const remoteResourceIds = new Set<string>();
    for (const op of transform.operations) {
      remoteResourceIds.add((op as ReplaceRecordOperation).record.id);
    }

    const deletedResources: Record[] = [];
    for (const cachedResource of cachedResources) {
      if (!remoteResourceIds.has(cachedResource.id)) {
        deletedResources.push(cachedResource);
      }
    }

    this.removeFromBackup(deletedResources);
  }

  private handleFailedPush(transform: Transform, ex: Exception): Promise<void> {
    if (ex instanceof NetworkError && this.shouldUpdate(transform, JSONAPIService.BACKUP)) {
      setTimeout(() => this.remote.requestQueue.retry(), JSONAPIService.RETRY_TIMEOUT);
    } else {
      if (this.store.transformLog.contains(transform.id)) {
        this.store.rollback(transform.id, -1);
      }
      return this.remote.requestQueue.skip();
    }
  }

  private removeFromBackup(resources: Record[]): void {
    if (resources.length === 0) {
      return;
    }

    this.store.update(t => {
      const ops: Operation[] = [];
      for (const resource of resources) {
        ops.push(t.removeRecord(resource));
      }
      return ops;
    }, { update: [JSONAPIService.BACKUP] });
  }
}
