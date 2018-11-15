import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import Coordinator, {
  ConnectionStrategy, LogTruncationStrategy, RequestStrategy, SyncStrategy
} from '@orbit/coordinator';
import { Exception } from '@orbit/core';
import {
  AddRecordOperation,
  AddToRelatedRecordsOperation,
  AttributeFilterSpecifier,
  AttributeSortSpecifier,
  buildQuery,
  ClientError,
  equalRecordIdentities,
  FilterSpecifier,
  FindRecord,
  FindRecords,
  FindRelatedRecord,
  FindRelatedRecords,
  NetworkError,
  Operation,
  Query,
  QueryBuilder,
  QueryOrExpression,
  QueryTerm,
  Record,
  RecordIdentity,
  RecordRelationship,
  RemoveFromRelatedRecordsOperation,
  RemoveRecordOperation,
  ReplaceAttributeOperation,
  ReplaceRecordOperation,
  ReplaceRelatedRecordOperation,
  ReplaceRelatedRecordsOperation,
  Schema,
  SchemaSettings,
  SortSpecifier,
  Transform,
  ValueComparisonOperator
} from '@orbit/data';
import IndexedDBSource from '@orbit/indexeddb';
import IndexedDBBucket from '@orbit/indexeddb-bucket';
import { PatchResultData } from '@orbit/store';
import { clone, dasherize, deepGet, Dict, eq, extend } from '@orbit/utils';
import { ObjectId } from 'bson';
import { BehaviorSubject, ConnectableObservable, from, Observable } from 'rxjs';
import { finalize, map, publishReplay } from 'rxjs/operators';

import { CustomFilterSpecifier, isCustomFilterRegistered } from './custom-filter-specifier';
import { IndexedPageSpecifier } from './indexed-page-specifier';
import { XForgeJSONAPISource } from './jsonapi/xforge-jsonapi-source';
import { LocationService } from './location.service';
import { DomainModel } from './models/domain-model';
import { Resource, ResourceRef } from './models/resource';
import { XForgeStore } from './store/xforge-store';

/**
 * This interface represents query results from the {@link JSONAPIService}.
 */
export interface QueryResults<T> {
  readonly results: T;
  readonly totalPagedCount?: number;

  /**
   * Gets the resource with the specified identity from the included resources.
   *
   * @param {RecordIdentity} identity The resource identity.
   * @returns {TInclude} The included resource.
   */
  getIncluded<TInclude extends Resource>(identity: RecordIdentity): TInclude;

  /**
   * Gets all of the resources with the specified identities from the included resources.
   *
   * @param {RecordIdentity[]} identities The resource identities.
   * @returns {TInclude[]} The included resources.
   */
  getManyIncluded<TInclude extends Resource>(identities: RecordIdentity[]): TInclude[];
}

export type QueryObservable<T> = Observable<QueryResults<T>>;

export interface Filter {
  op?: 'equal' | 'gt' | 'gte' | 'lt' | 'lte';
  name: string;
  value: any;
}

export interface Sort<T = any> {
  name: Extract<keyof T, string>;
  order: 'ascending' | 'descending';
}

export interface GetAllParameters<T = any> {
  filters?: Filter[];
  sort?: Sort<T>[];
  pagination?: {
    index: number;
    size: number;
  };
}

class CacheQueryResults<T> implements QueryResults<T> {
  constructor(private readonly jsonApiService: JSONAPIService, public readonly results: T,
    public readonly totalPagedCount?: number
  ) { }

  getIncluded<TInclude extends Resource>(identity: RecordIdentity): TInclude {
    return this.jsonApiService.localGet(identity);
  }

  getManyIncluded<TInclude extends Resource>(identities: RecordIdentity[]): TInclude[] {
    return this.jsonApiService.localGetMany(identities);
  }
}

class MapQueryResults<T> implements QueryResults<T> {
  private readonly map: Dict<Map<string, Resource>> = { };

