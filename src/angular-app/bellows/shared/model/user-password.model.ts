import { User } from './user.model';

export class UserWithPassword extends User {
  password?: string;
}
