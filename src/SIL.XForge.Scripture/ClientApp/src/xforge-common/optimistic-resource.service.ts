import { FindRecordsTerm, RecordIdentity } from '@orbit/data';

import { JSONAPIService } from './jsonapi.service';
import { LiveQueryObservable } from './live-query-observable';
import { Resource, ResourceRef } from './models/resource';

export class OptimisticResourceService<TResource extends Resource> {

  constructor(protected readonly jsonApiService: JSONAPIService, protected readonly type: string) { }

  getById(id: string): LiveQueryObservable<TResource> {
    return this.jsonApiService.get(this.identity(id));
  }

  getRelatedById(id: string, relationship: string): LiveQueryObservable<any> {
    return this.jsonApiService.getRelated(this.identity(id), relationship);
  }

  getRelated(resource: TResource, relationship: string): LiveQueryObservable<any> {
    return this.getRelatedById(resource.id, relationship);
  }

  getAll(expressionBuilder = (t: FindRecordsTerm) => t): LiveQueryObservable<TResource[]> {
    return this.jsonApiService.getAll(this.type, expressionBuilder);
  }

  getAllRelatedById(id: string, relationship: string): LiveQueryObservable<any[]> {
    return this.jsonApiService.getAllRelated(this.identity(id), relationship);
  }

  getAllRelated(resource: TResource, relationship: string): LiveQueryObservable<any[]> {
    return this.getAllRelatedById(resource.id, relationship);
  }

  create(resource: TResource): Promise<string> {
    return this.jsonApiService.create(resource);
  }

  updateById(id: string, attrs: Partial<TResource>): Promise<void> {
    return this.jsonApiService.updateAttributes(this.identity(id), attrs);
  }

  update(resource: TResource): Promise<void> {
    return this.jsonApiService.update(resource);
  }

  replace(resource: TResource): Promise<void> {
    return this.jsonApiService.replace(resource);
  }

  delete(resource: TResource): Promise<void> {
    return this.jsonApiService.delete(resource);
  }

  deleteById(id: string): Promise<void> {
    return this.jsonApiService.delete(this.identity(id));
  }

  replaceAllRelatedById(id: string, relationship: string, related: ResourceRef[]): Promise<void> {
    return this.jsonApiService.replaceAllRelated(this.identity(id), relationship, related);
  }

  setRelatedById(id: string, relationship: string, related: ResourceRef): Promise<void> {
    return this.jsonApiService.setRelated(this.identity(id), relationship, related);
  }

  protected identity(id: string): RecordIdentity {
    return { type: this.type, id };
  }
}
