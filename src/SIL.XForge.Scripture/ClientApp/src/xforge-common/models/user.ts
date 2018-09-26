import { Resource, ResourceAttributes } from './resource';

export class UserContants {
  static readonly TYPE = 'user';
}

export interface UserAttributes extends ResourceAttributes {
  username?: string;
  name?: string;
  email?: string;
  password?: string;
  paratextUsername?: string;
}

export interface User extends Resource {
  attributes?: UserAttributes;
}
