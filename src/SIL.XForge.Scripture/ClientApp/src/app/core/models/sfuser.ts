import { User, UserRef } from '@xforge-common/models/user';
import { SFProjectUserRef, SFUserBase } from './sfproject.generated';

export class SFUser extends SFUserBase {
  projects?: SFProjectUserRef[];

  constructor(init?: Partial<SFUser>) {
    super(init);
  }
}

export class SFUserRef extends UserRef {}
