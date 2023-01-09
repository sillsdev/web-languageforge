import type { APIRequestContext } from '@playwright/test';
import { TestFile } from './path-utils';

type Param = string | string[] | object;

let _id = 1;

function jsonRpcParams(method: string, orderedParams: Param[] = [], params: any = {}) {
  if (Object.prototype.hasOwnProperty.call(params, 'orderedParams')) {
    // Leave orderedParams alone
  } else {
    params.orderedParams = orderedParams;
  }
  return { version: '2.0', method, params, id: _id++ };
}

async function jsonRpc(request: APIRequestContext, url: string, method: string, orderedParams: Param[] = [], params: any = {}): Promise<any> {
  const result = await request.post(url, {
    data: jsonRpcParams(method, orderedParams, params),
    // If debugging API calls, uncomment the next line so your debug session won't time out
    // timeout: 0,
  });
  try {
    const json = await result.json();
    if (json.result) {
      return json.result;
    } else {
      throw json.error;
    }
  } catch (error) {
    console.error(await result.text());
    throw error;
  }
}

export interface TestControlService {
  (method: 'add_picture_file_to_project' | 'add_audio_visual_file_to_project', orderedParams: [string, TestFile]): Promise<any>;
  (method: 'add_writing_system_to_project' | 'create_user', orderedParams: [string, string, string, string]): Promise<any>;
  (method: 'add_user_to_project', orderedParams: [string, string, string]): Promise<any>;
  (method: 'add_lexical_entry', orderedParams: [string, object]): Promise<any>;
  (method: 'init_test_project', orderedParams: [string, string, string, string[]]): Promise<any>;
  (method: 'get_reset_password_key' | 'expire_and_get_reset_password_key', orderedParams: [string]): Promise<any>;
}

export const getTestControl = (request: APIRequestContext): TestControlService =>
  (method: string, orderedParams: Param[], params: any = {}) =>
    jsonRpc(request, '/api/testControl', method, orderedParams, params);
