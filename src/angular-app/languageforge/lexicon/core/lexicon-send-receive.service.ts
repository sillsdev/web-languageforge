import * as angular from 'angular';

import { RelativeTimeFilterFunction } from '../../../bellows/core/filters';
import { NoticeService } from '../../../bellows/core/notice/notice.service';
import { SessionService } from '../../../bellows/core/session.service';
import { LexiconProjectSettings } from '../shared/model/lexicon-project-settings.model';
import { SendReceiveState, SendReceiveStatus } from '../shared/model/send-receive-status.model';
import { JsonRpcResult, LexiconSendReceiveApiService } from './lexicon-send-receive-api.service';

type SRTimerCallback = () => void;

export class LexiconSendReceiveService {
  readonly SYNC_STATUS_INTERVAL = 3000; // ms
  readonly POLL_UPDATE_INTERVAL = 32000; // ms
  readonly CLONE_STATUS_INTERVAL = 3000; // ms

  previousSRState: SendReceiveState = SendReceiveState.Unknown;
  syncProjectStatusSuccessCallback: SRTimerCallback = angular.noop;
  pollUpdateSuccessCallback: SRTimerCallback = angular.noop;
  cloneProjectStatusSuccessCallback: SRTimerCallback = angular.noop;
  syncStatusTimer: angular.IPromise<void>;
  pollUpdateTimer: angular.IPromise<void>;
  cloneStatusTimer: angular.IPromise<void>;
  pendingMessageId: string;
  projectSettings: LexiconProjectSettings;
  status: SendReceiveStatus;

  static $inject: string[] = ['$interval', '$filter', '$q',
    'sessionService', 'silNoticeService', 'lexSendReceiveApi',
    'lexEditorDataService'
  ];
  constructor(private $interval: angular.IIntervalService, private $filter: angular.IFilterService,
              private $q: angular.IQService, private sessionService: SessionService, private notice: NoticeService,
              private sendReceiveApi: LexiconSendReceiveApiService, private editorData: any) {
    this.sessionService.getSession().then(this.updateSessionData);
  }

  clearState(): void {
    if (!this.status || angular.isUndefined(this.status)) {
      this.status = new SendReceiveStatus();
    }

    this.status.SRState = SendReceiveState.Unknown;
    this.previousSRState = SendReceiveState.Unknown;
  }

  // SRState is CLONING or SYNCING
  // logic should match PHP SendReceiveCommands::isInProgress
  isInProgress(): boolean {
    return angular.isDefined(this.status) && angular.isDefined(this.status.SRState) &&
      (this.status.SRState === SendReceiveState.CloneRequested || this.status.SRState === SendReceiveState.Cloning ||
        this.status.SRState === SendReceiveState.Syncing);
  }

  // S/R isInProgress(), SRState is unknown, or SRState is PENDING
  isStarted(): boolean {
    return this.isInProgress() || (angular.isDefined(this.status) && angular.isDefined(this.status.SRState) &&
      (this.status.SRState === SendReceiveState.Unknown || this.status.SRState === SendReceiveState.Pending));
  }

  isSendReceiveProject(): angular.IPromise<boolean> {
    return this.sessionService.getSession().then(session => session.projectSettings().hasSendReceive);
  }

  setSyncProjectStatusSuccessCallback(callback: SRTimerCallback): void {
    this.syncProjectStatusSuccessCallback = callback;
  }

  // Called after a lexicon project page is done loading
  checkInitialState = (): void => {
    this.isSendReceiveProject().then((isSR: boolean) => {
      if (isSR) {
        if (!this.status || angular.isUndefined(this.status)) {
          this.clearState();
          this.getSyncProjectStatus();
          this.startSyncStatusTimer();
        } else if (this.isInProgress()) {
          this.setSyncStarted();
        } else {
          if (this.status.SRState === SendReceiveState.Unknown) {
            this.clearState();
          }

          this.startPollUpdateTimer();
        }
      } else {
        this.startPollUpdateTimer();
      }
    });
  }

  setSyncStarted(): void {
    this.notice.cancelProgressBar();
    this.notice.push(this.notice.SUCCESS, 'S/R has been queued');
    this.startSyncStatusTimer();
  }

