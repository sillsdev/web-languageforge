'use strict';

angular.module('lexicon.services')
  .service('lexSendReceiveApi', ['apiService', function (api) {

    this.getUserProjects = api.method('sendReceive_getUserProjects');
    this.updateSRProject = api.method('sendReceive_updateSRProject');
    this.receiveProject = api.method('sendReceive_receiveProject');
    //noinspection JSUnusedGlobalSymbols
    this.commitProject = api.method('sendReceive_commitProject');
    this.getProjectStatus = api.method('sendReceive_getProjectStatus');

  }])
  .service('lexSendReceive', ['sessionService', 'silNoticeService', 'lexSendReceiveApi',
    '$interval', 'lexEditorDataService', '$filter',
    function (sessionService, notice, sendReceiveApi, $interval, editorData, $filter) {
      const syncStatusInterval = 3000; // ms
      const pollUpdateInterval = 32000; // ms
      const cloneStatusInterval = 3000; // ms
      const unknownSRState = 'LF_CHECK';

      var status = undefined;
      var previousSRState = unknownSRState;
      var projectSettings = sessionService.session.projectSettings;
      var syncProjectStatusSuccessCallback = angular.noop;
      var pollUpdateSuccessCallback = angular.noop;
      var cloneProjectStatusSuccessCallback = angular.noop;
      var syncStatusTimer;
      var pollUpdateTimer;
      var cloneStatusTimer;
      var pendingMessageId;

      if (angular.isDefined(projectSettings) &&
        angular.isDefined(projectSettings.sendReceive) &&
        angular.isDefined(projectSettings.sendReceive.status)
      ) {
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

      // SRState is CLONING or SYNCING
      // logic should match PHP SendReceiveCommands::isInProgress
      this.isInProgress = function isInProgress() {
        return this.isSendReceiveProject() &&
          angular.isDefined(status) && angular.isDefined(status.SRState) &&
          (status.SRState === 'CLONING' || status.SRState === 'LF_CLONING' ||
          status.SRState === 'SYNCING');
      };

      // S/R isInProgress(), SRState is unknown, or SRState is PENDING
      this.isStarted = function isStarted() {
        return this.isInProgress() || (this.isSendReceiveProject() && angular.isDefined(status) &&
          angular.isDefined(status.SRState) &&
          (status.SRState === unknownSRState || status.SRState === 'PENDING'));
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
        if (this.isSendReceiveProject()) {
          if (!status || angular.isUndefined(status)) {
            this.clearState();
            getSyncProjectStatus();
            this.startSyncStatusTimer();
          } else if (this.isInProgress()) {
            this.setSyncStarted();
          } else {
            if (status.SRState === unknownSRState) {
              this.clearState();
            }

            this.startPollUpdateTimer();
          }
        } else {
          this.startPollUpdateTimer();
        }
      };

      this.setSyncStarted = function setSyncStarted() {
        notice.cancelProgressBar();

        // TODO: Remove this loading notice and display when we determine the real initial state
        notice.setLoading('If server available, synchronizing with LanguageDepot.org...');
        this.startSyncStatusTimer();
      };

      this.setStateUnsynced = function setStateUnsynced() {
        if (this.isSendReceiveProject()) {
          previousSRState = status.SRState;
          status.SRState = 'LF_UNSYNCED';
        }
      };

      var getSyncProjectStatus = function () {
        sendReceiveApi.getProjectStatus(function (result) {
          if (result.ok) {
            if (!result.data) {
              this.clearState();
              this.startPollUpdateTimer();
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

            if (!this.isInProgress()) {
              this.startPollUpdateTimer();
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
                if (previousSRState === 'SYNCING') {
                  notice.push(notice.SUCCESS, 'The project was successfully synchronized.');
                }

                (syncProjectStatusSuccessCallback || angular.noop)();
                break;
            }
          }
        }.bind(this));
      }.bind(this);

      this.startSyncStatusTimer = function startSyncStatusTimer() {
        this.cancelPollUpdateTimer();
        this.cancelCloneStatusTimer();
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
      this.syncStateNotice = function syncStateNotice() {
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

      this.lastSyncNotice = function lastSyncNotice() {
        if (angular.isUndefined(status)) return;

        switch (status.SRState) {
          case 'SYNCING':
          case 'PENDING':
          case 'IDLE':
          case 'SYNCED':
          case 'LF_UNSYNCED':
          case 'HOLD':
            if (angular.isDefined(projectSettings) &&
              angular.isDefined(projectSettings.lastSyncedDate)
            ) {
              if (Date.parse(projectSettings.lastSyncedDate) <= 0) {
                return 'Never been synced';
              } else {
                return 'Last sync was ' + $filter('relativetime')(projectSettings.lastSyncedDate);
              }
            } else {
              return '';
            }

          case 'CLONING':
          case 'LF_CLONING':

          // Undefined initial state
          default:
            return '';
        }
      };

      this.setPollUpdateSuccessCallback = function setPollUpdateSuccessCallback(callback) {
        pollUpdateSuccessCallback = callback;
      };

      var getPollUpdate = function () {
        editorData.refreshEditorData().then(function (result) {
          if (result.ok) {
            if (this.isSendReceiveProject()) {
              if (angular.isUndefined(result.data) ||
                angular.isUndefined(result.data.sendReceive) ||
                angular.isUndefined(result.data.sendReceive.status)
              ) {
                this.clearState();
                return;
              }

              previousSRState = status.SRState;
              status = result.data.sendReceive.status;
              if (this.isInProgress()) {
                (pollUpdateSuccessCallback || angular.noop)();
                this.setSyncStarted();
              } else if (previousSRState === 'LF_UNSYNCED' && status.SRState === 'IDLE') {
                status.SRState = previousSRState;
              } else if (previousSRState === unknownSRState) {
                this.clearState();
              } else {
                (pollUpdateSuccessCallback || angular.noop)();
              }
            } else {
              (pollUpdateSuccessCallback || angular.noop)();
            }
          }
        }.bind(this));
      }.bind(this);

      this.startPollUpdateTimer = function startPollUpdateTimer() {
        this.cancelSyncStatusTimer();
        this.cancelCloneStatusTimer();
        if (angular.isDefined(pollUpdateTimer)) return;

        pollUpdateTimer = $interval(getPollUpdate, pollUpdateInterval);
      };

      this.cancelPollUpdateTimer = function cancelPollUpdateTimer() {
        if (angular.isDefined(pollUpdateTimer)) {
          $interval.cancel(pollUpdateTimer);
          pollUpdateTimer = undefined;
        }
      };

      this.setCloneProjectStatusSuccessCallback =
        function setCloneProjectStatusSuccessCallback(callback) {
          cloneProjectStatusSuccessCallback = callback;
        };

      var getCloneProjectStatus = function () {
        sendReceiveApi.getProjectStatus(function (result) {
          if (result.ok) {
            if (!result.data) {
              this.clearState();
              this.cancelCloneStatusTimer();
              return;
            }

            status = result.data;
            console.log(status);
            if (status.SRState === 'IDLE' ||
              status.SRState === 'HOLD') {
              this.cancelCloneStatusTimer();
              (cloneProjectStatusSuccessCallback || angular.noop)();
            }
          }
        }.bind(this));
      }.bind(this);

      this.startCloneStatusTimer = function startCloneStatusTimer() {
        this.cancelPollUpdateTimer();
        this.cancelSyncStatusTimer();

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
      this.cloneNotice = this.syncStateNotice;

      this.cancelAllStatusTimers = function cancelAllStatusTimers() {
        this.cancelSyncStatusTimer();
        this.cancelPollUpdateTimer();
        this.cancelCloneStatusTimer();
      };

    }])

  ;
