import { Resource, ResourceRef } from './resource';

export abstract class Project extends Resource {
  static readonly TYPE = 'project';

  projectName?: string;

  constructor(init?: Partial<Project>) {
    super(Project.TYPE, init);
  }
}

export abstract class ProjectRef extends ResourceRef {
  static readonly TYPE = Project.TYPE;

  constructor(id: string) {
    super(ProjectRef.TYPE, id);
  }
}
