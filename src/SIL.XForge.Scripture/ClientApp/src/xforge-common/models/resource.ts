import { RecordIdentity } from '@orbit/data';
import { clone } from '@orbit/utils';

export interface ResourceRefConstructor {
  readonly TYPE: string;

  new(id: string): ResourceRef;
}

/**
 * This is the base class for all resource reference classes. This class represents a reference to a resource of the
 * specified type. Subclasses should override the constructor and provide the correct type.
 */
export abstract class ResourceRef implements RecordIdentity {
  static readonly TYPE: string;

  constructor(public readonly type: string, public readonly id: string) { }
}

export interface ResourceConstructor {
  readonly TYPE: string;

  new(init?: Partial<Resource>): Resource;
}

/**
 * This is the base class for all resource models. Subclasses should override the constructor and provide the correct
 * type.
 */
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
