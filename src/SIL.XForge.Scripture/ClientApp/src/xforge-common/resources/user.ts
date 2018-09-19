import { Record } from '@orbit/data';
import { Dict } from '@orbit/utils';

export class UserContants {
  static readonly TYPE = 'user';
}

export interface UserAttributes extends Dict<any> {
  username?: string;
  name?: string;
  email?: string;
  password?: string;
}

export interface User extends Record {
  attributes?: UserAttributes;
}
