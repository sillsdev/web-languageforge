import { ApiService, JsonRpcCallback } from './api.service';

export class ActivityService {
  static $inject: string[] = ['apiService'];
  constructor(private api: ApiService) {}

  listActivity(callback?: JsonRpcCallback) {
    return this.api.call('activity_list_dto', [], callback);
  }

  listActivityForCurrentProject(callback?: JsonRpcCallback) {
    return this.api.call('activity_list_dto_for_current_project', [], callback);
  }

  listActivityForLexicalEntry(entryId: string, callback?: JsonRpcCallback) {
    return this.api.call('activity_list_dto_for_lexical_entry', [entryId], callback);
  }
}