  constructor(public readonly results: T, public readonly totalPagedCount?: number, included?: Resource[]
  ) {
    if (included != null) {
      for (const resource of included) {
        let typeMap = this.map[resource.type];
        if (typeMap == null) {
          typeMap = new Map<string, Resource>();
          this.map[resource.type] = typeMap;
        }
        typeMap.set(resource.id, resource);
      }
    }
  }

  getIncluded<TInclude extends Resource>(identity: RecordIdentity): TInclude {
    if (identity == null) {
      return null;
    }
    const typeMap = this.map[identity.type];
    if (typeMap != null) {
      return typeMap.get(identity.id) as TInclude;
    }
    return null;
  }

  getManyIncluded<TInclude extends Resource>(identities: RecordIdentity[]): TInclude[] {
    if (identities == null) {
      return [];
    }

    return identities.map(i => this.getIncluded(i));
  }
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
 * Pessimistic operations are used for online-only views. Pessimistic queries return an observable that returns the
 * results from the JSON-API server. Resources returned from pessimistic operations are not cached or persisted.
 * Pessimistic methods are prefixed with "online".
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

  private onlineStore: XForgeJSONAPISource;

  private bucket: IndexedDBBucket;
  private store: XForgeStore;
  private remote: XForgeJSONAPISource;
  private backup: IndexedDBSource;
  private coordinator: Coordinator;

  constructor(private readonly http: HttpClient, private readonly domainModel: DomainModel,
    private readonly locationService: LocationService
  ) { }

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

    this.onlineStore = new XForgeJSONAPISource({
      schema: this.schema,
      name: JSONAPIService.REMOTE,
      host: this.locationService.origin,
      namespace: 'json-api'
    });

    this.bucket = new IndexedDBBucket({
      namespace: 'xforge-state'
    });

    this.store = new XForgeStore({
      schema: this.schema,
      bucket: this.bucket
    });

