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

    //noinspection JSUnusedGlobalSymbols
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
      var pendingMessageId;

      // Constants
      var syncStatusInterval = 3000; // ms
      var pollStatusInterval = 32000; // ms
      var cloneStatusInterval = 3000; // ms
      var unknownSRState = 'LF_CHECK';

      var status = undefined;
      var previousSRState = unknownSRState;
      if (angular.isDefined(projectSettings) &&
          angular.isDefined(projectSettings.sendReceive) &&
          angular.isDefined(projectSettings.sendReceive.status)) {
        status = projectSettings.sendReceive.status;
        previousSRState = status.SRState;
      }

      this.clearState = function clearState() {
        if (!status || angular.isUndefined(status)) {
          status = {};
        }

        status.SRState = unknownSRState;
        previousSRState = unknownSRState;
      };

      // SRState is CLONING / SYNCING
      this.isInProgress = function isInProgress() {
        return (_this.isSendReceiveProject() &&
          angular.isDefined(status) && angular.isDefined(status.SRState) &&
          (status.SRState == 'CLONING' || status.SRState == 'LF_CLONING' ||
          status.SRState == 'SYNCING'));
      };

      // S/R isInProgress(), SRState is unknown, or SRState is PENDING
      this.isStarted = function isStarted() {
        return _this.isInProgress() || (_this.isSendReceiveProject() && angular.isDefined(status) &&
          angular.isDefined(status.SRState) &&
          (status.SRState == unknownSRState || status.SRState == 'PENDING'));
      };

      this.isSendReceiveProject = function isSendReceiveProject() {
        return projectSettings.hasSendReceive;
      };

      this.setSyncProjectStatusSuccessCallback =
        function setSyncProjectStatusSuccessCallback(callback) {
          syncProjectStatusSuccessCallback = callback;
        };

      // Called after a lexicon project page is done loading
      this.checkInitialState = function checkInitialState() {
        if (_this.isSendReceiveProject()) {
          if (!status || angular.isUndefined(status)) {
            _this.clearState();
            getSyncProjectStatus();
            _this.startSyncStatusTimer();
          } else if (_this.isInProgress()) {
            _this.setSyncStarted();
          } else {
            if (status.SRState == unknownSRState) {
              _this.clearState();
            }

            _this.startPollStatusTimer();
          }
        }
      };

      this.setSyncStarted = function setSyncStarted() {
        notice.cancelProgressBar();

        // TODO: Remove this loading notice and display when we determine the real initial state
        notice.setLoading('If server available, synchronizing with LanguageDepot.org...');
        _this.startSyncStatusTimer();
      };

      this.setStateUnsynced = function setStateUnsynced() {
        if (_this.isSendReceiveProject()) {
          previousSRState = status.SRState;
          status.SRState = 'LF_UNSYNCED';
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

            previousSRState = status.SRState;
            status = result.data;

            if (status.PercentComplete > 0) {
              notice.setPercentComplete(status.PercentComplete);
            } else {
              notice.cancelProgressBar();
            }

            if (!_this.isInProgress()) {
              _this.startPollStatusTimer();
              notice.cancelLoading();
            }

            console.log(status);

            switch (status.SRState) {
              case 'PENDING' :
                pendingMessageId = notice.push(notice.INFO,
                  'Please wait while other projects are being synchronized. ' +
                  'You may continue to edit this project until it starts to synchronize.');
                break;
              case 'SYNCING' :
                notice.removeById(pendingMessageId);
                notice.setLoading('Synchronizing with LanguageDepot.org...');
                break;
              case 'HOLD' :
                notice.push(notice.ERROR, 'Well this is embarrassing. Something went ' +
                    'wrong and your project is now on hold. Contact an administrator.');
                break;
              case 'IDLE' :
                if (previousSRState == 'SYNCING') {
                  notice.push(notice.SUCCESS, 'The project was successfully synchronized.');
                }

                (syncProjectStatusSuccessCallback || angular.noop)();
                break;
            }
          }
        });
      }

      this.startSyncStatusTimer = function startSyncStatusTimer() {
        _this.cancelPollStatusTimer();
        _this.cancelCloneStatusTimer();
        if (angular.isDefined(syncStatusTimer)) return;

        syncStatusTimer = $interval(getSyncProjectStatus, syncStatusInterval);
      };

      this.cancelSyncStatusTimer = function cancelSyncStatusTimer() {
        if (angular.isDefined(syncStatusTimer)) {
          $interval.cancel(syncStatusTimer);
          syncStatusTimer = undefined;
        }
      };

      // UI strings corresponding to SRState in the LfMerge state file.
      // SRStates with an "LF_" prefix are languageforge overrides
      this.syncNotice = function syncNotice() {
        if (angular.isUndefined(status)) return;

        switch (status.SRState) {
          case 'CLONING':
          case 'LF_CLONING':
            return 'Creating initial data. This may take a few minutes...';
          case 'SYNCING':
            return 'Syncing...';
          case 'PENDING':
            return 'Pending';
          case 'IDLE':
          case 'SYNCED':
            return 'Synced';
          case 'LF_UNSYNCED':
            return 'Un-synced';
          case 'HOLD':
            return 'On hold';

          // Undefined initial state
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

            previousSRState = status.SRState;
            status = result.data;
            if (_this.isInProgress()) {
              (pollProjectStatusSuccessCallback || angular.noop)();
              _this.setSyncStarted();
            } else if (previousSRState == 'LF_UNSYNCED' && status.SRState == 'IDLE') {
              status.SRState = previousSRState;
            } else if (previousSRState == unknownSRState) {
              _this.clearState();
            }
          }
        });
      }

      this.startPollStatusTimer = function startPollStatusTimer() {
        _this.cancelSyncStatusTimer();
        _this.cancelCloneStatusTimer();
        if (angular.isDefined(pollStatusTimer)) return;

        pollStatusTimer = $interval(getPollProjectStatus, pollStatusInterval);
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

            status = result.data;
            console.log(status);
            if (status.SRState == 'IDLE' ||
              status.SRState == 'HOLD') {
              _this.cancelCloneStatusTimer();
              (cloneProjectStatusSuccessCallback || angular.noop)();
            }
          }
        });
      }

      this.startCloneStatusTimer = function startCloneStatusTimer() {
        _this.cancelPollStatusTimer();
        _this.cancelSyncStatusTimer();

        // Whether the true SRState is CLONING or PENDING, the user is going to have to wait for
        // CLONING anyways
        status.SRState = 'LF_CLONING';
        if (angular.isDefined(cloneStatusTimer)) return;

        cloneStatusTimer = $interval(getCloneProjectStatus, cloneStatusInterval);
      };

      this.cancelCloneStatusTimer = function cancelCloneStatusTimer() {
        if (angular.isDefined(cloneStatusTimer)) {
          $interval.cancel(cloneStatusTimer);
          cloneStatusTimer = undefined;
        }
      };

      // For now, we generate the same S/R string based on the SRState
      this.cloneNotice = this.syncNotice;

      this.cancelAllStatusTimers = function cancelAllStatusTimers() {
        _this.cancelSyncStatusTimer();
        _this.cancelPollStatusTimer();
        _this.cancelCloneStatusTimer();
      };

    }])

  ;
