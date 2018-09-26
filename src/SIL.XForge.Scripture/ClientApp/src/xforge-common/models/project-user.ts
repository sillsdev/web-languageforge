import { Resource, ResourceAttributes } from './resource';

export class ProjectUserConstants {
  static readonly TYPE = 'projectUser';
}

export interface ProjectUserAttributes extends ResourceAttributes {
  role?: string;
}

export interface ProjectUser extends Resource {
  attributes?: ProjectUserAttributes;
}
