import { Resource, ResourceAttributes, ResourceRelationships } from './resource';

export const PROJECT_USER = 'projectUser';

export interface ProjectUserAttributes extends ResourceAttributes {
  role?: string;
}

export type ProjectUserRelationships = ResourceRelationships;

export interface ProjectUser extends Resource {
  attributes?: ProjectUserAttributes;
}
