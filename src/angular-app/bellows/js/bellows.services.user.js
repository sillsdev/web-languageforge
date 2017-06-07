'use strict';

angular.module('bellows.services')
  .service('userService', ['apiService', 'sessionService', function (api, ss) {

    this.read = api.method('user_read');
    this.readProfile = api.method('user_readProfile');
    this.ban = api.method('user_ban');
    this.update = api.method('user_update');
    this.updateProfile = api.method('user_updateProfile');
    this.remove = api.method('user_delete');
    this.createSimple = api.method('user_createSimple');
    this.list = api.method('user_list'); // TODO Paging CP 2013-07
    this.typeahead = api.method('user_typeahead');
    this.typeaheadExclusive = api.method('user_typeaheadExclusive')
    this.changePassword = api.method('change_password');
    this.resetPassword = api.method('reset_password');
    this.checkUniqueIdentity = api.method('check_unique_identity');
    this.activate = api.method('user_activate');
    this.create = api.method('user_create');
    this.register = api.method('user_register');
    this.readForRegistration = api.method('user_readForRegistration');
    this.updateFromRegistration = api.method('user_updateFromRegistration');
    this.sendInvite = api.method('user_sendInvite');

  }]);
