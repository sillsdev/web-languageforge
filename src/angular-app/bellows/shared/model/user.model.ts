export class User {
  /* non-database fields (frontend only):
   * avatarRef
   * isInvitee */

  active: boolean = false;
  // tslint:disable-next-line: variable-name
  avatar_ref?: string;
  avatarUrl?: string;
  isInvitee?: boolean;
  dateCreated: string = '';
  email: string = '';
  id: string = '';
  // tslint:disable-next-line: variable-name
  last_login?: number;
  name: string = '';
  role: string = '';
  siteRole?: { [site: string]: string } = {};
  username: string = '';
}
