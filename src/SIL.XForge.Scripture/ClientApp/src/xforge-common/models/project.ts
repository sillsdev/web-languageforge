import { ProjectUserRef } from './project-user';
import { Resource, ResourceRef } from './resource';

export abstract class Project extends Resource {
  projectName?: string;
  users?: ProjectUserRef[];

  abstract get taskNames(): string[];
}

export abstract class ProjectRef extends ResourceRef {
  constructor(type: string, id: string) {
    super(type, id);
  }
}
