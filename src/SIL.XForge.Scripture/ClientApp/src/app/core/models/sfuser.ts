import { User, UserRef } from '@xforge-common/models/user';
import { SFProjectUserRef } from './sfproject-user';

export class SFUser extends User {
  projects?: SFProjectUserRef[];

  constructor(init?: Partial<SFUser>) {
    super(init);
  }
}

export class SFUserRef extends UserRef { }
