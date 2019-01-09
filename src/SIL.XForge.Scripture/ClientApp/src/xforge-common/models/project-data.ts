import { ProjectRef } from './project';
import { Resource, ResourceRef } from './resource';
import { UserRef } from './user';

export abstract class ProjectData extends Resource {
  project?: ProjectRef;
  owner?: UserRef;
}

export abstract class ProjectDataRef extends ResourceRef {}
