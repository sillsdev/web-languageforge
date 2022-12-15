import { testControl } from './jsonrpc';
import { APIRequestContext, TestInfo } from '@playwright/test';
import { Project, toProjectCode } from './types';
import { UserDetails } from './fixtures';
import { TestFile, serverTestFilePath } from './path-utils';

type CustomFieldType =
  'MultiString' |
  'ReferenceAtom' |
  'ReferenceCollection' |
  'OwningAtom'
  // TODO: Add more (look at LfMerge custom field code to find out what they can be)
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

export async function addPictureFileToProject(request: APIRequestContext, project: Project, filename: TestFile) {
  const filePath = serverTestFilePath(filename);
  return testControl(request, 'add_picture_file_to_project', [project.code, filePath]);
}

export async function addAudioVisualFileToProject(request: APIRequestContext, project: Project, filename: TestFile) {
  const filePath = serverTestFilePath(filename);
  return testControl(request, 'add_audio_visual_file_to_project', [project.code, filePath]);
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
