import { ApiService, JsonRpcCallback } from './api.service';

export class FilterParams {
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  skip?: number;
  constructor() {
      this.limit = 100;
      this.skip = 0;
      this.startDate = null;
      this.endDate = null;
  }
}

export class ActivityService {
  unreadCount: number;
  static $inject: string[] = ['apiService'];
  constructor(private api: ApiService) {}

  listActivity(filterParams: FilterParams, callback?: JsonRpcCallback) {
    return this.api.call('activity_list_dto', [filterParams], callback);
  }

  listActivityForCurrentProject(filterParams: FilterParams, callback?: JsonRpcCallback) {
    return this.api.call('activity_list_dto_for_current_project', [filterParams], callback);
  }

  listActivityForLexicalEntry(entryId: string, filterParams: FilterParams, callback?: JsonRpcCallback) {
    return this.api.call('activity_list_dto_for_lexical_entry', [entryId, filterParams], callback);
  }

  setUnreadCount(count: number) {
    this.unreadCount = count;
  }
}
