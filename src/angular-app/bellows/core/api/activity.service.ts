import { ApiService, JsonRpcCallback } from './api.service';

export class FilterParams {
  startDate: Date = null;
  endDate: Date = null;
  limit: number = 100;
  skip: number = 0;
}

export class ActivityService {
  refreshRequired: boolean = false;
  unreadCount: number;

  static $inject: string[] = ['apiService'];
  constructor(private api: ApiService) {}

  validActivityTypes(callback?: JsonRpcCallback<any>) {
    return this.api.call('valid_activity_types_dto', [], callback);
  }

  listActivity(filterParams: FilterParams, callback?: JsonRpcCallback<any>) {
    return this.api.call('activity_list_dto', [filterParams], callback);
  }

  listActivityForCurrentProject(filterParams: FilterParams, callback?: JsonRpcCallback<any>) {
    return this.api.call('activity_list_dto_for_current_project', [filterParams], callback);
  }

  listActivityForLexicalEntry(entryId: string, filterParams: FilterParams, callback?: JsonRpcCallback<any>) {
    return this.api.call('activity_list_dto_for_lexical_entry', [entryId, filterParams], callback);
  }

  setUnreadCount(count: number) {
    this.unreadCount = count;
  }

  markRefreshRequired(required: boolean = true) {
    this.refreshRequired = required;
  }
}
