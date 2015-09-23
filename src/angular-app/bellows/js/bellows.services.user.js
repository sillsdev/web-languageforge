'use strict';

angular.module('bellows.services')
  .service('userService', ['jsonRpc', function(jsonRpc) {
    // Note this doesn't actually 'connect', it simply sets the connection url.
    jsonRpc.connect('/api/sf');
    this.read = function(id, callback) {
      jsonRpc.call('user_read', [id], callback);
    };

    this.readProfile = function(callback) {
      jsonRpc.call('user_readProfile', [], callback);
    };

    this.update = function(model, callback) {
      jsonRpc.call('user_update', [model], callback);
    };

    this.updateProfile = function(model, callback) {
      jsonRpc.call('user_updateProfile', [model], callback);
    };

    this.remove = function(userIds, callback) {
      jsonRpc.call('user_delete', [userIds], callback);
    };

    this.createSimple = function(userName, callback) {
      jsonRpc.call('user_createSimple', [userName], callback);
    };

    this.list = function(callback) {
      // TODO Paging CP 2013-07
      jsonRpc.call('user_list', [], callback);
    };

    this.typeahead = function(term, callback) {
      jsonRpc.call('user_typeahead', [term], callback);
    };

    this.typeaheadExclusive = function(term, projectIdToExclude, callback) {
      // projectIdToExclude's default value if not specified: '' (empty string)
      if (typeof callback === 'undefined') {
        // If called with just two parameters, this was typeahead(term, callback)
        callback = projectIdToExclude;
        projectIdToExclude = '';
      }

      jsonRpc.call('user_typeaheadExclusive', [term, projectIdToExclude], callback);
    };

    this.changePassword = function(userId, newPassword, callback) {
      jsonRpc.call('change_password', [userId, newPassword], callback);
    };

    this.resetPassword = function(resetPasswordKey, newPassword, callback) {
      jsonRpc.call('reset_password', [resetPasswordKey, newPassword], callback);
    };

    this.identityCheck = function(username, email, callback) {
      jsonRpc.call('identity_check', [username, email], callback);
    };

    this.checkUniqueIdentity = function(userId, updatedUsername, updatedEmail, callback) {
      jsonRpc.call('check_unique_identity', [userId, updatedUsername, updatedEmail], callback);
    };

    this.activate = function(username, password, email, callback) {
      jsonRpc.call('user_activate', [username, password, email], callback);
    };

    this.create = function(model, callback) {
      jsonRpc.call('user_create', [model], callback);
    };

    this.register = function(model, callback) {
      jsonRpc.call('user_register', [model], callback);
    };

    this.readForRegistration = function(validationKey, callback) {
      jsonRpc.call('user_readForRegistration', [validationKey], callback);
    };

    this.updateFromRegistration = function(validationKey, model, callback) {
      jsonRpc.call('user_updateFromRegistration', [validationKey, model], callback);
    };

    this.sendInvite = function(toEmail, callback) {
      jsonRpc.call('user_sendInvite', [toEmail], callback);
    };

  },]);
