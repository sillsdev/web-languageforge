import { IdentityResult } from './identity-result';

export interface SendInviteResult extends IdentityResult {
  isAlreadyInProject: boolean;
  emailTypeSent: string;
}
