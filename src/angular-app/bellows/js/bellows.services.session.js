'use strict';

angular.module('bellows.services')
  .service('sessionService', ['jsonRpc', '$window', function(jsonRpc, $window) {
    var privateData = angular.copy($window.session);

    this.currentUserId = function() {
      return $window.session.userId;
    };

    this.fileSizeMax = function() {
      return $window.session.fileSizeMax;
    };

    this.baseSite = function() {
      return $window.session.baseSite;
    };

    this.domain = {
      ANY:       function() { return 1000;},
      USERS:     function() { return 1100;},
      PROJECTS:  function() { return 1200;},
      TEXTS:     function() { return 1300;},
      QUESTIONS: function() { return 1400;},
      ANSWERS:   function() { return 1500;},
      COMMENTS:  function() { return 1600;},
      TEMPLATES: function() { return 1700;},
      TAGS:      function() { return 1800;},
      ENTRIES:   function() { return 1900;}
    };
    this.operation = {
      CREATE:       function() { return 1;},
      EDIT:         function() { return 2;},
      DELETE:       function() { return 3;},
      LOCK:         function() { return 4;},
      VIEW:         function() { return 5;},
      VIEW_OWN:     function() { return 6;},
      EDIT_OWN:     function() { return 7;},
      DELETE_OWN:   function() { return 8;},
      ARCHIVE:      function() { return 9;},
      ARCHIVE_OWN:  function() { return 10;}
    };

    this.hasSiteRight = function(domain, operation) {
      return this.hasRight($window.session.userSiteRights, domain, operation);
    };

    this.hasProjectRight = function(domain, operation) {
      return this.hasRight($window.session.userProjectRights, domain, operation);
    };

    this.hasRight = function(rights, domain, operation) {
      if (rights) {
        var right = domain() + operation();
        return rights.indexOf(right) != -1;
      }
      return false;
    };

    this.getSetting = function(settings, key) {
      if (settings) {
        return settings[key];
      } else {
        return null; // Or undefined? Or false?
      }
    };
    this.getProjectSetting = function(key) {
      return this.getSetting($window.session.projectSettings, key);
    };

    this.session = $window.session;

    this.getCaptchaSrc = function(callback) {
      jsonRpc.call('get_captcha_src', [], callback);
    };

    this.refresh = function(callback) {
      var ref = this;
      jsonRpc.connect('/api/sf');
      jsonRpc.call('session_getSessionData', [], function(result) {
        ref.session = result.data;
        /*
         angular.forEach(result.data, function(value, key) {
         ref.session[key] = value;
         });
         */
        (callback || angular.noop)();
      });
    };

  }]);

