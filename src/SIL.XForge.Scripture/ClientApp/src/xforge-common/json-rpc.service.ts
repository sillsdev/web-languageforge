import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { merge, uuid } from '@orbit/utils';

interface JsonRpcRequest {
  jsonrpc: '2.0';
  method: string;
  params: any;
  id?: string;
}

interface JsonRpcResponse<T> {
  jsonrpc: '2.0';
  result?: T;
  error?: JsonRpcError;
  id: string;
}

export class JsonRpcError {
  constructor(error: JsonRpcError) {
    merge(this, error);
  }

  code: number;
  message: string;
  data?: any;
}

/**
 * This service is used to invoke JSON-RPC methods.
 *
 * @example jsonRpcService.invoke('json-rpc/endpoint', 'method', { param1: 'value1', param2: 'value2' });
 */
@Injectable({
  providedIn: 'root'
})
export class JsonRpcService {
  constructor(private readonly http: HttpClient) {}

  async invoke<T>(url: string, method: string, params: any): Promise<T> {
    const request: JsonRpcRequest = {
      jsonrpc: '2.0',
      method,
      params,
      id: uuid()
    };
    const response = await this.http
      .post<JsonRpcResponse<T>>(url, request, { headers: { 'Content-Type': 'application/json' } })
      .toPromise();
    if (response.error != null) {
      throw new JsonRpcError(response.error);
    }
    return response.result;
  }
}
