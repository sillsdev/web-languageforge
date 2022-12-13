import path from "path";
import { files } from '../testConstants.json';

export const testPath = (relativeTestPath: string): string => {
  const testRoot = 'test/e2e';
  // true if running tests with VS-Code extension otherwise false
  return process.cwd().endsWith(testRoot)
    ? relativeTestPath
    : path.join(testRoot, relativeTestPath);
};

export type TestFile = keyof typeof files;

export const testFilePath = (file: TestFile): string => {
  return testPath(`shared-files/${file}`);
}
