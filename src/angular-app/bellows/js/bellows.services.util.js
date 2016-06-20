'use strict';

angular.module('bellows.services')
  .service('utilService', function() {
    this.uuid = function() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };

    this.getAvatarUrl = function(avatarRef) {
      return (avatarRef) ? '/Site/views/shared/image/avatar/' + avatarRef : '';
    };
  });