  setStateUnsynced(): angular.IPromise<void> {
    return this.isSendReceiveProject().then((isSR: boolean) => {
      if (isSR) {
        this.previousSRState = this.status.SRState;
        this.status.SRState = SendReceiveState.Unsynced;
      }
    });
  }

  getSyncProjectStatus = (): void => {
    this.sendReceiveApi.getProjectStatus().then((result: JsonRpcResult) => {
      if (!result.data) {
        this.clearState();
        this.startPollUpdateTimer();
        this.notice.cancelLoading();
        return;
      }

      this.previousSRState = this.status.SRState;
      this.status = result.data;

      if (this.status.PercentComplete > 0) {
        this.notice.setPercentComplete(this.status.PercentComplete);
      } else {
        this.notice.cancelProgressBar();
      }

      if (!this.isInProgress()) {
        this.startPollUpdateTimer();
        this.notice.cancelLoading();
      }

      // console.log(this.status);

      switch (this.status.SRState) {
        case SendReceiveState.Pending:
          this.pendingMessageId = this.notice.push(this.notice.INFO,
            'Please wait while other projects are being synchronized. ' +
            'You may continue to edit this project until it starts to synchronize.');
          break;
        case SendReceiveState.Syncing:
          this.notice.removeById(this.pendingMessageId);
          this.notice.setLoading('Synchronizing with LanguageDepot.org...');
          break;
        case SendReceiveState.Hold:
          this.notice.push(this.notice.ERROR, 'Well this is embarrassing. Something went ' +
              'wrong and your project is now on hold. Contact an administrator.');
          break;
        case SendReceiveState.Idle:
          if (this.previousSRState === SendReceiveState.Syncing) {
            this.notice.push(this.notice.SUCCESS, 'The project was successfully synchronized.');
          }

          this.sessionService.getSession(true).then(this.updateSessionData);
          if (this.syncProjectStatusSuccessCallback) this.syncProjectStatusSuccessCallback();
          break;
      }
    });
  }

  startSyncStatusTimer(): void {
    this.cancelPollUpdateTimer();
    this.cancelCloneStatusTimer();
    if (angular.isDefined(this.syncStatusTimer)) {
      return;
    }

    this.syncStatusTimer = this.$interval(this.getSyncProjectStatus, this.SYNC_STATUS_INTERVAL);
  }

  cancelSyncStatusTimer(): void {
    if (angular.isDefined(this.syncStatusTimer)) {
      this.$interval.cancel(this.syncStatusTimer);
      this.syncStatusTimer = undefined;
    }
  }

  // UI strings corresponding to SRState in the LfMerge state file.
  // SRStates with an "LF_" prefix are languageforge overrides
  syncStateNotice(): string {
    if (angular.isUndefined(this.status)) return;

    switch (this.status.SRState) {
      case SendReceiveState.CloneRequested:
      case SendReceiveState.Cloning:
        return 'Creating initial data. This may take a few minutes...';
      case SendReceiveState.Syncing:
        return 'Syncing...';
      case SendReceiveState.Pending:
        return 'Pending';
      case SendReceiveState.Idle:
      case SendReceiveState.Synced:
        return 'Synced';
      case SendReceiveState.Unsynced:
        return 'Un-synced';
      case SendReceiveState.Hold:
        return 'On hold';

      // Undefined initial state
      default:
        return '';
    }
  }

  lastSyncNotice(): string {
    if (angular.isUndefined(this.status) || angular.isUndefined(this.projectSettings)) return;

    switch (this.status.SRState) {
      case SendReceiveState.Syncing:
      case SendReceiveState.Pending:
      case SendReceiveState.Idle:
      case SendReceiveState.Synced:
      case SendReceiveState.Unsynced:
      case SendReceiveState.Hold:
        if (angular.isDefined(this.projectSettings) && angular.isDefined(this.projectSettings.lastSyncedDate)) {
          if (Date.parse(this.projectSettings.lastSyncedDate) <= 0) {
            return 'Never been synced';
          } else {
            const relativeTime = this.$filter('relativetime') as RelativeTimeFilterFunction;
            return 'Last sync was ' + relativeTime(this.projectSettings.lastSyncedDate);
          }
        } else {
          return '';
        }

      case SendReceiveState.CloneRequested:
      case SendReceiveState.Cloning:

      // Undefined initial state
      default:
        return '';
    }
  }

