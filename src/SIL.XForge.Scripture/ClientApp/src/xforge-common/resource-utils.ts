import {
  Record, RecordHasManyRelationship, RecordHasOneRelationship, RecordIdentity, RecordRelationship
} from '@orbit/data';
import { Dict } from '@orbit/utils';

import { Resource } from './models/resource';

export function identity(type: string, id: string): RecordIdentity {
  return { type, id };
}

export function hasOne(type: string, id: string): RecordHasOneRelationship {
  return { data: identity(type, id) };
}

export function hasMany(type: string, ids: string[] | string): RecordHasManyRelationship {
  if (ids instanceof Array) {
    return { data: ids.map(id => identity(type, id)) };
  }
  return { data: [identity(type, ids)] };
}

export function record<T extends Resource>(type: string, resource: Partial<T>): Record {
  return {
    id: undefined,
    type,
    attributes: resource.attributes as Dict<any>,
    relationships: resource.relationships as Dict<RecordRelationship>
  };
}
