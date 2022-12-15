import path from "path";
import { files } from '../constants';

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

export const serverTestFilePath = (file: TestFile): string => {
  return testPath(`/tmp/e2e-test-data/${file}`);
}
