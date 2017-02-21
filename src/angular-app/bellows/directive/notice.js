'use strict';

angular.module('palaso.ui.notice', ['ui.bootstrap', 'bellows.services', 'ngAnimate', 'ngSanitize'])
  .factory('silNoticeService', ['$interval', 'utilService', function ($interval, util) {
    var notices = [];
    var timers = {};
    var percentComplete = 0;
    var showProgressBar = false;
    var isLoading = false;
    var loadingMessage;

    var getIndexById = function (id) {
      for (var i = 0; i < notices.length; i++) {
        if (notices[i].id == id) {
          return i;
        }
      }
    };

    return {
      push: function (type, message, details, cannotClose) {
        var id = util.uuid();
        if (type() == this.SUCCESS()) {
          // success alert messages will auto-close after 10 seconds
          timers[id] = $interval(function () {this.removeById(id);}.bind(this), 4 * 1000, 1);
        }

        var obj = {
          type: type(),
          message: message,
          id: id,
          details: details,
          showDetails: false,
          toggleDetails: function () {this.showDetails = !this.showDetails;}
        };

        if (details) {
          details = details.replace(/<p>/gm, '\n');
          details = details.replace(/<pre>/gm, '\n');
          details = details.replace(/<\/p>/gm, '\n');
          details = details.replace(/<\/pre>/gm, '\n');
          details = details.replace(/<[^>]+>/gm, ''); // remove HTML
          details = details.replace(/\\\//g, '/');
          obj.details = details;
        }

        if (cannotClose) {
          obj.cannotClose = true;
        }

        notices.push(obj);
        return id;
      },

      removeById: function (id) {
        this.remove(getIndexById(id));
        if (id in timers) {
          $interval.cancel(timers[id]);
        }
      },

      remove: function (index) {
        if (!angular.isUndefined(index)) {
          notices.splice(index, 1);
        }
      },

      get: function () {
        return notices;
      },

      getLoadingMessage: function () {
        return loadingMessage;
      },

      setLoading: function (message) {
        loadingMessage = message;
        isLoading = true;
      },

      getPercentComplete: function () {
        return percentComplete;
      },

      setPercentComplete: function (percent) {
        percentComplete = percent;
        showProgressBar = true;
      },

      cancelProgressBar: function () {
        showProgressBar = false;
      },

      showProgressBar: function () {
        return showProgressBar;
      },

      cancelLoading: function () {
        loadingMessage = '';
        isLoading = false;
      },

      isLoading: function () {
        return isLoading;
      },

      /** @return {string} */
      ERROR:   function () { return (bootstrapVersion == 'bootstrap4' ? 'danger' : 'error'); },

      /** @return {string} */
      WARN:    function () { return (bootstrapVersion == 'bootstrap4' ? 'warning' : 'warn'); },

      /** @return {string} */
      INFO:    function () { return 'info'; },

      /** @return {string} */
      SUCCESS: function () { return 'success'; }
    };
  }])
  .directive('silNotices', ['silNoticeService', 'sessionService',
  function (noticeService, sessionService) {
    return {
      restrict: 'EA',
      templateUrl : '/angular-app/bellows/directive/' + bootstrapVersion + '/notice.html',
      replace: true,
      compile: function () {
        return function ($scope) {
          $scope.githubRepo = 'web-scriptureforge';
          if (sessionService.baseSite() === 'languageforge') {
            $scope.githubRepo = 'web-languageforge';
          }

          $scope.closeNotice = function (id) {
            noticeService.removeById(id);
          };

          $scope.notices = function () {
            return noticeService.get();
          };

          $scope.getLoadingMessage = noticeService.getLoadingMessage;
          $scope.isLoading = noticeService.isLoading;
          $scope.showProgressBar = noticeService.showProgressBar;
          $scope.getPercentComplete = noticeService.getPercentComplete;
        };
      }
    };
  }]);
