import { APIRequestContext, BrowserContext } from "@playwright/test";
import { testControl } from "./jsonrpc";
import { loginAs } from "./login";
import { E2EUsernames } from "./e2e-users";
import * as fs from 'fs';
import constants from "../testConstants.json";
import path from "path";
import { testPath } from './path-utils';
import { UserDetails } from './fixtures';

const SESSION_LIFETIME = 365 * 24 * 60 * 60 * 1000; // 1 year, in milliseconds

type UserArray = [string, string, string, string];

function getUserArray(user: E2EUsernames | UserDetails): UserArray {
  if (typeof user === 'string') {
    const username = constants[`${user}Username`] ?? user;
    const fullName = constants[`${user}Name`] ?? username;
    const password = constants[`${user}Password`] ?? 'x';
    const email = constants[`${user}Email`] ?? `${username}@example.com`;
    return [username, fullName, password, email];
  } else {
    return [user.username, user.name, user.password, user.email];
  }
}

export async function createUser(request: APIRequestContext, user: E2EUsernames | UserDetails): Promise<string> {
  const userArray = getUserArray(user);
  return await testControl(request, 'create_user', userArray);
}

export async function initE2EUser(context: BrowserContext, user: E2EUsernames) {
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
  await loginAs(page, user);
  await context.storageState({ path });
}

export function getStorageStatePath(browser: string, user: string): string {
  const storageRoot = 'test-storage-state'
  const storageState = `${browser}-${user}-storageState.json`;
  return testPath(path.join(storageRoot, storageState));
}

export class UserTestService {

  constructor(private readonly request: APIRequestContext) {
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
