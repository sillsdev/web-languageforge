import { Resource, ResourceRef } from './resource';

export class User extends Resource {
  static readonly TYPE = 'user';

  username?: string;
  name?: string;
  email?: string;
  password?: string;
  active?: boolean;
  role?: string;

  paratextUsername?: string;

  constructor(init?: Partial<User>) {
    super(User.TYPE, init);
  }
}

export class UserRef extends ResourceRef {
  static readonly TYPE = User.TYPE;

  constructor(id: string) {
    super(UserRef.TYPE, id);
  }
}
