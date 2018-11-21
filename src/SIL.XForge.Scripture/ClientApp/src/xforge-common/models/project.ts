import { ProjectUserRef } from './project-user';
import { Resource, ResourceRef } from './resource';

export abstract class Project extends Resource {
  static readonly TYPE = 'project';

  projectName?: string;

  users?: ProjectUserRef[];

  constructor(init?: Partial<Project>) {
    super(Project.TYPE, init);
  }

  abstract get taskNames(): string[];
}

export abstract class ProjectRef extends ResourceRef {
  static readonly TYPE = Project.TYPE;

  constructor(id: string) {
    super(ProjectRef.TYPE, id);
  }
}
