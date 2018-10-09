import { Resource, ResourceAttributes, ResourceRelationships } from './resource';

export const USER = 'user';

export interface UserAttributes extends ResourceAttributes {
  username?: string;
  name?: string;
  email?: string;
  password?: string;
  paratextUsername?: string;
}

export type UserRelationships = ResourceRelationships;

export interface User extends Resource {
  attributes?: UserAttributes;
}
