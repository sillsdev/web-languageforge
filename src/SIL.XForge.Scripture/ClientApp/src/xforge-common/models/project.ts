import { Resource, ResourceAttributes } from './resource';

export class ProjectConstants {
  static readonly TYPE = 'project';
}

export interface ProjectAttributes extends ResourceAttributes {
  projectName?: string;
}

export interface Project extends Resource {
  attributes?: ProjectAttributes;
}
