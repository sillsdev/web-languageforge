import { RecordIdentity } from '@orbit/data';
import { clone } from '@orbit/utils';

const recordTypeToResourceTypeMap = new Map<string, ResourceConstructor>();
const recordTypeToResourceRefTypeMap = new Map<string, ResourceRefConstructor>();

export function resource(target: ResourceConstructor) {
  recordTypeToResourceTypeMap.set(target.TYPE, target);
}

export function resourceRef(target: ResourceRefConstructor) {
  recordTypeToResourceRefTypeMap.set(target.TYPE, target);
}

export function getResourceType(recordType: string): ResourceConstructor {
  return recordTypeToResourceTypeMap.get(recordType);
}

export function getResourceRefType(recordType: string): ResourceRefConstructor {
  return recordTypeToResourceRefTypeMap.get(recordType);
}

export interface ResourceRefConstructor {
  readonly TYPE: string;

  new(id: string): ResourceRef;
}

export abstract class ResourceRef implements RecordIdentity {
  static readonly TYPE: string;

  constructor(public readonly type: string, public readonly id: string) { }
}

export interface ResourceConstructor {
  readonly TYPE: string;

  new(init?: Partial<Resource>): Resource;
}

export abstract class Resource implements RecordIdentity {
  static readonly TYPE: string;

  id: string;
  dateModified?: string;
  dateCreated?: string;

  constructor(public readonly type: string, init?: Partial<Resource>) {
    if (init != null) {
      for (const name in init) {
        if (init.hasOwnProperty(name)) {
          let value = init[name];
          if (!(value instanceof ResourceRef)) {
            value = clone(value);
          }
          this[name] = value;
        }
      }
    }
  }
}
