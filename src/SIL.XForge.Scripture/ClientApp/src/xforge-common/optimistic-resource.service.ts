import { FindRecordsTerm, Record, RecordIdentity } from '@orbit/data';

import { JSONAPIService } from './jsonapi.service';
import { LiveQueryObservable } from './live-query-observable';
import { Resource, ResourceAttributes } from './models/resource';
import { identity, record } from './resource-utils';

export class OptimisticResourceService<TResource extends Resource, TAttrs extends ResourceAttributes> {

  constructor(protected readonly jsonApiService: JSONAPIService, protected type: string) { }

  getById(id: string): LiveQueryObservable<TResource> {
    return this.get(identity(this.type, id));
  }

  get(resource: RecordIdentity): LiveQueryObservable<TResource> {
    return this.jsonApiService.liveQuery(q => q.findRecord(resource));
  }

  getRelatedById<TRelationship extends Record>(id: string, relationship: string): LiveQueryObservable<TRelationship> {
    return this.getRelated(identity(this.type, id), relationship);
  }

  getRelated<TRelationship extends Record>(resource: RecordIdentity, relationship: string
  ): LiveQueryObservable<TRelationship> {
    return this.jsonApiService.liveQuery(q => q.findRelatedRecord(resource, relationship));
  }

  getAll(expressionBuilder = (t: FindRecordsTerm) => t): LiveQueryObservable<TResource[]> {
    return this.jsonApiService.liveQuery(q => expressionBuilder(q.findRecords(this.type)));
  }

  getAllRelatedById(id: string, relationship: string): LiveQueryObservable<TResource[]> {
    return this.getAllRelated(identity(this. type, id), relationship);
  }

  getAllRelated<TRelationship extends Record>(resource: RecordIdentity, relationship: string
  ): LiveQueryObservable<TRelationship[]> {
    return this.jsonApiService.liveQuery(q => q.findRelatedRecords(resource, relationship));
  }

  create(resource: Partial<TResource>): Promise<string> {
    return this.jsonApiService.create(record(this.type, resource));
  }

  updateById(id: string, attrs: TAttrs): Promise<void> {
    return this.jsonApiService.updateAttributes(identity(this.type, id), attrs);
  }

  update(resource: TResource, attrs: TAttrs): Promise<void> {
    return this.jsonApiService.updateAttributes(resource, attrs);
  }

  replace(resource: TResource): Promise<void> {
    return this.jsonApiService.replace(resource);
  }

  delete(resource: TResource): Promise<void> {
    return this.jsonApiService.delete(resource);
  }

  deleteById(id: string): Promise<void> {
    return this.jsonApiService.delete(identity(this.type, id));
  }

  addRelated(resource: RecordIdentity, relationship: string, related: RecordIdentity): Promise<void> {
    return this.jsonApiService.addRelated(resource, relationship, related);
  }

  removeRelated(resource: RecordIdentity, relationship: string, related: RecordIdentity): Promise<void> {
    return this.jsonApiService.removeRelated(resource, relationship, related);
  }

  replaceAllRelated(resource: RecordIdentity, relationship: string, related: RecordIdentity[]): Promise<void> {
    return this.jsonApiService.replaceAllRelated(resource, relationship, related);
  }

  setRelated(resource: RecordIdentity, relationship: string, related: RecordIdentity): Promise<void> {
    return this.jsonApiService.setRelated(resource, relationship, related);
  }
}
