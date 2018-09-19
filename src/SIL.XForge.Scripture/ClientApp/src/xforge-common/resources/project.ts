import { Record } from '@orbit/data';
import { Dict } from '@orbit/utils';

export class ProjectConstants {
  static readonly TYPE = 'project';
}

export interface ProjectRole {
  role: string;
}

export interface ProjectAttributes extends Dict<any> {
  projectName?: string;
  projectCode?: string;
  userRoles?: Dict<ProjectRole>;
}

export interface Project extends Record {
  attributes?: ProjectAttributes;
}
