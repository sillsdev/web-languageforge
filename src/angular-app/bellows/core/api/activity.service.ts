import { ApiService, JsonRpcCallback } from './api.service';

export class FilterParams {
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  skip?: number;
}

export class ActivityService {
  static $inject: string[] = ['apiService'];
  constructor(private api: ApiService) {}

  validActivityTypes(callback?: JsonRpcCallback) {
    return this.api.call('valid_activity_types_dto', [], callback);
  }

  listActivity(filterParams: FilterParams, callback?: JsonRpcCallback) {
    return this.api.call('activity_list_dto', [filterParams], callback);
  }

  listActivityForCurrentProject(filterParams: FilterParams, callback?: JsonRpcCallback) {
    return this.api.call('activity_list_dto_for_current_project', [filterParams], callback);
  }

  listActivityForLexicalEntry(entryId: string, filterParams: FilterParams, callback?: JsonRpcCallback) {
    return this.api.call('activity_list_dto_for_lexical_entry', [entryId, filterParams], callback);
  }
}
