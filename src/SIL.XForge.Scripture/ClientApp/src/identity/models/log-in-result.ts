import { IdentityResult } from './identity-result';

export interface LogInResult extends IdentityResult {
  isReturnUrlTrusted: boolean;
}
