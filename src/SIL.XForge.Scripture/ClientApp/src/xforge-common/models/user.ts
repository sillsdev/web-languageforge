import { ProjectUserRef } from './project-user';
import { Resource, ResourceRef } from './resource';
import { Site } from './site';
import { SystemRole } from './system-role';

export class User extends Resource {
  static readonly TYPE: string = 'user';

  username?: string;
  name?: string;
  email?: string;
  canonicalEmail?: string;
  emailVerified?: boolean;
  googleId?: string;
  password?: string;
  paratextId?: string;
  active?: boolean;
  avatarUrl?: string;
  role?: string;
  mobilePhone?: string;
  contactMethod?: 'email' | 'sms' | 'emailSms';
  birthday?: Date;
  gender?: 'female' | 'male';
  site?: Site;

  projects?: ProjectUserRef[];

  constructor(init?: Partial<User>) {
    super(User.TYPE, init);
  }

  get isSystemAdmin(): boolean {
    return this.role === SystemRole.SystemAdmin;
  }
}

export class UserRef extends ResourceRef {
  static readonly TYPE: string = User.TYPE;

  constructor(id: string) {
    super(UserRef.TYPE, id);
  }
}
