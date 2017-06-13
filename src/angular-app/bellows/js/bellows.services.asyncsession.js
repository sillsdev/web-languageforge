'use strict';

angular.module('bellows.services')
.service('asyncSession', ['apiService', '$window', '$q', function (api, $window, $q) {
  // Because session data is asynchronously loaded, it is not possible to synchronously
  // obtain a reference to the session instance. getSession() must be called, which returns
  // a promise (callbacks also accepted) that resolves to the session instance, which can
  // then be used synchronously.

  var projectId = window.location.pathname.match(/^\/app\/[a-z]+\/([a-z0-9]{24,})$/i);
  projectId = projectId == null ? undefined : projectId[1];

  this.projectId = function () {
    return projectId;
  };

  function fn(val) {
    return function() {
      return val;
    }
  }

  var domain = {
    ANY:       fn(1000),
    USERS:     fn(1100),
    PROJECTS:  fn(1200),
    TEXTS:     fn(1300),
    QUESTIONS: fn(1400),
    ANSWERS:   fn(1500),
    COMMENTS:  fn(1600),
    TEMPLATES: fn(1700),
    TAGS:      fn(1800),
    ENTRIES:   fn(1900)
  };
  var operation = {
    CREATE:       fn(1),
    EDIT:         fn(2),
    DELETE:       fn(3),
    LOCK:         fn(4),
    VIEW:         fn(5),
    VIEW_OWN:     fn(6),
    EDIT_OWN:     fn(7),
    DELETE_OWN:   fn(8),
    ARCHIVE:      fn(9)
  };

  this.domain = domain;
  this.operation = operation;

  var getCaptchaData = api.method('get_captcha_data');
  this.getCaptchaData = getCaptchaData;

  var sessionData;

  // session instance (singleton) that references the data
  var Session = new (function () {
    // Helper function
    function fnFor(key) {
      return function() {
        return sessionData[key];
      }
    }

    this.currentUserId = fnFor('userId');
    this.fileSizeMax = fnFor('fileSizeMax');
    this.baseSite = fnFor('baseSite');
    this.projectSettings = fnFor('projectSettings');
    this.project = fnFor('project');

    // TODO Is it really necessary to have these on the instance as well?
    this.domain = domain;
    this.operation = operation;

    this.hasSiteRight = function (domain, operation) {
      return this.hasRight(sessionData.userSiteRights, domain, operation);
    };

    this.hasProjectRight = function (domain, operation) {
      return this.hasRight(sessionData.userProjectRights, domain, operation);
    };

    this.hasRight = function (rights, domain, operation) {
      var right = domain() + operation();
      return rights.indexOf(right) != -1;
    };

    this.getProjectSetting = function (setting) {
      return sessionData.projectSettings[setting];
    }

    this.getCaptchaData = getCaptchaData;

  })();

  // forceRefresh and callback are both optional (a Promise is returned)
  // Can be called as (boolean, function), (boolean), (function), or ()
  this.getSession = function(forceRefresh, callback) {
    // handle the one edge case (called as getSession(function))
    if(typeof forceRefresh === 'function') {
      callback = forceRefresh;
      forceRefresh = false;
    }
    callback = callback || angular.noop;

    if(sessionData && !forceRefresh) {
      callback(Session);
      return $q.when(Session); // Wrap Session in a promise
    }

    return fetchSessionData(forceRefresh).then(function(data) {
      sessionData = data;
      callback(Session);
      return Session;
    });
  };

  var promiseForSession;
  function fetchSessionData(forceRefresh) {
    if(promiseForSession && !forceRefresh) return promiseForSession;

    var promise = api.call('session_getSessionData').then(function(response) {
      return response.data;
    }).catch(function(response) {
      console.error(response); // TODO decide whether to show to user or just retry
      return fetchSessionData(forceRefresh); // retry
    });

    if(!promiseForSession) promiseForSession = promise;
    return promise;
  }

}]);

