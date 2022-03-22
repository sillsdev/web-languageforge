import { APIRequestContext } from '@playwright/test';
import { testControl } from './jsonrpc';

export function changePassword(request: APIRequestContext, username: string, password: string) {
  return testControl(request, 'change_password', [username, password]);
}
