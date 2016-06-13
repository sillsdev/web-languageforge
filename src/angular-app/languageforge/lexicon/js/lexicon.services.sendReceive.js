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
      var cloneProjectStatusSuccessCallback = angular.noop;
      var syncStatusTimer;
      var cloneStatusTimer;

      this.status = undefined;

      this.clearState = function clearState() {
        if (angular.isUndefined(_this.status)) {
          _this.status = {};
        }

        _this.status.SRState = '';
      };

      this.isSyncing = function isSyncing() {
        return (_this.isSendReceiveProject &&
          angular.isDefined(_this.status) && angular.isDefined(_this.status.SRState) &&
          _this.status.SRState != 'IDLE' && _this.status.SRState != '' &&
          _this.status.SRState != 'HOLD'
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
        if (!_this.status) {
          _this.clearState();
          _this.getSyncProjectStatus();
          _this.startSyncStatusTimer();
        } else if (_this.status.SRState == 'IDLE') {
          _this.clearState();
        } else if (_this.status.SRState != 'HOLD') {
          _this.getSyncProjectStatus();
          _this.startSyncStatusTimer();
        }
      };

      this.setSyncStarted = function setSyncStarted() {
        notice.cancelProgressBar();
        notice.setLoading('Syncing with LanguageDepot.org...');
        _this.status.SRState = 'syncing';
        _this.startSyncStatusTimer();
      };

      this.setStateUnsyned = function setStateUnsyned() {
        _this.status.SRState = 'unsynced';

      };

      this.getSyncProjectStatus = function getSyncProjectStatus() {
        sendReceiveApi.getProjectStatus(function (result) {
          if (result.ok) {
            if (!result.data) {
              _this.clearState();
              _this.cancelSyncStatusTimer();
              notice.cancelLoading();
              return;
            }

            var isInitialCheck = (_this.status.SRState == '');
            notice.cancelProgressBar();
            notice.setLoading('Syncing with LanguageDepot.org...');
            _this.status = result.data;
            if (!_this.isSyncing()) {
              _this.cancelSyncStatusTimer();
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
              }

              (syncProjectStatusSuccessCallback || angular.noop)();
            }
          }
        });
      };

      this.startSyncStatusTimer = function startSyncStatusTimer() {
        if (angular.isDefined(syncStatusTimer)) return;

        syncStatusTimer = $interval(_this.getSyncProjectStatus, 3000);
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

      this.setCloneProjectStatusSuccessCallback =
        function setCloneProjectStatusSuccessCallback(callback) {
          cloneProjectStatusSuccessCallback = callback;
        };

      this.getCloneProjectStatus = function getCloneProjectStatus() {
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
      };

      this.startCloneStatusTimer = function startCloneStatusTimer() {
        if (angular.isDefined(cloneStatusTimer)) return;

        cloneStatusTimer = $interval(getCloneProjectStatus, 3000);
      };

      this.cancelCloneStatusTimer = function cancelCloneStatusTimer() {
        _this.clearState();
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

    }])

  ;
