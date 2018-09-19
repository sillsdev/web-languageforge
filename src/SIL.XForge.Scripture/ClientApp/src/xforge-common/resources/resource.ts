import { Record } from '@orbit/data';
import { Dict } from '@orbit/utils';

export interface ResourceAttributes extends Dict<any> {
  dateModified?: string;
  dateCreated?: string;
}

export interface Resource extends Record {
  attributes?: ResourceAttributes;
}
