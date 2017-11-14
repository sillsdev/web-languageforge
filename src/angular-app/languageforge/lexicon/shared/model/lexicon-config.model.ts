export class LexiconConfig {
  tasks: any;

  /** @var LexConfigFieldList */
  entry: any;

  /**
   * key is LexRoles const
   * @var MapOf <LexRoleViewConfig>
   */
  roleViews: any;

  /**
   * key is userId
   * @var MapOf <LexUserViewConfig>
   */
  userViews: any;

  /** @var MapOf <InputSystem> */
  inputSystems?: any;
}
