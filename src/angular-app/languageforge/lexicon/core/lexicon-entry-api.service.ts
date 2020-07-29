import { ApiService, JsonRpcCallback } from '../../../bellows/core/api/api.service';

export class LexiconEntryApiService {
  static $inject: string[] = ['apiService'];
  constructor(private api: ApiService) { }

  update(entryData: any, callback?: JsonRpcCallback<any>) {
    return this.api.call('lex_entry_update', [entryData], callback);
  }

  remove(entryId: string, callback?: JsonRpcCallback<any>) {
    return this.api.call('lex_entry_remove', [entryId], callback);
  }

  dbeDtoFull(browserId: string, offset: number, callback?: JsonRpcCallback<any>) {
    return this.api.call('lex_dbeDtoFull', [browserId, offset], callback);
  }

  dbeDtoUpdatesOnly(browserId: string, lastFetchTime: number, callback?: JsonRpcCallback<any>) {
    return this.api.call('lex_dbeDtoUpdatesOnly', [browserId, lastFetchTime], callback);
  }

}
