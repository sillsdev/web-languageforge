import { User } from './user.model';

// tslint:disable: variable-name
export class UserProfile extends User {
  age: string = '';
  avatar_color: string = '';
  avatar_shape: string = '';
  avatar_ref: string;
  communicate_via: string = '';
  gender: string = '';
  mobile_phone: string = '';
  projectUserProfiles: any;
}
