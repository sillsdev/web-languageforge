'use strict';

angular.module('bellows.services')
  .service('sessionService', ['jsonRpc', '$window', function (jsonRpc, $window) {

    this.currentUserId = function () {
      return $window.session.userId;
    };

    this.fileSizeMax = function () {
      return $window.session.fileSizeMax;
    };

    this.baseSite = function () {
      return $window.session.baseSite;
    };

    this.domain = {
      /** @return {number} */
      ANY:       function () { return 1000;},

      /** @return {number} */
      USERS:     function () { return 1100;},

      /** @return {number} */
      PROJECTS:  function () { return 1200;},

      /** @return {number} */
      TEXTS:     function () { return 1300;},

      /** @return {number} */
      QUESTIONS: function () { return 1400;},

      /** @return {number} */
      ANSWERS:   function () { return 1500;},

      /** @return {number} */
      COMMENTS:  function () { return 1600;},

      /** @return {number} */
      TEMPLATES: function () { return 1700;},

      /** @return {number} */
      TAGS:      function () { return 1800;},

      /** @return {number} */
      ENTRIES:   function () { return 1900;}
    };
    this.operation = {
      /** @return {number} */
      CREATE:       function () { return 1;},

      /** @return {number} */
      EDIT:         function () { return 2;},

      /** @return {number} */
      DELETE:       function () { return 3;},

      /** @return {number} */
      LOCK:         function () { return 4;},

      /** @return {number} */
      VIEW:         function () { return 5;},

      /** @return {number} */
      VIEW_OWN:     function () { return 6;},

      /** @return {number} */
      EDIT_OWN:     function () { return 7;},

      /** @return {number} */
      DELETE_OWN:   function () { return 8;},

      /** @return {number} */
      ARCHIVE:      function () { return 9;}
    };

    this.hasSiteRight = function (domain, operation) {
      return this.hasRight($window.session.userSiteRights, domain, operation);
    };

    this.hasProjectRight = function (domain, operation) {
      return this.hasRight($window.session.userProjectRights, domain, operation);
    };

    this.hasRight = function (rights, domain, operation) {
      if (rights) {
        var right = domain() + operation();
        return rights.indexOf(right) != -1;
      }

      return false;
    };

    this.getSetting = function (settings, key) {
      if (settings) {
        return settings[key];
      } else {
        return null; // Or undefined? Or false?
      }
    };

    this.getProjectSetting = function (key) {
      return this.getSetting($window.session.projectSettings, key);
    };

    this.session = $window.session;

    this.getCaptchaData = function (callback) {
      jsonRpc.call('get_captcha_data', [], callback);
    };

    this.getProjectId = function getProjectId() {
      if (angular.isDefined(this.session.project) &&
        angular.isDefined(this.session.project.id)
      ) {
        return this.session.project.id;
      }

      return '';
    };

    this.refresh = function refresh(callback) {
      jsonRpc.connect('/api/sf');
      jsonRpc.call('session_getSessionData', [], function (result) {
        this.session = result.data;
        /*
         angular.forEach(result.data, function(value, key) {
         ref.session[key] = value;
         });
         */
        (callback || angular.noop)();
      }.bind(this));
    };

  }]);

