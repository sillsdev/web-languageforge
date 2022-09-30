import { testControl } from './jsonrpc';
import { copyFile } from 'fs/promises';
import { existsSync } from 'fs';
import * as path from 'path';
import { cwd } from 'process';
import { APIRequestContext } from '@playwright/test';

type CustomFieldType =
  'MultiString' |
  'ReferenceAtom' |
  'ReferenceCollection' |
  'OwningAtom'
  // TODO: Add more (look at LfMerge custom field code to find out what they can be)
;

type LfFieldType =
  'fields' |
  'multitext' |
  'multiparagraph' |
  'optionlist' |
  'multioptionlist' |
  'pictures'
;

export function initTestProject(request: APIRequestContext,
                                projectCode: string,
                                projectName: string,
                                ownerUsername: string,
                                memberUsernames: string[] = [])
{
  return testControl(request, 'init_test_project', [projectCode, projectName, ownerUsername, memberUsernames]);
}

export function addWritingSystemToProject(request: APIRequestContext, projectCode: string, languageTag: string, abbr = '', name = '')
{
  return testControl(request, 'add_writing_system_to_project', [projectCode, languageTag, abbr, name]);
}

// Name is addUser because that's what our PHP function is named, but it can also update roles of existing users
export function addUserToProject(request: APIRequestContext, projectCode: string, username: string, role?: string) {
  return testControl(request, 'add_user_to_project', [projectCode, username, role]);
}

// Returns absolute path to file location *inside* the container
async function copyFileToSharedDir(filename: string): Promise<string> {
  const commonDir = await findTestCommonDir();
  if (commonDir) {
    const srcPath = path.resolve(commonDir, filename);
    const sharedDir = path.resolve(commonDir, '..', 'e2e', 'shared-files');
    const serverDir = '/tmp/e2e-shared-files';
    const destPath = path.join(sharedDir, filename);
    const serverPath = path.join(serverDir, filename);
    await copyFile(srcPath, destPath);
    return serverPath;
  } else {
    throw new Error('Dir test/common not found; E2E tests should be run from inside Git repo');
  }
}

async function findTestCommonDir() {
  let cur = cwd();
  while (! existsSync(path.resolve(cur, 'test', 'common'))) {
    const newPath = path.resolve(cur, '..');
    if (newPath === cur) {
      // We've hit the top of the directory structure without finding it
      return undefined;
    }
    cur = newPath;
  }
  return path.resolve(cur, 'test', 'common');
}

export async function addPictureFileToProject(request: APIRequestContext, projectCode: string, filename: string) {
  const destPath = await copyFileToSharedDir(filename);
  return testControl(request, 'add_picture_file_to_project', [projectCode, destPath]);
}

export async function addAudioVisualFileToProject(request: APIRequestContext, projectCode: string, filename: string) {
  const destPath = await copyFileToSharedDir(filename);
  return testControl(request, 'add_audio_visual_file_to_project', [projectCode, destPath]);
}

export function addCustomField(request: APIRequestContext,
  projectCode: string,
  fieldName: string,
  parentField: 'entry' | 'senses' | 'examples',
  fieldType: CustomFieldType = 'MultiString',
  extraOptions: any = null) {
return testControl(request, 'add_custom_field', [projectCode, fieldName, parentField, fieldType, extraOptions]);
}

export function getProjectJson(request: APIRequestContext,
                               projectCode: string) {
  return testControl(request, 'get_project_json', [projectCode]);
}

export function changePassword(request: APIRequestContext, username: string, password: string) {
  return testControl(request, 'change_password', [username, password]);
}

export function addLexEntry(request: APIRequestContext, projectCode: string, data: any) {
  if (data.id == null) data.id = '';
  return testControl(request, 'add_lexical_entry', [projectCode, data]) as Promise<string>;
}
