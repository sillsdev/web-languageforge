import path from "path";
import { files } from '../constants';
import { UserDetails } from "./types";

export const testPath = (relativeTestPath: string): string => {
  const testRoot = 'test/e2e';
  // true if running tests with VS-Code extension otherwise false
  return process.cwd().endsWith(testRoot)
    ? relativeTestPath
    : path.join(testRoot, relativeTestPath);
};

export type TestFile = typeof files[number];

export const testFilePath = (file: TestFile): string => {
  return testPath(`../data/${file}`);
}

export function getStorageStatePath(user: UserDetails): string {
  const storageRoot = 'test-storage-state'
  const storageState = `${user.username}-storageState.json`;
  return testPath(path.join(storageRoot, storageState));
}
