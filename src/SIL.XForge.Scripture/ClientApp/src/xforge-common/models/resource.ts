import { Record, RecordRelationship } from '@orbit/data';
import { Dict } from '@orbit/utils';

export interface ResourceAttributes {
  dateModified?: string;
  dateCreated?: string;
}

export type ResourceRelationships = Dict<RecordRelationship>;

export interface Resource extends Record {
  attributes?: ResourceAttributes;
  relationships?: ResourceRelationships;
}
