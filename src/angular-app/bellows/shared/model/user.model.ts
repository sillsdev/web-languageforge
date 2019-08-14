export class User {
  /* non-database fields (frontend only):
   * avatarRef
   * isInvitee */

  active: boolean = false;
  // noinspection TsLint
  avatar_ref?: string;
  avatarUrl?: string;
  isInvitee?: boolean;
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
