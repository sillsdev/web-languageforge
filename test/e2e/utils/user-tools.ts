import { APIRequestContext, BrowserContext } from "@playwright/test";
import { testControl } from "./jsonrpc";
import { loginAs } from "./login";
import { E2EUsernames } from "./e2e-users";
import * as fs from 'fs';
import constants from "../testConstants.json";
import path from "path";
import { testPath } from './path-utils';

const SESSION_LIFETIME = 365 * 24 * 60 * 60 * 1000; // 1 year, in milliseconds

function createUser(request: APIRequestContext, baseName: string) {
  const username = constants[`${baseName}Username`] ?? baseName;
  const fullName = constants[`${baseName}Name`] ?? username;
  const password = constants[`${baseName}Password`] ?? 'x';
  const email = constants[`${baseName}Email`] ?? `${username}@example.com`;
  return testControl(request, 'create_user', [username, fullName, password, email]);
}

export async function initUser(context: BrowserContext, user: E2EUsernames) {
  const id = await createUser(context.request, user);

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
