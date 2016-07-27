'use strict';

angular.module('lexicon.services')
  .service('lexSendReceiveApi', ['jsonRpc', function (jsonRpc) {
    jsonRpc.connect('/api/sf');

    this.getUserProjects = function getUserProjects(username, password, callback) {
      jsonRpc.call('sendReceive_getUserProjects', [username, password], callback);
    };

    this.updateSRProject = function updateSRProject(srProject, callback) {
      jsonRpc.call('sendReceive_updateSRProject', [srProject], callback);
    };

    this.receiveProject = function receiveProject(callback) {
      jsonRpc.call('sendReceive_receiveProject', [], callback);
    };

    this.commitProject = function commitProject(callback) {
      jsonRpc.call('sendReceive_commitProject', [], callback);
    };

    this.getProjectStatus = function getProjectStatus(callback) {
      jsonRpc.call('sendReceive_getProjectStatus', [], callback);
    };
  }])
  .service('lexSendReceive', ['sessionService', 'silNoticeService', 'lexSendReceiveApi',
    '$interval',
    function (sessionService, notice, sendReceiveApi, $interval) {
      var _this = this;
      var projectSettings = sessionService.session.projectSettings;
      var syncProjectStatusSuccessCallback = angular.noop;
      var pollProjectStatusSuccessCallback = angular.noop;
      var cloneProjectStatusSuccessCallback = angular.noop;
      var syncStatusTimer;
      var pollStatusTimer;
      var cloneStatusTimer;

      this.status = undefined;
      if (angular.isDefined(projectSettings) &&
          angular.isDefined(projectSettings.sendReceive) &&
          angular.isDefined(projectSettings.sendReceive.status)) {
        this.status = projectSettings.sendReceive.status;
      }

      this.clearState = function clearState() {
        if (!_this.status || angular.isUndefined(_this.status)) {
          _this.status = {};
        }

        _this.status.SRState = '';
      };

      this.isInProgress = function isInProgress() {
        return (_this.isSendReceiveProject &&
          angular.isDefined(_this.status) && angular.isDefined(_this.status.SRState) &&
          _this.status.SRState != 'IDLE' && _this.status.SRState != '' &&
          _this.status.SRState != 'HOLD' && _this.status.SRState != 'unsynced'
        );
      };

      this.isSendReceiveProject = function isSendReceiveProject() {
        return projectSettings.hasSendReceive;
      };

      this.setSyncProjectStatusSuccessCallback =
        function setSyncProjectStatusSuccessCallback(callback) {
          syncProjectStatusSuccessCallback = callback;
        };

      this.checkInitialState = function checkInitialState() {
        if (_this.isSendReceiveProject()) {
          if (!_this.status || angular.isUndefined(_this.status)) {
            _this.clearState();
            getSyncProjectStatus();
            _this.startSyncStatusTimer();
          } else if (_this.isInProgress()) {
            _this.setSyncStarted();
          } else {
            _this.clearState();
            _this.startPollStatusTimer();
          }
        }
      };

      this.setSyncStarted = function setSyncStarted() {
        notice.cancelProgressBar();
        notice.setLoading('Syncing with LanguageDepot.org...');
        _this.status.SRState = 'syncing';
        _this.startSyncStatusTimer();
      };

      this.setStateUnsyned = function setStateUnsyned() {
        if (_this.isSendReceiveProject()) {
          _this.status.SRState = 'unsynced';
        }
      };

      function getSyncProjectStatus() {
        sendReceiveApi.getProjectStatus(function (result) {
          if (result.ok) {
            if (!result.data) {
              _this.clearState();
              _this.startPollStatusTimer();
              notice.cancelLoading();
              return;
            }

            var isInitialCheck = (_this.status.SRState == '');
            notice.cancelProgressBar();
            notice.setLoading('Syncing with LanguageDepot.org...');
            _this.status = result.data;
            if (!_this.isInProgress()) {
              _this.startPollStatusTimer();
              notice.cancelLoading();
            }

            console.log(_this.status);

            if (_this.status.SRState == 'HOLD') {
              notice.push(notice.ERROR, 'Well this is embarrassing. Something went ' +
                'wrong and your project is now on hold. Contact an administrator.');
            }

            if (_this.status.SRState == 'IDLE') {
              if (!isInitialCheck) {
                notice.push(notice.SUCCESS, 'The project was successfully synchronized.');
              } else {
                _this.clearState();
              }

              (syncProjectStatusSuccessCallback || angular.noop)();
            }
          }
        });
      }

      this.startSyncStatusTimer = function startSyncStatusTimer() {
        _this.cancelPollStatusTimer();
        _this.cancelCloneStatusTimer();
        if (angular.isDefined(syncStatusTimer)) return;

        syncStatusTimer = $interval(getSyncProjectStatus, 3000);
      };

      this.cancelSyncStatusTimer = function cancelSyncStatusTimer() {
        if (angular.isDefined(syncStatusTimer)) {
          $interval.cancel(syncStatusTimer);
          syncStatusTimer = undefined;
        }
      };

      this.syncNotice = function syncNotice() {
        if (angular.isUndefined(_this.status)) return;

        switch (_this.status.SRState) {
          case 'CLONING':
            return 'Creating initial data...';
          case 'SYNCING':
          case 'syncing':
            return 'Syncing...';
          case 'IDLE':
          case 'synced':
            return 'Synced';
          case 'unsynced':
            return 'Un-synced';
          case 'HOLD':
            return 'On hold';
          default:
            return '';
        }
      };

      this.setPollProjectStatusSuccessCallback =
        function setPollProjectStatusSuccessCallback(callback) {
          pollProjectStatusSuccessCallback = callback;
        };

      function getPollProjectStatus() {
        sendReceiveApi.getProjectStatus(function (result) {
          if (result.ok) {
            if (!result.data) {
              _this.clearState();
              return;
            }

            var stateWasClear = (_this.status.SRState == '');
            _this.status = result.data;
            if (_this.isInProgress()) {
              (pollProjectStatusSuccessCallback || angular.noop)();
              _this.setSyncStarted();
            } else {
              stateWasClear && _this.clearState();
            }
          }
        });
      }

      this.startPollStatusTimer = function startPollStatusTimer() {
        _this.cancelSyncStatusTimer();
        _this.cancelCloneStatusTimer();
        if (angular.isDefined(pollStatusTimer)) return;

        pollStatusTimer = $interval(getPollProjectStatus, 32000);
      };

      this.cancelPollStatusTimer = function cancelPollStatusTimer() {
        if (angular.isDefined(pollStatusTimer)) {
          $interval.cancel(pollStatusTimer);
          pollStatusTimer = undefined;
        }
      };

      this.setCloneProjectStatusSuccessCallback =
        function setCloneProjectStatusSuccessCallback(callback) {
          cloneProjectStatusSuccessCallback = callback;
        };

      function getCloneProjectStatus() {
        sendReceiveApi.getProjectStatus(function (result) {
          if (result.ok) {
            if (!result.data) {
              _this.clearState();
              _this.cancelCloneStatusTimer();
              return;
            }

            _this.status = result.data;
            console.log(_this.status);
            if (_this.status.SRState == 'IDLE' ||
              _this.status.SRState == 'HOLD') {
              _this.cancelCloneStatusTimer();
              (cloneProjectStatusSuccessCallback || angular.noop)();
            }
          }
        });
      }

      this.startCloneStatusTimer = function startCloneStatusTimer() {
        _this.cancelPollStatusTimer();
        _this.cancelSyncStatusTimer();
        _this.status.SRState = 'cloning';
        if (angular.isDefined(cloneStatusTimer)) return;

        cloneStatusTimer = $interval(getCloneProjectStatus, 3000);
      };

      this.cancelCloneStatusTimer = function cancelCloneStatusTimer() {
        if (angular.isDefined(cloneStatusTimer)) {
          $interval.cancel(cloneStatusTimer);
          cloneStatusTimer = undefined;
        }
      };

      this.cloneNotice = function cloneNotice() {
        if (angular.isUndefined(_this.status)) return;
        switch (_this.status.SRState) {
          case 'CLONING':
            return 'Creating initial data...';
          case 'SYNCING':
            return 'Syncing...';
          case 'IDLE':
            return 'Synced';
          case 'HOLD':
            return 'On hold';
          default:
            return '';
        }
      };

      this.cancelAllStatusTimers = function cancelAllStatusTimers() {
        _this.cancelSyncStatusTimer();
        _this.cancelPollStatusTimer();
        _this.cancelCloneStatusTimer();
      };

    }])

  ;
