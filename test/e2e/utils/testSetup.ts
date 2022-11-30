import { testControl } from './jsonrpc';
import { copyFile } from 'fs/promises';
import { existsSync } from 'fs';
import * as path from 'path';
import { cwd } from 'process';
import { APIRequestContext, TestInfo } from '@playwright/test';
import { Project, toProjectCode } from './types';
import { UserDetails } from './fixtures';

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

export async function initTestProject(request: APIRequestContext,
                                code: string,
                                name: string,
                                ownerUsername: string,
                                memberUsernames: string[] = []): Promise<Project>
{
  const id = await testControl(request, 'init_test_project', [code, name, ownerUsername, memberUsernames]);
  return {name, code, id};
}

export async function initTestProjectForTest(
  request: APIRequestContext,
  testInfo: TestInfo,
  owner: UserDetails,
  members: UserDetails[] = []): Promise<Project> {
    // Make sure it's short enough to be a database name
    const name = `${testInfo.title.slice(0, 40)}`;
    const code = toProjectCode(name);
    return initTestProject(request, code, name, owner.username, members.map(member => member.username));
}

export function addWritingSystemToProject(request: APIRequestContext, project: Project, languageTag: string, abbr = '', name = '')
{
  return testControl(request, 'add_writing_system_to_project', [project.code, languageTag, abbr, name]);
}

// Name is addUser because that's what our PHP function is named, but it can also update roles of existing users
export function addUserToProject(request: APIRequestContext, project: Project, username: string, role?: string) {
  return testControl(request, 'add_user_to_project', [project.code, username, role]);
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

export async function addPictureFileToProject(request: APIRequestContext, project: Project, filename: string) {
  const destPath = await copyFileToSharedDir(filename);
  return testControl(request, 'add_picture_file_to_project', [project.code, destPath]);
}

export async function addAudioVisualFileToProject(request: APIRequestContext, project: Project, filename: string) {
  const destPath = await copyFileToSharedDir(filename);
  return testControl(request, 'add_audio_visual_file_to_project', [project.code, destPath]);
}

export function addCustomField(request: APIRequestContext,
  project: string | Project,
  fieldName: string,
  parentField: 'entry' | 'senses' | 'examples',
  fieldType: CustomFieldType = 'MultiString',
  extraOptions: any = null) {
return testControl(request, 'add_custom_field', [getCode(project), fieldName, parentField, fieldType, extraOptions]);
}

export function getProjectJson(request: APIRequestContext,
                               projectCode: string) {
  return testControl(request, 'get_project_json', [projectCode]);
}

export function changePassword(request: APIRequestContext, username: string, password: string) {
  return testControl(request, 'change_password', [username, password]);
}

export function addLexEntry(request: APIRequestContext, projectCode: string | Project, data: any) {
  if (data.id == null) data.id = '';
  return testControl(request, 'add_lexical_entry', [getCode(projectCode), data]) as Promise<string>;
}

function getCode(project: string | Project): string {
  return typeof project === 'object' ? project.code : project;
}
