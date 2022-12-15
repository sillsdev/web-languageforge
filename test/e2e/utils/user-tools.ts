import { APIRequestContext, BrowserContext } from "@playwright/test";
import * as fs from 'fs';
import path from "path";
import { testControl } from "./jsonrpc";
import { login } from "./login";
import { testPath } from './path-utils';
import { UserDetails } from './types';

const SESSION_LIFETIME = 365 * 24 * 60 * 60 * 1000; // 1 year, in milliseconds

export async function createUser(request: APIRequestContext, user: UserDetails): Promise<string> {
  return await testControl(request, 'create_user', [user.username, user.name, user.password, user.email]);
}

export async function initE2EUser(context: BrowserContext, user: UserDetails) {
  await createUser(context.request, user);

  // Now log in and ensure there's a storage state saved
  const sessionCutoff = Date.now() - SESSION_LIFETIME;
  const browserName = context.browser().browserType().name();
  const path = getStorageStatePath(browserName, user);
  if (fs.existsSync(path) && fs.statSync(path)?.ctimeMs >= sessionCutoff) {
    // Storage state file is recent, no need to re-create it
    return;
  }
  const page = await context.newPage();
  await login(page, user);
  await context.storageState({ path });
}

export function getStorageStatePath(browser: string, user: UserDetails): string {
  const storageRoot = 'test-storage-state'
  const storageState = `${browser}-${user.username}-storageState.json`;
  return testPath(path.join(storageRoot, storageState));
}

export class UserTestService {

  constructor(private readonly request: APIRequestContext) {
  }

  async createRandomUser(): Promise<UserDetails & { id: string }> {
    const time = Date.now();
    const user = {
      username: `random_user_${time}`,
      password: `random_user_password`,
      name: `Random user - ${time}`,
      email: `random_user_${time}@example.com`,
    };
    return { ...user, id: await this.createUser(user) };
  }

  createUser(user: UserDetails): Promise<string> {
    return createUser(this.request, user);
  }

  getResetPasswordKey(usernameOrEmail: string): Promise<string> {
    return testControl(this.request, 'get_reset_password_key', [usernameOrEmail]);
  }

  expireAndGetResetPasswordKey(usernameOrEmail: string) {
    return testControl(this.request, 'expire_and_get_reset_password_key', [usernameOrEmail]);
  }
}
