import { ApiService, JsonRpcCallback } from './api.service';

export class UserService {
  static $inject: string[] = ['apiService'];
  constructor(private api: ApiService) {}

  read(userId: string, callback?: JsonRpcCallback) {
    return this.api.call('user_read', [userId], callback);
  }

  readProfile(callback?: JsonRpcCallback) {
    return this.api.call('user_readProfile', [], callback);
  }

  ban(userId: string, callback?: JsonRpcCallback) {
    return this.api.call('user_ban', [userId], callback);
  }

  update(params: any, callback?: JsonRpcCallback) {
    return this.api.call('user_update', [params], callback);
  }

  updateProfile(params: any, callback?: JsonRpcCallback) {
    return this.api.call('user_updateProfile', [params], callback);
  }

  remove(userIds: string[], callback?: JsonRpcCallback) {
    return this.api.call('user_delete', [userIds], callback);
  }

  createSimple(username: string, callback?: JsonRpcCallback) {
    return this.api.call('user_createSimple', [username], callback);
  }

  list(callback?: JsonRpcCallback) {
    // TODO Paging CP 2013-07
    return this.api.call('user_list', [], callback);
  }

  typeahead(term: string, projectIdToExclude: string = '', callback?: JsonRpcCallback) {
    return this.api.call('user_typeahead', [term, projectIdToExclude], callback);
  }

  typeaheadExclusive(term: string, projectIdToExclude: string = '', callback?: JsonRpcCallback) {
    return this.api.call('user_typeaheadExclusive', [term, projectIdToExclude], callback);
  }

  changePassword(userId: string, newPassword: string, callback?: JsonRpcCallback) {
    return this.api.call('change_password', [userId, newPassword], callback);
  }

  resetPassword(resetPasswordKey: string, newPassword: string, callback?: JsonRpcCallback) {
    return this.api.call('reset_password', [resetPasswordKey, newPassword], callback);
  }

  checkUniqueIdentity(userId: string, updatedUsername: string, updatedEmail: string, callback?: JsonRpcCallback) {
    return this.api.call('check_unique_identity', [userId, updatedUsername, updatedEmail], callback);
  }

  calculateUsername(usernameBase: string) {
    return this.api.call('user_calculate_username', [usernameBase]);
  }

  register(params: any, callback?: JsonRpcCallback) {
    return this.api.call('user_register', [params], callback);
  }

  registerOAuthUser(params: any, callback?: JsonRpcCallback) {
    return this.api.call('user_register_oauth', [params], callback);
  }

  create(params: any, callback?: JsonRpcCallback) {
    return this.api.call('user_create', [params], callback);
  }

  sendInvite(toEmail: string, callback?: JsonRpcCallback) {
    return this.api.call('user_sendInvite', [toEmail], callback);
  }
}
