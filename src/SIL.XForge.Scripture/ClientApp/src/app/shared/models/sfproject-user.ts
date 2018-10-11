import { ProjectUser, ProjectUserRef } from '@xforge-common/models/project-user';
import { resource, resourceRef } from '@xforge-common/models/resource';
import { SFProjectRef } from './sfproject';
import { SFUserRef } from './sfuser';

@resource
export class SFProjectUser extends ProjectUser {
  translateConfig?: any;

  user?: SFUserRef;
  project?: SFProjectRef;

  constructor(init?: Partial<SFProjectUser>) {
    super(init);
  }
}

@resourceRef
export class SFProjectUserRef extends ProjectUserRef { }