  setPollUpdateSuccessCallback(callback: SRTimerCallback): void {
    this.pollUpdateSuccessCallback = callback;
  }

  getPollUpdate = (): angular.IPromise<void> => {
    return this.$q.all({
      editorData: this.editorData.refreshEditorData(),
      isSR: this.isSendReceiveProject()
    }).then((data: any) => {
      if (data.isSR) {
        const editorData = data.editorData.data;
        if (angular.isUndefined(editorData) || angular.isUndefined(editorData.sendReceive) ||
          angular.isUndefined(editorData.sendReceive.status)
        ) {
          this.clearState();
          return;
        }

        this.previousSRState = this.status.SRState;
        this.status = editorData.sendReceive.status;
        if (this.isInProgress()) {
          if (this.pollUpdateSuccessCallback) this.pollUpdateSuccessCallback();
          this.setSyncStarted();
        } else if (this.previousSRState === SendReceiveState.Unsynced && this.status.SRState === SendReceiveState.Idle
        ) {
          this.status.SRState = this.previousSRState;
        } else if (this.previousSRState === SendReceiveState.Unknown) {
          this.clearState();
        } else {
          if (this.pollUpdateSuccessCallback) this.pollUpdateSuccessCallback();
        }
      } else {
        if (this.pollUpdateSuccessCallback) this.pollUpdateSuccessCallback();
      }
    });
  }

  startPollUpdateTimer(): void {
    this.cancelSyncStatusTimer();
    this.cancelCloneStatusTimer();
    if (angular.isDefined(this.pollUpdateTimer)) {
      return;
    }

    this.pollUpdateTimer = this.$interval(this.getPollUpdate, this.POLL_UPDATE_INTERVAL);
  }

  cancelPollUpdateTimer(): void {
    if (angular.isDefined(this.pollUpdateTimer)) {
      this.$interval.cancel(this.pollUpdateTimer);
      this.pollUpdateTimer = undefined;
    }
  }

  setCloneProjectStatusSuccessCallback(callback: SRTimerCallback): void {
    this.cloneProjectStatusSuccessCallback = callback;
  }

  getCloneProjectStatus = (): void => {
    this.sendReceiveApi.getProjectStatus((result: JsonRpcResult) => {
      if (result.ok) {
        if (!result.data) {
          this.clearState();
          this.cancelCloneStatusTimer();
          return;
        }

        this.status = result.data;

        // console.log(this.status);

        if (this.status.SRState === SendReceiveState.Idle || this.status.SRState === SendReceiveState.Hold) {
          this.cancelCloneStatusTimer();
          if (this.cloneProjectStatusSuccessCallback) this.cloneProjectStatusSuccessCallback();
        }
      }
    });
  }

  startCloneStatusTimer(): void {
    this.cancelPollUpdateTimer();
    this.cancelSyncStatusTimer();

    // Whether the true SRState is CLONING or PENDING, the user is going to have to wait for CLONING anyway
    this.status.SRState = SendReceiveState.CloneRequested;
    if (angular.isDefined(this.cloneStatusTimer)) return;

    this.cloneStatusTimer = this.$interval(this.getCloneProjectStatus, this.CLONE_STATUS_INTERVAL);
  }

  cancelCloneStatusTimer = (): void => {
    if (angular.isDefined(this.cloneStatusTimer)) {
      this.$interval.cancel(this.cloneStatusTimer);
      this.cloneStatusTimer = undefined;
    }
  }

  // For now, we generate the same S/R string based on the SRState
  cloneNotice = (): string => {
    return this.syncStateNotice();
  }

  cancelAllStatusTimers(): void {
    this.cancelSyncStatusTimer();
    this.cancelPollUpdateTimer();
    this.cancelCloneStatusTimer();
  }

  private updateSessionData = (session: any): void => {
    this.projectSettings = session.projectSettings();

    if (angular.isDefined(this.projectSettings) && angular.isDefined(this.projectSettings.sendReceive) &&
      angular.isDefined(this.projectSettings.sendReceive.status)
    ) {
      this.status = this.projectSettings.sendReceive.status;
      this.previousSRState = this.status.SRState;
    }
  }

}
