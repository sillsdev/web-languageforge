import { Injectable, NgZone } from '@angular/core';
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
  Operation,
  Query,
  QueryBuilder,
  QueryOrExpression,
  QueryTerm,
  Record,
  RecordIdentity,
  RecordOperation,
  RecordRelationship,
  RelatedRecordFilterSpecifier,
  RelationshipDefinition,
  RemoveFromRelatedRecordsOperation,
  RemoveRecordOperation,
  ReplaceAttributeOperation,
  ReplaceRecordOperation,
  ReplaceRelatedRecordOperation,
  ReplaceRelatedRecordsOperation,
  Schema,
  SortSpecifier,
  Transform,
  TransformOrOperations,
  ValueComparisonOperator
} from '@orbit/data';
import { PatchResultData } from '@orbit/store';
import { clone, dasherize, deepGet, Dict, eq, extend } from '@orbit/utils';
import { BehaviorSubject, ConnectableObservable, from, fromEvent, Observable } from 'rxjs';
import { filter, finalize, map, publishReplay } from 'rxjs/operators';
import { CustomFilterSpecifier, isCustomFilterRegistered } from './custom-filter-specifier';
import { IndexedPageSpecifier } from './indexed-page-specifier';
import { JsonRpcService } from './json-rpc.service';
import { DomainModel } from './models/domain-model';
import { Resource, ResourceRef } from './models/resource';
import { OrbitService } from './orbit-service';
import { RequestType } from './request-type';
import { XForgeStore } from './store/xforge-store';

/**
 * This interface represents query results from the {@link JSONAPIService}.
 */
export interface QueryResults<T> {
  readonly data: T;
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
  constructor(
    private readonly jsonApiService: JsonApiService,
    public readonly data: T,
    public readonly totalPagedCount?: number
  ) {}

  getIncluded<TInclude extends Resource>(identity: RecordIdentity): TInclude {
    return this.jsonApiService.localGet(identity);
  }

  getManyIncluded<TInclude extends Resource>(identities: RecordIdentity[]): TInclude[] {
    return this.jsonApiService.localGetMany(identities);
  }
}

export class MapQueryResults<T> implements QueryResults<T> {
  private readonly map: Dict<Map<string, Resource>> = {};