    this.remote = new XForgeJSONAPISource({
      schema: this.schema,
      bucket: this.bucket,
      name: JSONAPIService.REMOTE,
      host: this.locationService.origin,
      namespace: 'json-api'
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
        // Purge a deleted resource from the cache when get() is called on it
        new RequestStrategy({
          source: JSONAPIService.REMOTE,
          on: 'pullFail',

          action: (q: Query, e: Exception) => {
            this.purgeDeletedResource(q, e);
            this.remote.requestQueue.skip();
          },

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

          blocking: false,

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
          filter: (t: Transform) => !t.options.localOnly,
          action: 'push',

          blocking: false
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
    const headerValue = 'Bearer ' + accessToken;
    this.onlineStore.defaultFetchSettings.headers['Authorization'] = headerValue;
    this.remote.defaultFetchSettings.headers['Authorization'] = headerValue;
  }

  /**
   * Gets the resource with the specified identity optimistically.
   *
   * @template T The resource type.
   * @param {RecordIdentity} identity The resource identity.
   * @param {string[]} [include] Optional. A path of relationship names that specifies the related resources to include
   * in the results from the server.
   * @returns {QueryObservable<T>} The live query observable.
   */
  get<T extends Resource>(identity: RecordIdentity, include?: string[]): QueryObservable<T> {
    const queryExpression: QueryOrExpression = q => q.findRecord(identity);
    return this.liveQuery(queryExpression, queryExpression, include);
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
   * in the results from the server.
   * @returns {QueryObservable<T>} The live query observable.
   */
  getRelated<T extends Resource>(identity: RecordIdentity, relationship: string, include?: string[]
  ): QueryObservable<T> {
    const queryExpression: QueryOrExpression = q => q.findRelatedRecord(identity, relationship);
    return this.liveQuery(queryExpression, queryExpression, include);
  }

  /**
   * Gets all resources of the specified type optimistically. It is recommeneded that callers use the generic version
   * of {@link GetAllParameters} to ensure type safety.
   *
   * @template T The resource type.
   * @param {string} type The resource type.
   * @param {GetAllParameters} parameters Optional. Filtering, sorting, and paging parameters.
   * @param {string[]} [include] Optional. A path of relationship names that specifies the related resources to include
   * in the results from the server.
   * @returns {QueryObservable<T[]>} The live query observable.
   */
  getAll<T extends Resource>(type: string, parameters?: GetAllParameters, include?: string[]): QueryObservable<T[]> {
    return this.liveQuery(q => this.getAllQuery(q, type, parameters), q => this.getAllQuery(q, type, parameters, false),
      include);
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
   * in the results from the server.
   * @returns {QueryObservable<T[]>} The live query observable.
   */
  getAllRelated<T extends Resource>(identity: RecordIdentity, relationship: string, include?: string[]
  ): QueryObservable<T[]> {
    const queryExpression: QueryOrExpression = q => q.findRelatedRecords(identity, relationship);
    return this.liveQuery(queryExpression, queryExpression, include);
  }

  /**
   * Creates a new resource optimistically.
   *
   * @param {Resource} resource The new resource.
   * @returns {Promise<T>} Resolves when the resource is created locally. Returns the new resource.
   */
  async create<T extends Resource>(resource: T): Promise<T> {
    const record = this.createRecord(resource);
    this.schema.initializeRecord(record);
    resource.id = record.id;
    await this.store.update(t => t.addRecord(record));
    return resource;
  }

  /**
   * Completely replaces an existing resource optimistically.
   *
   * @param {Resource} resource The new resource.
   * @returns {Promise<T>} Resolves when the resource is replaced locally. Returns the new resource.
   */
  async replace<T extends Resource>(resource: T): Promise<T> {
    const record = this.createRecord(resource);
    await this.store.update(t => t.replaceRecord(record));
    return resource;
  }

  /**
   * Updates an existing resource optimistically. This method only updates the attributes and relationships that have
   * changed.
   *
   * @param {Resource} resource The resource to update.
   * @returns {Promise<T>} Resolves when the resource is updated locally. Returns the updated resource.
   */
  async update<T extends Resource>(resource: T): Promise<T> {
    const updatedRecord = this.createRecord(resource);
    const record = this.store.cache.query(q => q.findRecord(resource)) as Record;
    await this.store.update(t => {
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
    });
    return resource;
  }

  /**
   * Updates the attributes of an existing resource optimistically.
   *
   * @param {RecordIdentity} identity The resource identity.
   * @param {Dict<any>} attrs The attribute values to update.
   * @returns {Promise<T>} Resolves when the resource is updated locally. Returns the updated resource.
   */
  async updateAttributes<T extends Resource>(identity: RecordIdentity, attrs: Partial<T>): Promise<T> {
    await this.store.update(t => {
      const ops: Operation[] = [];
      for (const [name, value] of Object.entries(attrs)) {
        ops.push(t.replaceAttribute(identity, name, value));
      }
      return ops;
    });
    return this.localGet(identity);
  }

  /**
   * Deletes a resource optimistically.
   *
   * @param {RecordIdentity} identity The resource identity.
   * @returns {Promise<void>} Resolves when the resource is deleted locally.
   */
  delete(identity: RecordIdentity): Promise<void> {
    return this.store.update(t => t.removeRecord(identity));
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
   * @returns {Promise<void>} Resolves when the resources are replaced locally.
   */
  replaceAllRelated(identity: RecordIdentity, relationship: string, related: RecordIdentity[]): Promise<void> {
    return this.store.update(t => t.replaceRelatedRecords(identity, relationship, related));
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
   * @returns {Promise<void>} Resolves when the resource is set locally.
   */
  setRelated(identity: RecordIdentity, relationship: string, related: RecordIdentity | null): Promise<void> {
    return this.store.update(t => t.replaceRelatedRecord(identity, relationship, related));
  }

  /**
   * Gets the resource with the specified identity pessimistically.
   *
   * @template T The resource type.
   * @param {RecordIdentity} identity The resource identity.
   * @param {string[]} [include] Optional. A path of relationship names that specifies the related resources to include
   * in the results from the server.
   * @returns {QueryObservable<T>} The query observable.
   */
  onlineGet<T extends Resource>(identity: RecordIdentity, include?: string[]): QueryObservable<T> {
    return this.onlineQuery(q => q.findRecord(identity), include);
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
   * in the results from the server.
   * @returns {QueryObservable<T>} The query observable.
   */
  onlineGetRelated<T extends Resource>(identity: RecordIdentity, relationship: string, include?: string[]
  ): QueryObservable<T> {
    return this.onlineQuery(q => q.findRelatedRecord(identity, relationship), include);
  }

  /**
   * Gets all resources of the specified type pessimistically. It is recommeneded that callers use the generic version
   * of {@link GetAllParameters} to ensure type safety.
   *
   * @template T The resource type.
   * @param {string} type The resource type.
   * @param {GetAllParameters} parameters Optional. Filtering, sorting, and paging parameters.
   * @param {string[]} [include] Optional. A path of relationship names that specifies the related resources to include
   * in the results from the server.
   * @returns {QueryObservable<T[]>} The query observable.
   */
  onlineGetAll<T extends Resource>(type: string, parameters?: GetAllParameters, include?: string[]
  ): QueryObservable<T[]> {
    return this.onlineQuery(q => this.getAllQuery(q, type, parameters), include);
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
   * in the results from the server.
   * @returns {QueryObservable<T[]>} The query observable.
   */
  onlineGetAllRelated<T extends Resource>(identity: RecordIdentity, relationship: string, include?: string[],
  ): QueryObservable<T[]> {
    return this.onlineQuery(q => q.findRelatedRecords(identity, relationship), include);
  }

  /**
   * Creates a new resource pessimistically.
   *
   * @param {Resource} resource The new resource.
   * @returns {Promise<T>} Resolves when the resource is created remotely. Returns the new resource's ID.
   */
  async onlineCreate<T extends Resource>(resource: T): Promise<T> {
    let record = this.createRecord(resource);
    this.schema.initializeRecord(record);
    record = await this.onlineStore.update(t => t.addRecord(record));
    return this.createResource(record) as T;
  }

  /**
   * Completely replaces an existing resource pessimistically.
   *
   * @param {Resource} resource The new resource.
   * @returns {Promise<T>} Resolves when the resource is replaced remotely.
   */
  async onlineReplace<T extends Resource>(resource: T): Promise<T> {
    let record = this.createRecord(resource);
    record = await this.onlineStore.update(t => t.replaceRecord(record));
    return this.createResource(record) as T;
  }

  /**
   * Updates the attributes of an existing resource pessimistically.
   *
   * @param {RecordIdentity} identity The resource identity.
   * @param {Dict<any>} attrs The attribute values to update.
   * @returns {Promise<T>} Resolves when the resource is updated remotely.
   */
  async onlineUpdateAttributes<T extends Resource>(identity: RecordIdentity, attrs: Partial<T>): Promise<T> {
    const record = await this.onlineStore.update(t => {
      const ops: Operation[] = [];
      for (const [name, value] of Object.entries(attrs)) {
        ops.push(t.replaceAttribute(identity, name, value));
      }
      return ops;
    });
    return this.createResource(record) as T;
  }

  /**
   * Deletes a resource pessimistically.
   *
   * @param {RecordIdentity} identity The resource identity.
   * @returns {Promise<void>} Resolves when the resource is deleted remotely.
   */
  onlineDelete(identity: RecordIdentity): Promise<void> {
    return this.onlineStore.update(t => t.removeRecord(identity));
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
   * @returns {Promise<void>} Resolves when the resources are replaced remotely.
   */
  onlineReplaceAllRelated(identity: RecordIdentity, relationship: string, related: RecordIdentity[]): Promise<void> {
    return this.onlineStore.update(t => t.replaceRelatedRecords(identity, relationship, related));
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
   * @returns {Promise<void>} Resolves when the resource is set remotely.
   */
  onlineSetRelated(identity: RecordIdentity, relationship: string, related: RecordIdentity | null): Promise<void> {
    return this.onlineStore.update(t => t.replaceRelatedRecord(identity, relationship, related));
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

  private liveQuery(localQueryExpression: QueryOrExpression, remoteQueryExpression: QueryOrExpression, include: string[]
  ): QueryObservable<any> {
    const localQuery = buildQuery(localQueryExpression, { }, undefined, this.store.queryBuilder);
    const remoteQuery = buildQuery(remoteQueryExpression, this.getOptions(include), undefined, this.store.queryBuilder);

    // initialize subject with current cached results
    const changes$ = new BehaviorSubject<QueryResults<any>>(this.getQueryResults(localQuery));

    // listen for any changes resulting from the remote query
    const handler = (transform: Transform, results: PatchResultData[]) => {
      if (this.isChangeApplicable(remoteQuery, transform, results)) {
        changes$.next(this.getQueryResults(localQuery));
      }
    };
    this.store.on('transform_completed', handler);

    // start remote query right away
    this.store.query(remoteQuery).catch(err => {
      if (!(err instanceof ClientError)) {
        console.error(err);
      }
    });

    // remove listener after all subscribers have unsubscribed
    const finalize$ = changes$.pipe(
      finalize(() => this.store.off('transform_completed', handler)),
      publishReplay(1)
    ) as ConnectableObservable<QueryResults<any>>;
    return finalize$.refCount();
  }

  private onlineQuery(queryExpression: QueryOrExpression, include: string[]): QueryObservable<any> {
    const query = buildQuery(queryExpression, this.getOptions(include), undefined, this.store.queryBuilder);

    return from(this.onlineStore.query(query))
      .pipe(map(r => this.getOnlineQueryResults(query, r)));
  }

  private getQueryResults(localQuery: Query): QueryResults<any> {
    const results = this.convertResults(this.store.cache.query(localQuery));
    return new CacheQueryResults(this, results, localQuery.options.totalPagedCount);
  }

  private getOnlineQueryResults(query: Query, results: Resource | Resource[]): QueryResults<any> {
    const resourceResults = this.convertResults(results);
    let includedResources: Resource[];
    if (query.options.included != null) {
      includedResources = this.convertResults(query.options.included) as Resource[];
    }
    return new MapQueryResults(resourceResults, query.options.totalPagedCount, includedResources);
  }

  private getAllQuery(q: QueryBuilder, type: string, parameters: GetAllParameters, page: boolean = true): QueryTerm {
    let findRecords = q.findRecords(type);
    if (parameters != null) {
      if (parameters.filters != null) {
        findRecords = findRecords.filter(...parameters.filters.map(f => this.createFilterSpecifier(type, f)));
      }
      if (parameters.sort != null) {
        findRecords = findRecords.sort(...parameters.sort.map(s => this.createSortSpecifier(s)));
      }
      if (page && parameters.pagination != null) {
        const pageSpecifier: IndexedPageSpecifier = {
          kind: 'indexed',
          index: parameters.pagination.index,
          size: parameters.pagination.size
        };
        findRecords = findRecords.page(pageSpecifier);
      }
    }
    return findRecords;
  }

  private createFilterSpecifier(type: string, filterDef: Filter): FilterSpecifier {
    if (this.schema.hasAttribute(type, filterDef.name)) {
      let op: ValueComparisonOperator = 'equal';
      if (filterDef.op != null) {
        op = filterDef.op;
      }
      const attributeFilter: AttributeFilterSpecifier = {
        kind: 'attribute',
        op,
        attribute: filterDef.name,
        value: filterDef.value
      };
      return attributeFilter;
    }

    if (isCustomFilterRegistered(type, filterDef.name)) {
      const customFilter: CustomFilterSpecifier = {
        kind: 'custom',
        op: undefined,
        name: filterDef.name,
        value: filterDef.value
      };
      return customFilter;
    }

    throw new Error('Unrecognized filter name.');
  }

  private createSortSpecifier(sort: Sort): SortSpecifier {
    const sortSpecifier: AttributeSortSpecifier = {
      kind: 'attribute',
      attribute: sort.name,
      order: sort.order
    };
    return sortSpecifier;
  }

  private getOptions(include?: string[]): any {
    const options: any = { };
    if (include != null && include.length > 0) {
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

  private isChangeApplicable(query: Query, transform: Transform, results: PatchResultData[]): boolean {
    let queryRecord: RecordIdentity = null;
    let queryType: string = null;
    let queryRelationship: string = null;
    let queryRelated: RecordIdentity[] = null;
    switch (query.expression.op) {
      case 'findRecord':
        const findRecord = query.expression as FindRecord;
        queryRecord = findRecord.record;
        break;
      case 'findRecords':
        const findRecords = query.expression as FindRecords;
        queryType = findRecords.type;
        break;
      case 'findRelatedRecord':
      case 'findRelatedRecords':
        const findRelated = query.expression as FindRelatedRecord | FindRelatedRecords;
        queryRecord = findRelated.record;
        queryRelationship = findRelated.relationship;
        const record = this.store.cache.records(queryRecord.type).get(queryRecord.id);
        const related = deepGet(record,
          ['relationships', queryRelationship, 'data']) as RecordIdentity | RecordIdentity[];
        if (related != null) {
          if (related instanceof Array) {
            queryRelated = related;
          } else {
            queryRelated = [related];
          }
        }
        break;
    }

    for (let i = 0; i < transform.operations.length; i++) {
      // skip operations that didn't result in an actual change
      if (results[i] == null) {
        continue;
      }
      const operation = transform.operations[i];
      let transformRecord: RecordIdentity;
      let transformRelationship: string = '';
      switch (operation.op) {
        case 'addRecord':
          const addRecord = operation as AddRecordOperation;
          transformRecord = addRecord.record;
          break;
        case 'replaceRecord':
        case 'removeRecord':
          const replaceRemoveRecord = operation as ReplaceRecordOperation | RemoveRecordOperation;
          transformRecord = replaceRemoveRecord.record;
          break;
        case 'replaceAttribute':
          const replaceAttribute = operation as ReplaceAttributeOperation;
          transformRecord = replaceAttribute.record;
          break;
        case 'addToRelatedRecords':
        case 'removeFromRelatedRecords':
        case 'replaceRelatedRecords':
        case 'replaceRelatedRecord':
          const updateRelated = operation as AddToRelatedRecordsOperation | RemoveFromRelatedRecordsOperation
            | ReplaceRelatedRecordsOperation | ReplaceRelatedRecordOperation;
          transformRecord = updateRelated.record;
          transformRelationship = updateRelated.relationship;
          break;
      }

      // check if the transformed record matches record being queried
      // if performing a related record query, ensure that the transformed relationship matches the queried relationship
      if (equalRecordIdentities(queryRecord, transformRecord)
        && (queryRelationship == null || queryRelationship === transformRelationship)
      ) {
        return true;
      }

      // check if the type of the transformed record matches the type being queried
      if (queryType === transformRecord.type) {
        return true;
      }

      // check if the transformed record is one of the related records being queried
      if (queryRelated != null && queryRelated.some(r => equalRecordIdentities(r, transformRecord))) {
        return true;
      }
    }

    return false;
  }

  private convertResults(results: Record | Record[]): Resource | Resource[] {
    if (results instanceof Array) {
      return results.map(r => this.createResource(r));
    }
    return this.createResource(results);
  }

  private createResource(record: Record): Resource {
    const ResourceType = this.domainModel.getResourceType(record.type);
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
    const ResourceRefType = this.domainModel.getResourceRefType(identity.type);
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
    if (ex instanceof NetworkError) {
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
    }, { localOnly: true });
  }
}
