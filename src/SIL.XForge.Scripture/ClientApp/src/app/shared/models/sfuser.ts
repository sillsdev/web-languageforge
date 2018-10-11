import { resource, resourceRef } from '@xforge-common/models/resource';
import { User, UserRef } from '@xforge-common/models/user';
import { SFProjectUserRef } from './sfproject-user';

@resource
export class SFUser extends User {
  projects?: SFProjectUserRef[];

  constructor(init?: Partial<SFUser>) {
    super(init);
  }
}

@resourceRef
export class SFUserRef extends UserRef { }