  constructor(public readonly data: T, public readonly totalPagedCount?: number, included?: Resource[]) {
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
 * Optimistic operations are used for offline-only views. Optimistic queries return a live observable that will return
 * the current results from the cache immediately, and then listen for any updated results that are returned from the
 * JSON-API server or performed locally.
 *
 * Pessimistic operations are used for online-only views. Pessimistic queries return an observable that returns the
 * results from the JSON-API server. Resources returned from pessimistic operations are not persisted unless
 * specifically told to do so. Pessimistic methods are prefixed with "online".
 */
@Injectable({
  providedIn: 'root'
})
export class JsonApiService {
  constructor(
    private readonly orbitService: OrbitService,
    private readonly domainModel: DomainModel,
    private readonly jsonRpcService: JsonRpcService,
    private readonly ngZone: NgZone
  ) {}

  private get schema(): Schema {
    return this.orbitService.schema;
  }

  private get store(): XForgeStore {
    return this.orbitService.store;
  }

  /**
   * Gets the resource with the specified identity optimistically.
   *
   * @template T The resource type.
   * @param {RecordIdentity} identity The resource identity.
   * @param {string[][]} [include] Optional. A path of relationship names that specifies the related resources to
   * include in the results from the server.
   * @returns {QueryObservable<T>} The live query observable.
   */
  get<T extends Resource>(identity: RecordIdentity, include?: string[][]): QueryObservable<T> {
    const queryExpression: QueryOrExpression = q => q.findRecord(identity);
    return this.query(queryExpression, queryExpression, include);
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
   * @param {string[][]} [include] Optional. A path of relationship names that specifies the related resources to
   * include in the results from the server.
   * @returns {QueryObservable<T>} The live query observable.
   */
  getRelated<T extends Resource>(
    identity: RecordIdentity,
    relationship: string,
    include?: string[][]
  ): QueryObservable<T> {
    const queryExpression: QueryOrExpression = q => q.findRelatedRecord(identity, relationship);
    return this.query(queryExpression, queryExpression, include);
  }

  /**
   * Gets all resources of the specified type optimistically. It is recommeneded that callers use the generic version
   * of {@link GetAllParameters} to ensure type safety.
   *
   * @template T The resource type.
   * @param {string} type The resource type.
   * @param {GetAllParameters<T>} parameters Optional. Filtering, sorting, and paging parameters.
   * @param {string[][]} [include] Optional. A path of relationship names that specifies the related resources to
   * include in the results from the server.
   * @returns {QueryObservable<T[]>} The live query observable.
   */
  getAll<T extends Resource>(
    type: string,
    parameters?: GetAllParameters<T>,
    include?: string[][]
  ): QueryObservable<T[]> {
    return this.query(
      q => this.getAllQuery(q, type, parameters),
      q => this.getAllQuery(q, type, parameters, false),
      include
    );
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
   * @param {string[][]} [include] Optional. A path of relationship names that specifies the related resources to
   * include in the results from the server.
   * @returns {QueryObservable<T[]>} The live query observable.
   */
  getAllRelated<T extends Resource>(
    identity: RecordIdentity,
    relationship: string,
    include?: string[][]
  ): QueryObservable<T[]> {
    const queryExpression: QueryOrExpression = q => q.findRelatedRecords(identity, relationship);
    return this.query(queryExpression, queryExpression, include);
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
    await this.storeUpdate(t => t.addRecord(record), this.getOptions(RequestType.OfflineFirst));
    return resource;
  }

  /**
   * Updates an existing resource optimistically. This method only updates the attributes and relationships that have
   * changed.
   *
   * @param {Resource} resource The resource to update.
   */
  update<T extends Resource>(resource: T): Promise<void> {
    const updatedRecord = this.createRecord(resource);
    const cachedRecord = this.store.cache.query(q => q.findRecord(updatedRecord)) as Record;
    return this.storeUpdate(t => {
      const ops: Operation[] = [];

      const updatedAttrs = this.getUpdatedProps(cachedRecord.attributes, updatedRecord.attributes);
      for (const attrName of updatedAttrs) {
        ops.push(t.replaceAttribute(cachedRecord, attrName, updatedRecord.attributes[attrName]));
      }

      const updatedRels = this.getUpdatedProps(cachedRecord.relationships, updatedRecord.relationships);
      for (const relName of updatedRels) {
        const relData = updatedRecord.relationships[relName].data;
        if (relData instanceof Array) {
          ops.push(t.replaceRelatedRecords(cachedRecord, relName, relData));
        } else {
          ops.push(t.replaceRelatedRecord(cachedRecord, relName, relData));
        }
      }
      return ops;
    }, this.getOptions(RequestType.OfflineFirst));
  }

  /**
   * Updates the attributes of an existing resource optimistically.
   *
   * @param {RecordIdentity} identity The resource identity.
   * @param {Dict<any>} attrs The attribute values to update.
   * @returns {Promise<T>} Resolves when the resource is updated locally. Returns the updated resource.
   */
  updateAttributes<T extends Resource>(identity: RecordIdentity, attrs: Partial<T>): Promise<T> {
    return this._updateAttributes(identity, attrs, RequestType.OfflineFirst);
  }

  /**
   * Deletes a resource optimistically.
   *
   * @param {RecordIdentity} identity The resource identity.
   * @returns {Promise<void>} Resolves when the resource is deleted locally.
   */
  delete(identity: RecordIdentity): Promise<void> {
    return this.storeUpdate(t => t.removeRecord(identity), this.getOptions(RequestType.OfflineFirst));
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
    return this.storeUpdate(
      t => t.replaceRelatedRecords(identity, relationship, related),
      this.getOptions(RequestType.OfflineFirst)
    );
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
    return this.storeUpdate(
      t => t.replaceRelatedRecord(identity, relationship, related),
      this.getOptions(RequestType.OfflineFirst)
    );
  }

  /**
   * Gets the resource with the specified identity pessimistically.
   *
   * @template T The resource type.
   * @param {RecordIdentity} identity The resource identity.
   * @param {string[][]} [include] Optional. A path of relationship names that specifies the related resources to
   * include in the results from the server.
   * @param {boolean} [persist=false] Optional. If true, persists the retrieved resource locally.
   * @returns {QueryObservable<T>} The query observable.
   */
  onlineGet<T extends Resource>(
    identity: RecordIdentity,
    include?: string[][],
    persist: boolean = false
  ): QueryObservable<T> {
    return this.onlineQuery(q => q.findRecord(identity), include, persist);
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
   * @param {string[][]} [include] Optional. A path of relationship names that specifies the related resources to
   * include in the results from the server.
   * @param {boolean} [persist=false] Optional. If true, persists the retrieved resource locally.
   * @returns {QueryObservable<T>} The query observable.
   */
  onlineGetRelated<T extends Resource>(
    identity: RecordIdentity,
    relationship: string,
    include?: string[][],
    persist: boolean = false
  ): QueryObservable<T> {
    return this.onlineQuery(q => q.findRelatedRecord(identity, relationship), include, persist);
  }

  /**
   * Gets all resources of the specified type pessimistically. It is recommeneded that callers use the generic version
   * of {@link GetAllParameters} to ensure type safety.
   *
   * @template T The resource type.
   * @param {string} type The resource type.
   * @param {GetAllParameters<T>} parameters Optional. Filtering, sorting, and paging parameters.
   * @param {string[][]} [include] Optional. A path of relationship names that specifies the related resources to
   * include in the results from the server.
   * @param {boolean} [persist=false] Optional. If true, persists the retrieved resources locally.
   * @returns {QueryObservable<T[]>} The query observable.
   */
  onlineGetAll<T extends Resource>(
    type: string,
    parameters?: GetAllParameters<T>,
    include?: string[][],
    persist: boolean = false
  ): QueryObservable<T[]> {
    return this.onlineQuery(q => this.getAllQuery(q, type, parameters), include, persist);
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
   * @param {string[][]} [include] Optional. A path of relationship names that specifies the related resources to
   * include in the results from the server.
   * @param {boolean} [persist=false] Optional. If true, persists the retrieved resources locally.
   * @returns {QueryObservable<T[]>} The query observable.
   */
  onlineGetAllRelated<T extends Resource>(
    identity: RecordIdentity,
    relationship: string,
    include?: string[][],
    persist: boolean = false
  ): QueryObservable<T[]> {
    return this.onlineQuery(q => q.findRelatedRecords(identity, relationship), include, persist);
  }

  /**
   * Creates a new resource pessimistically.
   *
   * @param {Resource} resource The new resource.
   * @param {boolean} [persist=false] Optional. If true, persists the new resource locally.
   * @returns {Promise<T>} Resolves when the resource is created remotely. Returns the new resource's ID.
   */
  async onlineCreate<T extends Resource>(resource: T, persist: boolean = false): Promise<T> {
    const record = this.createRecord(resource);
    this.schema.initializeRecord(record);
    await this.storeUpdate(t => t.addRecord(record), this.getOnlineUpdateOptions(persist));
    return this.localGet<T>(record);
  }

  /**
   * Updates the attributes of an existing resource pessimistically.
   *
   * @param {RecordIdentity} identity The resource identity.
   * @param {Partial<T>} attrs The attribute values to update.
   * @param {boolean} [persist=false] Optional. If true, persists the updated attributes locally.
   * @returns {Promise<T>} Resolves when the resource is updated remotely.
   */
  onlineUpdateAttributes<T extends Resource>(
    identity: RecordIdentity,
    attrs: Partial<T>,
    persist: boolean = false
  ): Promise<T> {
    return this._updateAttributes(identity, attrs, persist ? RequestType.OnlinePersist : RequestType.OnlineOnly);
  }

  /**
   * Deletes a resource pessimistically. The resource is deleted locally as well.
   *
   * @param {RecordIdentity} identity The resource identity.
   * @returns {Promise<void>} Resolves when the resource is deleted remotely.
   */
  onlineDelete(identity: RecordIdentity): Promise<void> {
    return this.storeUpdate(t => t.removeRecord(identity), this.getOnlineUpdateOptions(true));
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
   * @param {boolean} [persist=false] Optional. If true, persists the updated relationship locally.
   * @returns {Promise<void>} Resolves when the resources are replaced remotely.
   */
  async onlineReplaceAllRelated(
    identity: RecordIdentity,
    relationship: string,
    related: RecordIdentity[],
    persist: boolean = false
  ): Promise<void> {
    return this.storeUpdate(
      t => t.replaceRelatedRecords(identity, relationship, related),
      this.getOnlineUpdateOptions(persist)
    );
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
   * @param {boolean} [persist=false] Optional. If true, persists the updated relationship locally.
   * @returns {Promise<void>} Resolves when the resource is set remotely.
   */
  async onlineSetRelated(
    identity: RecordIdentity,
    relationship: string,
    related: RecordIdentity | null,
    persist: boolean = false
  ): Promise<void> {
    return this.storeUpdate(
      t => t.replaceRelatedRecord(identity, relationship, related),
      this.getOnlineUpdateOptions(persist)
    );
  }

  /**
   * Dynamically creates a resource object. This is useful when you have to create a resource object, but you don't
   * have access to the concrete type.
   *
   * @param {string} type The resource type.
   * @param {Partial<T>} [init] Initial property values.
   * @returns {T} The resource.
   */
  newResource<T extends Resource>(type: string, init?: Partial<T>): T {
    const ResourceType = this.domainModel.getResourceType(type);
    return new ResourceType(init) as T;
  }

  /**
   * Dynamically creates a resource ref object. This is useful when you have to create a resource ref object, but you
   * don't have access to the concrete type.
   *
   * @param {RecordIdentity} identity The resource identity.
   * @returns {T} The resource ref object.
   */
  newResourceRef<T extends ResourceRef>(identity: RecordIdentity): T {
    const ResourceRefType = this.domainModel.getResourceRefType(identity.type);
    return new ResourceRefType(identity.id) as T;
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

  /**
   * Updates the attributes of an existing resource in the local cache.
   *
   * @param {RecordIdentity} identity The resource identity.
   * @param {Dict<any>} attrs The attribute values to update.
   * @returns {Promise<T>} Returns the updated resource.
   */
  localUpdateAttributes<T extends Resource>(identity: RecordIdentity, attrs: Partial<T>): Promise<T> {
    return this._updateAttributes(identity, attrs, RequestType.LocalOnly);
  }

  /**
   * Deletes a resource in the local cache.
   *
   * @param {RecordIdentity} identity The resource identity.
   * @returns {Promise<void>} Resolves when the resource is deleted locally.
   */
  localDelete(identity: RecordIdentity): Promise<void> {
    return this.storeUpdate(t => t.removeRecord(identity), this.getOptions(RequestType.LocalOnly));
  }

  /**
   * Invokes a command on the specified type or resource.
   *
   * @param {(RecordIdentity | string)} identityOrType The type or resource to perform command on.
   * @param {string} method The command name.
   * @param {*} params The command parameters.
   * @returns {Promise<T>} The command result.
   */
  onlineInvoke<T>(identityOrType: RecordIdentity | string, method: string, params: any): Promise<T> {
    let type: string;
    let id: string;
    if (typeof identityOrType === 'string') {
      type = identityOrType;
    } else {
      type = identityOrType.type;
      id = identityOrType.id;
    }
    const resourceUrl = this.orbitService.resourceUrl(type, id);
    return this.jsonRpcService.invoke<T>(`${resourceUrl}/commands`, method, params);
  }

  /**
   * Creates an observable that emits the ID of a resource when it is deleted.
   *
   * @param {string} type The resource type.
   * @returns {Observable<string>} The ID of the deleted resource.
   */
  resourceDeleted<T extends Resource>(type: string): Observable<T> {
    return fromEvent<[RecordOperation, PatchResultData]>(this.store.cache, 'patch').pipe(
      filter(
        ([operation]) => operation.op === 'removeRecord' && (operation as RemoveRecordOperation).record.type === type
      ),
      map(([, resultData]) => this.createResource(resultData) as T)
    );
  }

  private query(
    localQueryExpression: QueryOrExpression,
    remoteQueryExpression: QueryOrExpression,
    include: string[][]
  ): QueryObservable<any> {
    const localQuery = buildQuery(localQueryExpression, {}, undefined, this.store.queryBuilder);
    const remoteQuery = buildQuery(
      remoteQueryExpression,
      this.getRemoteQueryOptions(RequestType.OfflineFirst, include),
      undefined,
      this.store.queryBuilder
    );

    // initialize subject with current cached results
    const changes$ = new BehaviorSubject<QueryResults<any>>(this.getQueryResults(localQuery));

    // listen for any changes resulting from the remote query
    const handler = (transform: Transform, results: PatchResultData[]) => {
      this.ngZone.run(() => {
        if (this.isChangeApplicable(remoteQuery, transform, results, include)) {
          changes$.next(this.getQueryResults(localQuery));
        }
      });
    };
    this.store.on('transform_completed', handler);

    // start remote query right away
    this.storeQuery(remoteQuery).catch(err => console.error(err));

    // remove listener after all subscribers have unsubscribed
    const finalize$ = changes$.pipe(
      finalize(() => this.store.off('transform_completed', handler)),
      publishReplay(1)
    ) as ConnectableObservable<QueryResults<any>>;
    return finalize$.refCount();
  }

  private getQueryResults(localQuery: Query): QueryResults<any> {
    const results = this.convertResults(this.store.cache.query(localQuery));
    return new CacheQueryResults(this, results, localQuery.options.totalPagedCount);
  }

  private onlineQuery(queryExpression: QueryOrExpression, include: string[][], persist: boolean): QueryObservable<any> {
    const query = buildQuery(
      queryExpression,
      this.getRemoteQueryOptions(persist ? RequestType.OnlinePersist : RequestType.OnlineOnly, include),
      undefined,
      this.store.queryBuilder
    );

    return from(this.storeQuery(query)).pipe(
      map(r => new CacheQueryResults(this, this.convertResults(r), query.options.totalPagedCount))
    );
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
    } else if (this.schema.hasRelationship(type, filterDef.name)) {
      const relFilter: RelatedRecordFilterSpecifier = {
        kind: 'relatedRecord',
        op: 'equal',
        relation: filterDef.name,
        record: filterDef.value
      };
      return relFilter;
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

  private async storeQuery(queryOrExpression: QueryOrExpression, options?: object): Promise<any> {
    try {
      return await this.store.query(queryOrExpression, options);
    } catch (err) {
      await this.store.requestQueue.skip();
      throw err;
    }
  }

  private async storeUpdate(transformOrOperations: TransformOrOperations, options?: object): Promise<any> {
    try {
      return await this.store.update(transformOrOperations, options);
    } catch (err) {
      await this.store.requestQueue.skip();
      throw err;
    }
  }

  private getOptions(requestType: RequestType): any {
    return { requestType };
  }

  private getOnlineUpdateOptions(persist: boolean): any {
    return this.getOptions(persist ? RequestType.OnlinePersist : RequestType.OnlineOnly);
  }

  private getRemoteQueryOptions(requestType: RequestType, include: string[][]): any {
    const options = this.getOptions(requestType);
    if (include != null && include.length > 0) {
      options.sources = { remote: { include: include.map(i => [i.map(rel => dasherize(rel)).join('.')]) } };
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

  private isChangeApplicable(
    query: Query,
    transform: Transform,
    results: PatchResultData[],
    include: string[][]
  ): boolean {
    let queryRecord: RecordIdentity;
    let queryType: string;
    let queryRelationship: { name: string; definition: RelationshipDefinition };
    let queryRelated: RecordRelationship;
    let includedTypes: Set<string>;
    switch (query.expression.op) {
      case 'findRecord':
        const findRecord = query.expression as FindRecord;
        queryRecord = findRecord.record;
        includedTypes = this.getIncludedTypes(queryRecord.type, include);
        break;
      case 'findRecords':
        const findRecords = query.expression as FindRecords;
        queryType = findRecords.type;
        includedTypes = this.getIncludedTypes(queryType, include);
        break;
      case 'findRelatedRecord':
      case 'findRelatedRecords':
        const findRelated = query.expression as FindRelatedRecord | FindRelatedRecords;
        queryRecord = findRelated.record;
        const model = this.schema.getModel(queryRecord.type);
        const relationshipDef = model.relationships[findRelated.relationship];
        queryRelationship = { name: findRelated.relationship, definition: relationshipDef };
        includedTypes = this.getIncludedTypes(relationshipDef.model, include);
        const record = this.store.cache.records(queryRecord.type).get(queryRecord.id);
        if (record != null) {
          queryRelated = deepGet(record, ['relationships', findRelated.relationship]);
        }
        break;
    }

    for (let i = 0; i < transform.operations.length; i++) {
      // skip operations that didn't result in an actual change
      if (results[i] == null) {
        continue;
      }
      const operation = transform.operations[i];
      const transformRecords: [RecordIdentity, string][] = [];
      switch (operation.op) {
        case 'addRecord':
          const addRecord = operation as AddRecordOperation;
          transformRecords.push([addRecord.record, '']);
          break;
        case 'replaceRecord':
          const replaceRecord = operation as ReplaceRecordOperation;
          transformRecords.push([replaceRecord.record, '']);
          break;
        case 'removeRecord':
          const removeRecord = operation as RemoveRecordOperation;
          transformRecords.push([removeRecord.record, '']);
          const removedRecord = results[i];
          const transformRecordModel = this.schema.getModel(removedRecord.type);
          // add any dependent records to the list of records to check
          for (const relName in transformRecordModel.relationships) {
            if (
              transformRecordModel.relationships.hasOwnProperty(relName) &&
              transformRecordModel.relationships[relName].dependent === 'remove'
            ) {
              const recRel = deepGet(removedRecord, ['relationships', relName]) as RecordRelationship;
              if (recRel != null) {
                const transformRelationship = transformRecordModel.relationships[relName].inverse;
                if (recRel.data instanceof Array) {
                  for (const r of recRel.data) {
                    transformRecords.push([r, transformRelationship]);
                  }
                } else {
                  transformRecords.push([recRel.data, transformRelationship]);
                }
              }
            }
          }
          break;
        case 'replaceAttribute':
          const replaceAttribute = operation as ReplaceAttributeOperation;
          transformRecords.push([replaceAttribute.record, '']);
          break;
        case 'addToRelatedRecords':
        case 'removeFromRelatedRecords':
        case 'replaceRelatedRecords':
        case 'replaceRelatedRecord':
          const updateRelated = operation as
            | AddToRelatedRecordsOperation
            | RemoveFromRelatedRecordsOperation
            | ReplaceRelatedRecordsOperation
            | ReplaceRelatedRecordOperation;
          transformRecords.push([updateRelated.record, updateRelated.relationship]);
          break;
      }

      for (const [transformRecord, transformRelationship] of transformRecords) {
        // check if the transformed record matches record being queried
        // if performing a related record query, ensure that the transformed relationship matches the queried
        // relationship
        if (
          equalRecordIdentities(queryRecord, transformRecord) &&
          (queryRelationship == null || queryRelationship.name === transformRelationship)
        ) {
          return true;
        }

        // check if the type of the transformed record matches the type being queried
        if (queryType === transformRecord.type) {
          return true;
        }

        // check if the type of the transformed record matches one of the included types
        if (includedTypes.has(transformRecord.type)) {
          return true;
        }

        // check if the transformed record is one of the related records being queried
        if (queryRelated != null) {
          if (this.isRelated(queryRelated, transformRecord)) {
            return true;
          } else if (operation.op === 'removeRecord') {
            // if the query is a related query, then check that the removed record was related to and dependent on the
            // query record
            const removedRecord = results[i];
            if (
              queryRelationship.definition.dependent === 'remove' &&
              removedRecord.type === queryRelationship.definition.model
            ) {
              const recRel = deepGet(removedRecord, ['relationships', queryRelationship.definition.inverse]);
              if (this.isRelated(recRel, queryRecord)) {
                return true;
              }
            }
          }
        }
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
    if (record == null) {
      return null;
    }
    const resource = this.newResource(record.type);
    resource.id = record.id;
    if (record.attributes != null) {
      extend(resource, clone(record.attributes));
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
    return this.newResourceRef(identity);
  }

  private createRecord(resource: Resource): Record {
    const record: Record = {
      id: resource.id,
      type: resource.type
    };
    const model = this.schema.getModel(resource.type);
    if (model.attributes != null) {
      record.attributes = {};
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
      record.relationships = {};
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

  private async _updateAttributes<T extends Resource>(
    identity: RecordIdentity,
    attrs: Partial<T>,
    requestType: RequestType
  ): Promise<T> {
    await this.storeUpdate(t => {
      const ops: Operation[] = [];
      for (const [name, value] of Object.entries(attrs)) {
        ops.push(t.replaceAttribute(identity, name, value));
      }
      return ops;
    }, this.getOptions(requestType));
    return this.localGet<T>(identity);
  }

  private getIncludedTypes(type: string, include: string[][]): Set<string> {
    const includedTypes = new Set<string>();
    if (include != null) {
      for (const i of include) {
        let curType = type;
        for (const rel of i) {
          const model = this.schema.getModel(curType);
          curType = model.relationships[rel].model;
          includedTypes.add(curType);
        }
      }
    }
    return includedTypes;
  }

  private isRelated(recRel: RecordRelationship, record: Record): boolean {
    if (recRel.data instanceof Array) {
      if (recRel.data.some(r => equalRecordIdentities(r, record))) {
        return true;
      }
    } else if (equalRecordIdentities(recRel.data, record)) {
      return true;
    }
    return false;
  }
}
