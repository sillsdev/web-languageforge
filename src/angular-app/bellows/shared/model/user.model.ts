export class User {
  active: boolean = false;
  // noinspection TsLint
  avatar_ref?: string;
  avatarUrl?: string;
  dateCreated: string = '';
  email: string = '';
  id: string = '';
  // noinspection TsLint
  last_login?: number;
  name: string = '';
  role: string = '';
  siteRole?: { [site: string]: string } = {};
  username: string = '';
}
