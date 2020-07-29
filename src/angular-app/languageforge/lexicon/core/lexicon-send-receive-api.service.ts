import {ApiService, JsonRpcCallback} from '../../../bellows/core/api/api.service';

export { JsonRpcCallback, JsonRpcResult } from '../../../bellows/core/api/api.service';

export class LexiconSendReceiveApiService {
  static $inject: string[] = ['apiService'];
  constructor(private api: ApiService) { }

  getUserProjects(username: string, password: string, callback?: JsonRpcCallback<any>) {
    return this.api.call('sendReceive_getUserProjects', [username, password], callback);
  }

  receiveProject(callback?: JsonRpcCallback<any>) {
    return this.api.call('sendReceive_receiveProject', [], callback);
  }

  getProjectStatus(callback?: JsonRpcCallback<any>) {
    return this.api.call('sendReceive_getProjectStatus', [], callback);
  }

}
