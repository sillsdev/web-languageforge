import { ApiService, JsonRpcCallback } from './api.service';

export class FilterParams {
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  skip?: number;
  constructor() {
      // TODO: Set the default value to something practical
      this.limit = 1;
      this.skip = 0;
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
    console.log(this.unreadCount + ' - ' + count);
    this.unreadCount = count;
  }
}
