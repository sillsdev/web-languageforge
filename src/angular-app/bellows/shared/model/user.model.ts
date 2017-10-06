export class User {
  active: boolean = false;
  avatar_ref?: string;
  dateCreated: string = '';
  email: string = '';
  id: string = '';
  last_login?: number;
  name: string = '';
  role: string = '';
  siteRole?: { [site: string]: string } = {};
  username: string = '';
}
