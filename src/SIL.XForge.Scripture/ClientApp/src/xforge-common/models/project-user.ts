import { Resource, ResourceRef } from './resource';

export abstract class ProjectUser extends Resource {
  static readonly TYPE = 'projectUser';

  role?: string;

  constructor(init?: Partial<ProjectUser>) {
    super(ProjectUser.TYPE, init);
  }
}

export abstract class ProjectUserRef extends ResourceRef {
  static readonly TYPE = ProjectUser.TYPE;

  constructor(id: string) {
    super(ProjectUserRef.TYPE, id);
  }
}
