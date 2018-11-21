import { ProjectUserRef } from './project-user';
import { Resource, ResourceRef } from './resource';

export abstract class User extends Resource {
  static readonly TYPE = 'user';

  username?: string;
  name?: string;
  email?: string;
  canonicalEmail?: string;
  password?: string;
  paratextId?: string;

  projects?: ProjectUserRef[];

  constructor(init?: Partial<User>) {
    super(User.TYPE, init);
  }
}

export abstract class UserRef extends ResourceRef {
  static readonly TYPE = User.TYPE;

  constructor(id: string) {
    super(UserRef.TYPE, id);
  }
}
