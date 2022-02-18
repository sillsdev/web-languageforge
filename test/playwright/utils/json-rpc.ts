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
  return { version: '2.0', method: 'session_getSessionData', params, id: nextId() };
}

export async function jsonRpc(request: APIRequestContext, method: string, orderedParams: any[] = [], params: any = {}) {
  const result = await request.post('/api/sf', { data: jsonRpcParams(method, orderedParams, params) });
  const json = await result.json();
  if (json.result) {
    return json.result;
  } else {
    throw json.error;
  }
}
