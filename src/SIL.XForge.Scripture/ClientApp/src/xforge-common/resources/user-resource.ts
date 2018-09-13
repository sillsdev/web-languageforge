import { Record } from '@orbit/data';
import { Dict } from '@orbit/utils';

export interface UserAttributes extends Dict<any> {
  username?: string;
  name?: string;
  email?: string;
  password?: string;
}

export interface UserResource extends Record {
  attributes?: UserAttributes;
}
