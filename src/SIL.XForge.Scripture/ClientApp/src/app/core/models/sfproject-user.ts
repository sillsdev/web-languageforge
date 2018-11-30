import { ProjectUser, ProjectUserRef } from '@xforge-common/models/project-user';
import { SFProjectRef } from './sfproject';
import { SFUserRef } from './sfuser';

export class SFProjectUser extends ProjectUser {
  translateConfig?: any;

  user?: SFUserRef;
  project?: SFProjectRef;

  constructor(init?: Partial<SFProjectUser>) {
    super(init);
  }
}

export class SFProjectUserRef extends ProjectUserRef {}
