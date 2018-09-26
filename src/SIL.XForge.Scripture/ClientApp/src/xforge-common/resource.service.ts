import { RecordHasManyRelationship, RecordHasOneRelationship, RecordIdentity } from '@orbit/data';

import { JSONAPIService } from './jsonapi.service';
import { Resource, ResourceAttributes, ResourceRelationships } from './models/resource';

export class ResourceService<TResource extends Resource, TAttrs extends ResourceAttributes,
  TRels extends ResourceRelationships> {

  constructor(protected readonly jsonApiService: JSONAPIService, protected type: string) { }

  identity(id: string): RecordIdentity {
    return { type: this.type, id };
  }

  hasOne(id: string): RecordHasOneRelationship {
    return { data: this.identity(id) };
  }

  hasMany(ids: string[] | string): RecordHasManyRelationship {
    if (ids instanceof Array) {
      return { data: ids.map(id => this.identity(id)) };
    }
    return { data: [this.identity(ids)] };
  }

  newResource(resource: { attributes?: TAttrs, relationships?: TRels }): TResource {
    return {
      id: undefined,
      type: this.type,
      attributes: resource.attributes as ResourceAttributes,
      relationships: resource.relationships as ResourceRelationships
    } as TResource;
  }
}
