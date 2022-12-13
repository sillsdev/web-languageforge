import path from "path";
import { files } from '../testConstants.json';

export const testPath = (relativeTestPath: string): string => {
  const testRoot = 'test/e2e';
  // true if running tests with VS-Code extension otherwise false
  return process.cwd().endsWith(testRoot)
    ? relativeTestPath
    : path.join(testRoot, relativeTestPath);
};

export type TestFileName = keyof typeof files;

export const testFile = (file: TestFileName): string => {
  const fileName = files[file].name;
  return testPath(`shared-files/${fileName}`);
}
