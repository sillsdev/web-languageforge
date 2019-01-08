import { SFProjectUserRef, SFUserBase } from './sfdomain-model.generated';

export class SFUser extends SFUserBase {
  projects?: SFProjectUserRef[];

  constructor(init?: Partial<SFUser>) {
    super(init);
  }
}

export { SFUserRef } from './sfdomain-model.generated';
