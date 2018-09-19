import { FindRecordsTerm, Record, RecordIdentity } from '@orbit/data';
import { Dict } from '@orbit/utils';
import { Observable } from 'rxjs';

import { JSONAPIService } from './json-api.service';

export abstract class BaseResourceService<TResource extends Record, TAttrs extends Dict<any>> {
  constructor(protected readonly jsonApiService: JSONAPIService) { }

  abstract get type(): string;

  getIdentity(id: string): RecordIdentity {
    return { type: this.type, id };
  }

  getById(id: string): Observable<TResource> {
    return this.get(this.getIdentity(id));
  }

  get(resource: RecordIdentity): Observable<TResource> {
    return this.jsonApiService.liveQuery(q => q.findRecord(resource));
  }

  getRelatedById<TRelationship extends Record>(id: string, relationship: string): Observable<TRelationship> {
    return this.getRelated(this.getIdentity(id), relationship);
  }

  getRelated<TRelationship extends Record>(resource: RecordIdentity, relationship: string): Observable<TRelationship> {
    return this.jsonApiService.liveQuery(q => q.findRelatedRecord(resource, relationship));
  }

  getAll(expressionBuilder = (t: FindRecordsTerm) => t): Observable<TResource[]> {
    return this.jsonApiService.liveQuery(q => expressionBuilder(q.findRecords(this.type)));
  }

  getAllRelatedById(id: string, relationship: string): Observable<TResource[]> {
    return this.getAllRelated(this.getIdentity(id), relationship);
  }

  getAllRelated<TRelationship extends Record>(resource: RecordIdentity, relationship: string
  ): Observable<TRelationship[]> {
    return this.jsonApiService.liveQuery(q => q.findRelatedRecords(resource, relationship));
  }

  onlineGetAll(expressionBuilder = (t: FindRecordsTerm) => t): Promise<TResource[]> {
    return this.jsonApiService.query(q => expressionBuilder(q.findRecords(this.type)));
  }

  create(resource: TResource): Promise<void> {
    return this.jsonApiService.create(resource);
  }

  updateById(id: string, attrs: TAttrs): Promise<void> {
    return this.jsonApiService.updateAttributes(this.getIdentity(id), attrs);
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
    return this.jsonApiService.delete(this.getIdentity(id));
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
