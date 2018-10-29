import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import Coordinator, {
  ConnectionStrategy, LogTruncationStrategy, RequestStrategy, SyncStrategy
} from '@orbit/coordinator';
import { Exception } from '@orbit/core';
import {
  AttributeFilterSpecifier, AttributeSortSpecifier, buildQuery, ClientError, FilterSpecifier, FindRecord, NetworkError,
  OffsetLimitPageSpecifier, Operation, Query, QueryBuilder, QueryOrExpression, QueryTerm, Record, RecordIdentity,
  RecordRelationship, ReplaceRecordOperation, Schema, SchemaSettings, SortSpecifier, Transform, TransformOrOperations
} from '@orbit/data';
import IndexedDBSource from '@orbit/indexeddb';
import IndexedDBBucket from '@orbit/indexeddb-bucket';
import Store from '@orbit/store';
import { clone, dasherize, Dict, eq, extend } from '@orbit/utils';
import { ObjectId } from 'bson';
import { from, fromEventPattern, merge, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { XForgeJSONAPISource } from './jsonapi/xforge-jsonapi-source';
import { LiveQueryObservable } from './live-query-observable';
import { getResourceRefType, getResourceType, Resource, ResourceRef } from './models/resource';

export interface Filter<T = any> {
  name: Extract<keyof T, string>;
  value: any;
}

export interface Sort<T = any> {
  name: Extract<keyof T, string>;
  order: 'ascending' | 'descending';
}

export interface GetAllParameters<T = any> {
  filter?: Filter<T>[];
  sort?: Sort<T>[];
  page?: {
    offset?: number;
    limit?: number;
  };
}

/**
 * The JSON-API service is responsible for performing CRUD operations on resource models. This service transparently
 * manages the interaction between three data sources: a memory cache, an IndexedDB database, and a JSON-API server.
 *
 * This service provides implementations for two types of CRUD operations: optimistic and pessimistic.
 *
 * Optimisitic operations are used for offline-only views. Optimistic queries return a live observable that will return
 * the current results from the cache immediately, and then listen for any updated results that are returned from the
 * JSON-API server or performed locally.
 *
 * Pessimistic operations are used for online-only views. Pessimistic queries will only return the single value that is
 * returned from the JSON-API server. Pessimistic methods are prefixed with "online".
 *
 * The service also provides methods for getting resources from the local cache. This can be useful for getting related
 * resources after performing a remote query that includes relationship data.
 */
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

  /**
   * Initializes the service. This should be called at application startup after the user has logged in.
   *
   * @param {string} accessToken The user's current access token.
   */
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

  /**
   * Updates the access token. This should be called when the access token is refreshed.
   *
   * @param {string} accessToken The user's current access token.
   */
  setAccessToken(accessToken: string): void {
    this.remote.defaultFetchSettings.headers['Authorization'] = 'Bearer ' + accessToken;
  }

  /**
   * Gets the resource with the specified identity optimistically.
   *
   * @template T The resource type.
   * @param {RecordIdentity} identity The resource identity.
   * @param {string[]} [include] Optional. A path of relationship names that specifies the related resources to include
   * in the results from the server. The included resources are not returned but cached locally.
   * @param {boolean} [persist=true] Optional. Indicates whether the resource should be persisted in IndexedDB.
   * @returns {LiveQueryObservable<T>} The live query observable.
   */
  get<T extends Resource>(identity: RecordIdentity, include?: string[], persist: boolean = true
  ): LiveQueryObservable<T> {
    return this.liveQuery(q => q.findRecord(identity), include, persist);
  }

  /**
   * Gets the resource from a many-to-one relationship optimistically. It is recommended that the "relationship"
   * parameter is checked for type safety using the {@link nameof} function.
   *
   * @example <caption>Type safe usage</caption>
   * jsonApiService.getRelated({ type: SFProjectUser.TYPE, id }, nameof<SFProjectUser>('user'));
   * @template T The resource type.
   * @param {RecordIdentity} identity The resource identity.
   * @param {string} relationship The relationship name.
   * @param {string[]} [include] Optional. A path of relationship names that specifies the related resources to include
   * in the results from the server. The included resources are not returned but cached locally.
   * @param {boolean} [persist=true] Optional. Indicates whether the resource should be persisted in IndexedDB.
   * @returns {LiveQueryObservable<T>} The live query observable.
   */
  getRelated<T extends Resource>(identity: RecordIdentity, relationship: string, include?: string[],
    persist: boolean = true
  ): LiveQueryObservable<T> {
    return this.liveQuery(q => q.findRelatedRecord(identity, relationship), include, persist);
  }

  /**
   * Gets all resources of the specified type optimistically. It is recommeneded that callers use the generic version
   * of {@link GetAllParameters} to ensure type safety.
   *
   * @template T The resource type.
   * @param {string} type The resource type.
   * @param {GetAllParameters} parameters Optional. Filtering, sorting, and paging parameters.
   * @param {string[]} [include] Optional. A path of relationship names that specifies the related resources to include
   * in the results from the server. The included resources are not returned but cached locally.
   * @param {boolean} [persist=true] Optional. Indicates whether the resources should be persisted in IndexedDB.
   * @returns {LiveQueryObservable<T[]>} The live query observable.
   */
  getAll<T extends Resource>(type: string, parameters?: GetAllParameters, include?: string[], persist: boolean = true
  ): LiveQueryObservable<T[]> {
    return this.liveQuery(q => this.getAllQuery(q, type, parameters), include, persist);
  }

  /**
   * Gets all resources from a one-to-many relationship optimistically. It is recommended that the "relationship"
   * parameter is checked for type safety using the {@link nameof} function.
   *
   * @example <caption>Type safe usage</caption>
   * jsonApiService.getAllRelated({ type: SFUser.TYPE, id }, nameof<SFUser>('projects'));
   * @template T The resource type.
   * @param {RecordIdentity} identity The resource identity.
   * @param {string} relationship The relationship name.
   * @param {string[]} [include] Optional. A path of relationship names that specifies the related resources to include
   * in the results from the server. The included resources are not returned but cached locally.
   * @param {boolean} [persist=true] Optional. Indicates whether the resources should be persisted in IndexedDB.
   * @returns {LiveQueryObservable<T[]>} The live query observable.
   */
  getAllRelated<T extends Resource>(identity: RecordIdentity, relationship: string, include?: string[],
    persist: boolean = true
  ): LiveQueryObservable<T[]> {
    return this.liveQuery(q => q.findRelatedRecords(identity, relationship), include, persist);
  }

  /**
   * Creates a new resource optimistically.
   *
   * @param {Resource} resource The new resource.
   * @param {boolean} [persist=true] Optional. Indicates whether the resource should be persisted in IndexedDB.
   * @returns {Promise<string>} Resolves when the resource is created locally. Returns the new resource's ID.
   */
  create(resource: Resource, persist: boolean = true): Promise<string> {
    return this._create(resource, persist, false);
  }

  /**
   * Completely replaces an existing resource optimistically.
   *
   * @param {Resource} resource The new resource.
   * @param {boolean} [persist=true] Optional. Indicates whether the resource should be persisted in IndexedDB.
   * @returns {Promise<void>} Resolves when the resource is replaced locally.
   */
  replace(resource: Resource, persist: boolean = true): Promise<void> {
    return this._replace(resource, persist, false);
  }

  /**
   * Updates an existing resource optimistically. This method only updates the attributes and relationships that have
   * changed.
   *
   * @param {Resource} resource The resource to update.
   * @param {boolean} [persist=true] Optional. Indicates whether the resource should be persisted in IndexedDB.
   * @returns {Promise<void>} Resolves when the resource is updated locally.
   */
  update(resource: Resource, persist: boolean = true): Promise<void> {
    return this._update(resource, persist, false);
  }

  /**
   * Updates the attributes of an existing resource optimistically. It is recommeneded that attributes are specified
   * using a partial type of the resource class, e.g. "Partial<User>".
   *
   * @example <caption>Type safe usage</caption>
   * const attrs: Partial<User> = { username: 'new' };
   * jsonApiServer.updateAttributes({ type: User.TYPE, id }, attrs);
   * @param {RecordIdentity} identity The resource identity.
   * @param {Dict<any>} attrs The attribute values to update.
   * @param {boolean} [persist=true] Optional. Indicates whether the resource should be persisted in IndexedDB.
   * @returns {Promise<void>} Resolves when the resource is updated locally.
   */
  updateAttributes(identity: RecordIdentity, attrs: Dict<any>, persist: boolean = true): Promise<void> {
    return this._updateAttributes(identity, attrs, persist, false);
  }

  /**
   * Deletes a resource optimistically.
   *
   * @param {RecordIdentity} identity The resource identity.
   * @param {boolean} [persist=true] Optional. Indicates whether the resource should be persisted in IndexedDB.
   * @returns {Promise<void>} Resolves when the resource is deleted locally.
   */
  delete(identity: RecordIdentity, persist: boolean = true): Promise<void> {
    return this._delete(identity, persist, false);
  }

  /**
   * Replaces all resources in a one-to-many relationship optimistically. It is recommended that the "relationship"
   * parameter is checked for type safety using the {@link nameof} function.
   *
   * @example <caption>Type safe usage</caption>
   * jsonApiService.replaceAllRelated({ type: SFProject.TYPE, id }, nameof<SFProject>('users'), []);
   * @param {RecordIdentity} identity The resource identity.
   * @param {string} relationship The relationship name.
   * @param {RecordIdentity[]} related The new related resource identities.
   * @param {boolean} [persist=true] Optional. Indicates whether the resources should be persisted in IndexedDB.
   * @returns {Promise<void>} Resolves when the resources are replaced locally.
   */
  replaceAllRelated(identity: RecordIdentity, relationship: string, related: RecordIdentity[], persist: boolean = true
  ): Promise<void> {
    return this._replaceAllRelated(identity, relationship, related, persist, false);
  }

  /**
   * Sets the resource in a many-to-one relationship optimistically. It is recommended that the "relationship"
   * parameter is checked for type safety using the {@link nameof} function.
   *
   * @example <caption>Type safe usage</caption>
   * jsonApiService.setRelated({ type: SFProjectUser.TYPE, id }, nameof<SFProjectUser>('user'), null);
   * @param {RecordIdentity} identity The resource identity.
   * @param {string} relationship The relationship name.
   * @param {RecordIdentity} related The new related resource identity.
   * @param {boolean} [persist=true] Optional. Indicates whether the resource should be persisted in IndexedDB.
   * @returns {Promise<void>} Resolves when the resource is set locally.
   */
  setRelated(identity: RecordIdentity, relationship: string, related: RecordIdentity | null, persist: boolean = true
  ): Promise<void> {
    return this._setRelated(identity, relationship, related, persist, false);
  }

  /**
   * Gets the resource with the specified identity pessimistically.
   *
   * @template T The resource type.
   * @param {RecordIdentity} identity The resource identity.
   * @param {string[]} [include] Optional. A path of relationship names that specifies the related resources to include
   * in the results from the server. The included resources are not returned but cached locally.
   * @param {boolean} [persist=true] Optional. Indicates whether the resource should be persisted in IndexedDB.
   * @returns {Observable<T>} The query observable.
   */
  onlineGet<T extends Resource>(identity: RecordIdentity, include?: string[], persist: boolean = true): Observable<T> {
    return this.query(q => q.findRecord(identity), include, persist);
  }

  /**
   * Gets the resource from a many-to-one relationship pessimistically. It is recommended that the "relationship"
   * parameter is checked for type safety using the {@link nameof} function.
   *
   * @example <caption>Type safe usage</caption>
   * jsonApiService.onlineGetRelated({ type: SFProjectUser.TYPE, id }, nameof<SFProjectUser>('user'));
   * @template T The resource type.
   * @param {RecordIdentity} identity The resource identity.
   * @param {string} relationship The relationship name.
   * @param {string[]} [include] Optional. A path of relationship names that specifies the related resources to include
   * in the results from the server. The included resources are not returned but cached locally.
   * @param {boolean} [persist=true] Optional. Indicates whether the resource should be persisted in IndexedDB.
   * @returns {Observable<T>} The query observable.
   */
  onlineGetRelated<T extends Resource>(identity: RecordIdentity, relationship: string, include?: string[],
    persist: boolean = true
  ): Observable<T> {
    return this.query(q => q.findRelatedRecord(identity, relationship), include, persist);
  }

  /**
   * Gets all resources of the specified type pessimistically. It is recommeneded that callers use the generic version
   * of {@link GetAllParameters} to ensure type safety.
   *
   * @template T The resource type.
   * @param {string} type The resource type.
   * @param {GetAllParameters} parameters Optional. Filtering, sorting, and paging parameters.
   * @param {string[]} [include] Optional. A path of relationship names that specifies the related resources to include
   * in the results from the server. The included resources are not returned but cached locally.
   * @param {boolean} [persist=true] Optional. Indicates whether the resources should be persisted in IndexedDB.
   * @returns {Observable<T[]>} The query observable.
   */
  onlineGetAll<T extends Resource>(type: string, parameters?: GetAllParameters, include?: string[],
    persist: boolean = true
  ): Observable<T[]> {
    return this.query(q => this.getAllQuery(q, type, parameters), include, persist);
  }

  /**
   * Gets all resources from a one-to-many relationship pessimistically. It is recommended that the "relationship"
   * parameter is checked for type safety using the {@link nameof} function.
   *
   * @example <caption>Type safe usage</caption>
   * jsonApiService.onlineGetAllRelated({ type: SFUser.TYPE, id }, nameof<SFUser>('projects'));
   * @template T The resource type.
   * @param {RecordIdentity} identity The resource identity.
   * @param {string} relationship The relationship name.
   * @param {string[]} [include] Optional. A path of relationship names that specifies the related resources to include
   * in the results from the server. The included resources are not returned but cached locally.
   * @param {boolean} [persist=true] Optional. Indicates whether the resources should be persisted in IndexedDB.
   * @returns {Observable<T[]>} The live query observable.
   */
  onlineGetAllRelated<T extends Resource>(identity: RecordIdentity, relationship: string, include?: string[],
    persist: boolean = true
  ): Observable<T[]> {
    return this.query(q => q.findRelatedRecords(identity, relationship), include, persist);
  }

  /**
   * Creates a new resource pessimistically.
   *
   * @param {Resource} resource The new resource.
   * @param {boolean} [persist=true] Optional. Indicates whether the resource should be persisted in IndexedDB.
   * @returns {Promise<string>} Resolves when the resource is created remotely. Returns the new resource's ID.
   */
  onlineCreate(resource: Resource, persist: boolean = true): Promise<string> {
    return this._create(resource, persist, true);
  }

  /**
   * Completely replaces an existing resource pessimistically.
   *
   * @param {Resource} resource The new resource.
   * @param {boolean} [persist=true] Optional. Indicates whether the resource should be persisted in IndexedDB.
   * @returns {Promise<void>} Resolves when the resource is replaced remotely.
   */
  onlineReplace(resource: Resource, persist: boolean = true): Promise<void> {
    return this._replace(resource, persist, true);
  }

  /**
   * Updates an existing resource pessimistically. This method only updates the attributes and relationships that have
   * changed.
   *
   * @param {Resource} resource The resource to update.
   * @param {boolean} [persist=true] Optional. Indicates whether the resource should be persisted in IndexedDB.
   * @returns {Promise<void>} Resolves when the resource is updated remotely.
   */
  onlineUpdate(resource: Resource, persist: boolean = true): Promise<void> {
    return this._update(resource, persist, true);
  }

  /**
   * Updates the attributes of an existing resource pessimistically. It is recommeneded that attributes are specified
   * using a partial type of the resource class, e.g. "Partial<User>".
   *
   * @example <caption>Type safe usage</caption>
   * const attrs: Partial<User> = { username: 'new' };
   * jsonApiServer.onlineUpdateAttributes({ type: User.TYPE, id }, attrs);
   * @param {RecordIdentity} identity The resource identity.
   * @param {Dict<any>} attrs The attribute values to update.
   * @param {boolean} [persist=true] Optional. Indicates whether the resource should be persisted in IndexedDB.
   * @returns {Promise<void>} Resolves when the resource is updated remotely.
   */
  onlineUpdateAttributes(identity: RecordIdentity, attrs: Dict<any>, persist: boolean = true): Promise<void> {
    return this._updateAttributes(identity, attrs, persist, true);
  }

  /**
   * Deletes a resource pessimistically.
   *
   * @param {RecordIdentity} identity The resource identity.
   * @param {boolean} [persist=true] Optional. Indicates whether the resource should be persisted in IndexedDB.
   * @returns {Promise<void>} Resolves when the resource is deleted remotely.
   */
  onlineDelete(identity: RecordIdentity, persist: boolean = true): Promise<void> {
    return this._delete(identity, persist, true);
  }

  /**
   * Replaces all resources in a one-to-many relationship pessimistically. It is recommended that the "relationship"
   * parameter is checked for type safety using the {@link nameof} function.
   *
   * @example <caption>Type safe usage</caption>
   * jsonApiService.onlineReplaceAllRelated({ type: SFProject.TYPE, id }, nameof<SFProject>('users'), []);
   * @param {RecordIdentity} identity The resource identity.
   * @param {string} relationship The relationship name.
   * @param {RecordIdentity[]} related The new related resource identities.
   * @param {boolean} [persist=true] Optional. Indicates whether the resources should be persisted in IndexedDB.
   * @returns {Promise<void>} Resolves when the resources are replaced remotely.
   */
  onlineReplaceAllRelated(identity: RecordIdentity, relationship: string, related: RecordIdentity[],
    persist: boolean = true
  ): Promise<void> {
    return this._replaceAllRelated(identity, relationship, related, persist, true);
  }

  /**
   * Sets the resource in a many-to-one relationship pessimistically. It is recommended that the "relationship"
   * parameter is checked for type safety using the {@link nameof} function.
   *
   * @example <caption>Type safe usage</caption>
   * jsonApiService.onlineSetRelated({ type: SFProjectUser.TYPE, id }, nameof<SFProjectUser>('user'), null);
   * @param {RecordIdentity} identity The resource identity.
   * @param {string} relationship The relationship name.
   * @param {RecordIdentity} related The new related resource identity.
   * @param {boolean} [persist=true] Optional. Indicates whether the resource should be persisted in IndexedDB.
   * @returns {Promise<void>} Resolves when the resource is set remotely.
   */
  onlineSetRelated(identity: RecordIdentity, relationship: string, related: RecordIdentity | null,
    persist: boolean = true
  ): Promise<void> {
    return this._setRelated(identity, relationship, related, persist, true);
  }

  /**
   * Gets the resource with the specified identity from the local cache.
   *
   * @template T The resource type.
   * @param {RecordIdentity} identity The resource identity.
   * @returns {T} The resource.
   */
  localGet<T extends Resource>(identity: RecordIdentity): T {
    if (identity == null) {
      return null;
    }
    const record = this.store.cache.query(q => q.findRecord(identity));
    return this.convertResults(record) as T;
  }

  /**
   * Gets all of the resources with the specified identities from the local cache.
   *
   * @template T The resource type.
   * @param {RecordIdentity[]} identities The resource identities.
   * @returns {T[]} The resources.
   */
  localGetMany<T extends Resource>(identities: RecordIdentity[]): T[] {
    if (identities == null) {
      return [];
    }
    return identities.map(identity => this.localGet(identity));
  }

  private liveQuery(queryOrExpression: QueryOrExpression, include: string[], persist: boolean
  ): LiveQueryObservable<any> {
    const query = buildQuery(queryOrExpression, this.getOptions(persist, false, include), undefined,
      this.store.queryBuilder);

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

  private query(queryOrExpression: QueryOrExpression, include: string[], persist: boolean): Observable<any> {
    return from(this.store.query(queryOrExpression, this.getOptions(persist, true, include)))
      .pipe(map(r => this.convertResults(r)));
  }

  private getAllQuery(q: QueryBuilder, type: string, parameters: GetAllParameters): QueryTerm {
    let findRecords = q.findRecords(type);
    if (parameters != null) {
      if (parameters.filter != null) {
        findRecords = findRecords.filter(...parameters.filter.map(f => this.createFilterSpecifier(f)));
      }
      if (parameters.sort != null) {
        findRecords = findRecords.sort(...parameters.sort.map(s => this.createSortSpecifier(s)));
      }
      if (parameters.page != null) {
        const pageSpecifier: OffsetLimitPageSpecifier = {
          kind: 'offsetLimit',
          offset: parameters.page.offset,
          limit: parameters.page.limit
        };
        findRecords = findRecords.page(pageSpecifier);
      }
    }
    return findRecords;
  }

  private createFilterSpecifier(filter: Filter): FilterSpecifier {
    const attrSpecifier: AttributeFilterSpecifier = {
      kind: 'attribute',
      attribute: filter.name,
      value: filter.value,
      op: 'equal'
    };
    return attrSpecifier;
  }

  private createSortSpecifier(sort: Sort): SortSpecifier {
    const sortSpecifier: AttributeSortSpecifier = {
      kind: 'attribute',
      attribute: sort.name,
      order: sort.order
    };
    return sortSpecifier;
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

  private getOptions(persist: boolean, blocking: boolean, include?: string[]): any {
    const update = [JSONAPIService.REMOTE];
    if (persist) {
      update.push(JSONAPIService.BACKUP);
    }

    const options: any = { update, blocking };
    if (include != null) {
      options.sources = { remote: { include: [include.map(rel => dasherize(rel)).join('.')] } };
    }
    return options;
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
