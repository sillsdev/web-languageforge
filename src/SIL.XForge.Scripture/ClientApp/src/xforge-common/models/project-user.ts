import { ProjectRef } from './project';
import { Resource, ResourceRef } from './resource';
import { UserRef } from './user';

export abstract class ProjectUser extends Resource {
  role?: string;
  user?: UserRef;
  project?: ProjectRef;
}

export abstract class ProjectUserRef extends ResourceRef {
  static readonly TYPE = ProjectUser.TYPE;

  constructor(type: string, id: string) {
    super(type, id);
  }
}
