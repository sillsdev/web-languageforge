import { IdentityResult } from './identity-result';

export interface SignUpResult extends IdentityResult {
  reason?: string;
}
