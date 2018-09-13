import { FindRecordsTerm, Record, RecordIdentity } from '@orbit/data';
import { Dict } from '@orbit/utils';

import { JSONAPIService } from './json-api.service';

export abstract class BaseResourceService<TResource extends Record, TAttrs extends Dict<any>> {
  constructor(protected readonly jsonApiService: JSONAPIService) { }

  abstract get type(): string;

  getIdentity(id: string): RecordIdentity {
    return { type: this.type, id };
  }

  getById(id: string): Promise<TResource> {
    return this.jsonApiService.get(this.getIdentity(id));
  }

  get(resource: RecordIdentity): Promise<TResource> {
    return this.jsonApiService.get(resource);
  }

  getRelatedById<TRelationship extends Record>(id: string, relationship: string): Promise<TRelationship> {
    return this.jsonApiService.getRelated(this.getIdentity(id), relationship);
  }

  getRelated<TRelationship extends Record>(resource: RecordIdentity, relationship: string): Promise<TRelationship> {
    return this.jsonApiService.getRelated(resource, relationship);
  }

  getAll(expressionBuilder = (t: FindRecordsTerm) => t): Promise<TResource[]> {
    return this.jsonApiService.getAll(this.type, expressionBuilder);
  }

  getAllRelatedById(id: string, relationship: string): Promise<TResource[]> {
    return this.jsonApiService.getAllRelated(this.getIdentity(id), relationship);
  }

  getAllRelated<TRelationship extends Record>(resource: RecordIdentity, relationship: string): Promise<TRelationship[]> {
    return this.jsonApiService.getAllRelated(resource, relationship);
  }

  create(resource: TResource): Promise<void> {
    return this.jsonApiService.create(resource);
  }

  updateById(id: string, attrs: TAttrs): Promise<TResource> {
    return this.jsonApiService.update(this.getIdentity(id), attrs);
  }

  update(resource: TResource, attrs: TAttrs): Promise<TResource> {
    return this.jsonApiService.update(resource, attrs);
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

  addRelated(resource: RecordIdentity, relationship: string, related: RecordIdentity): Promise<TResource> {
    return this.jsonApiService.addRelated(resource, relationship, related);
  }

  removeRelated(resource: RecordIdentity, relationship: string, related: RecordIdentity): Promise<TResource> {
    return this.jsonApiService.removeRelated(resource, relationship, related);
  }

  replaceAllRelated(resource: RecordIdentity, relationship: string, related: RecordIdentity[]): Promise<TResource> {
    return this.jsonApiService.replaceAllRelated(resource, relationship, related);
  }

  setRelated(resource: RecordIdentity, relationship: string, related: RecordIdentity): Promise<TResource> {
    return this.jsonApiService.setRelated(resource, relationship, related);
  }
}
