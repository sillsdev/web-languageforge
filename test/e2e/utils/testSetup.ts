import { testControl } from './jsonrpc';
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

export function addCustomField(request: APIRequestContext,
                               projectCode: string,
                               fieldName: string,
                               fieldType: CustomFieldType = 'MultiString') {
  return testControl(request, 'add_custom_field', [projectCode, fieldName, fieldType]);
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
  return testControl(request, 'add_lexical_entry', [projectCode, data]);
}
