import { Dict } from '@orbit/utils';
import { Resource, ResourceAttributes } from './resource';

export class ProjectConstants {
  static readonly TYPE = 'project';
}

export interface ProjectRole {
  role: string;
}

export interface ProjectAttributes extends ResourceAttributes {
  projectName?: string;
  projectCode?: string;
  userRoles?: Dict<ProjectRole>;
}

export interface Project extends Resource {
  attributes?: ProjectAttributes;
}
