import { ProjectUserRef } from './project-user';
import { Resource, ResourceRef } from './resource';
import { Site } from './site';
import { SystemRole } from './system-role';

export abstract class User extends Resource {
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

  get isSystemAdmin(): boolean {
    return this.role === SystemRole.SystemAdmin;
  }
}

export abstract class UserRef extends ResourceRef {}
