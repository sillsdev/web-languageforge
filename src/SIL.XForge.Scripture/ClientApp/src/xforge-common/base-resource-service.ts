import { FindRecordsTerm, Record, RecordIdentity } from '@orbit/data';
import { Dict } from '@orbit/utils';

import { ApiService } from './api.service';

export abstract class BaseResourceService<TResource extends Record, TAttrs extends Dict<any>> {
  constructor(protected readonly apiService: ApiService) { }

  abstract get type(): string;

  getIdentity(id: string): RecordIdentity {
    return { type: this.type, id };
  }

  getById(id: string): Promise<TResource> {
    return this.apiService.get(this.getIdentity(id));
  }

  get(resource: RecordIdentity): Promise<TResource> {
    return this.apiService.get(resource);
  }

  getRelatedById<TRelationship extends Record>(id: string, relationship: string): Promise<TRelationship> {
    return this.apiService.getRelated(this.getIdentity(id), relationship);
  }

  getRelated<TRelationship extends Record>(resource: RecordIdentity, relationship: string): Promise<TRelationship> {
    return this.apiService.getRelated(resource, relationship);
  }

  getAll(expressionBuilder = (t: FindRecordsTerm) => t): Promise<TResource[]> {
    return this.apiService.getAll(this.type, expressionBuilder);
  }

  getAllRelatedById(id: string, relationship: string): Promise<TResource[]> {
    return this.apiService.getAllRelated(this.getIdentity(id), relationship);
  }

  getAllRelated<TRelationship extends Record>(resource: RecordIdentity, relationship: string): Promise<TRelationship[]> {
    return this.apiService.getAllRelated(resource, relationship);
  }

  create(resource: TResource): Promise<void> {
    return this.apiService.create(resource);
  }

  updateById(id: string, attrs: TAttrs): Promise<TResource> {
    return this.apiService.update(this.getIdentity(id), attrs);
  }

  update(resource: TResource, attrs: TAttrs): Promise<TResource> {
    return this.apiService.update(resource, attrs);
  }

  replace(resource: TResource): Promise<void> {
    return this.apiService.replace(resource);
  }

  delete(resource: TResource): Promise<void> {
    return this.apiService.delete(resource);
  }

  deleteById(id: string): Promise<void> {
    return this.apiService.delete(this.getIdentity(id));
  }

  addRelated(resource: RecordIdentity, relationship: string, related: RecordIdentity): Promise<TResource> {
    return this.apiService.addRelated(resource, relationship, related);
  }

  removeRelated(resource: RecordIdentity, relationship: string, related: RecordIdentity): Promise<TResource> {
    return this.apiService.removeRelated(resource, relationship, related);
  }

  replaceAllRelated(resource: RecordIdentity, relationship: string, related: RecordIdentity[]): Promise<TResource> {
    return this.apiService.replaceAllRelated(resource, relationship, related);
  }

  setRelated(resource: RecordIdentity, relationship: string, related: RecordIdentity): Promise<TResource> {
    return this.apiService.setRelated(resource, relationship, related);
  }
}
