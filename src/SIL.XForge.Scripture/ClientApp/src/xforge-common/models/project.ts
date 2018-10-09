import { Resource, ResourceAttributes, ResourceRelationships } from './resource';

export const PROJECT = 'project';

export interface ProjectAttributes extends ResourceAttributes {
  projectName?: string;
}

export type ProjectRelationships = ResourceRelationships;

export interface Project extends Resource {
  attributes?: ProjectAttributes;
}
