import type { APIRequestContext } from '@playwright/test';

const nextId = (() => {
  let id = 0;
  return () => {
    id = id + 1;
    return id;
  };
})();

export function jsonRpcParams(method: string, orderedParams: any[] = [], params: any = {}) {
  if (Object.prototype.hasOwnProperty.call(params, 'orderedParams')) {
    // Leave orderedParams alone
  } else {
    params.orderedParams = orderedParams;
  }
  return { version: '2.0', method, params, id: nextId() };
}

export async function jsonRpc(request: APIRequestContext, url: string, method: string, orderedParams: any[] = [], params: any = {}) {
  const result = await request.post(url, { data: jsonRpcParams(method, orderedParams, params) });
  const json = await result.json();
  if (json.result) {
    return json.result;
  } else {
    throw json.error;
  }
}

export function sf(request: APIRequestContext, method: string, orderedParams: any[] = [], params: any = {}) {
  return jsonRpc(request, '/api/sf', method, orderedParams, params);
}

export function testControl(request: APIRequestContext, method: string, orderedParams: any[] = [], params: any = {}) {
  return jsonRpc(request, '/api/testControl', method, orderedParams, params);
}
