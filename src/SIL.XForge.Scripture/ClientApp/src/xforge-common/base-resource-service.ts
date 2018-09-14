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
    return this.jsonApiService.get(this.getIdentity(id));
  }

  get(resource: RecordIdentity): Observable<TResource> {
    return this.jsonApiService.get(resource);
  }

  getRelatedById<TRelationship extends Record>(id: string, relationship: string): Observable<TRelationship> {
    return this.jsonApiService.getRelated(this.getIdentity(id), relationship);
  }

  getRelated<TRelationship extends Record>(resource: RecordIdentity, relationship: string): Observable<TRelationship> {
    return this.jsonApiService.getRelated(resource, relationship);
  }

  getAll(expressionBuilder = (t: FindRecordsTerm) => t): Observable<TResource[]> {
    return this.jsonApiService.getAll(this.type, expressionBuilder);
  }

  getAllRelatedById(id: string, relationship: string): Observable<TResource[]> {
    return this.jsonApiService.getAllRelated(this.getIdentity(id), relationship);
  }

  getAllRelated<TRelationship extends Record>(resource: RecordIdentity, relationship: string): Observable<TRelationship[]> {
    return this.jsonApiService.getAllRelated(resource, relationship);
  }

  create(resource: TResource, cache: boolean = true): Promise<void> {
    return this.jsonApiService.create(resource, cache);
  }

  updateById(id: string, attrs: TAttrs, cache: boolean = true): Promise<void> {
    return this.jsonApiService.update(this.getIdentity(id), attrs, cache);
  }

  update(resource: TResource, attrs: TAttrs, cache: boolean = true): Promise<void> {
    return this.jsonApiService.update(resource, attrs, cache);
  }

  replace(resource: TResource, cache: boolean = true): Promise<void> {
    return this.jsonApiService.replace(resource, cache);
  }

  delete(resource: TResource, cache: boolean = true): Promise<void> {
    return this.jsonApiService.delete(resource, cache);
  }

  deleteById(id: string, cache: boolean = true): Promise<void> {
    return this.jsonApiService.delete(this.getIdentity(id), cache);
  }

  addRelated(resource: RecordIdentity, relationship: string, related: RecordIdentity, cache: boolean = true
  ): Promise<void> {
    return this.jsonApiService.addRelated(resource, relationship, related, cache);
  }

  removeRelated(resource: RecordIdentity, relationship: string, related: RecordIdentity, cache: boolean = true
  ): Promise<void> {
    return this.jsonApiService.removeRelated(resource, relationship, related, cache);
  }

  replaceAllRelated(resource: RecordIdentity, relationship: string, related: RecordIdentity[], cache: boolean = true
  ): Promise<void> {
    return this.jsonApiService.replaceAllRelated(resource, relationship, related, cache);
  }

  setRelated(resource: RecordIdentity, relationship: string, related: RecordIdentity, cache: boolean = true
  ): Promise<void> {
    return this.jsonApiService.setRelated(resource, relationship, related, cache);
  }
}
