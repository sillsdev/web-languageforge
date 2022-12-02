import { User } from './user.model';

export class UserProfile extends User {
  age: string = '';
  avatar_color: string = '';
  avatar_shape: string = '';
  avatar_ref: string;
  gender: string = '';
  projectUserProfiles: any;
}
