import * as angular from 'angular';

import { RelativeTimeFilterFunction } from '../../../bellows/core/filters';
import { NoticeService } from '../../../bellows/core/notice/notice.service';
import { Session, SessionService } from '../../../bellows/core/session.service';
import { SendReceiveErrorCodes } from '../../../bellows/shared/model/send-receive-errorcodes.model';
import { SendReceiveState } from '../../../bellows/shared/model/send-receive-state.model';
import { LexiconProjectSettings } from '../shared/model/lexicon-project-settings.model';
import { SendReceiveStatus } from '../shared/model/send-receive-status.model';
import { JsonRpcResult, LexiconSendReceiveApiService } from './lexicon-send-receive-api.service';

type SRTimerCallback = () => void;

type SRFailedCallback = (status: SendReceiveStatus) => void;

export class LexiconSendReceiveService {
  readonly SYNC_STATUS_INTERVAL = 3000; // ms
  readonly POLL_UPDATE_INTERVAL = 32000; // ms
  readonly CLONE_STATUS_INTERVAL = 3000; // ms

  previousSRState: SendReceiveState = SendReceiveState.Unknown;
  syncProjectStatusSuccessCallback: SRTimerCallback = () => {};
  pollUpdateSuccessCallback: SRTimerCallback = () => {};
  cloneProjectStatusSuccessCallback: SRTimerCallback = () => {};
  cloneProjectStatusFailedCallback: SRFailedCallback = () => {};
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
    if (!this.status || this.status == null) {
      this.status = new SendReceiveStatus();
    }

    this.status.SRState = SendReceiveState.Unknown;
    this.previousSRState = SendReceiveState.Unknown;
  }

  // SRState is CLONING or SYNCING
  // logic should match PHP SendReceiveCommands::isInProgress
  isInProgress(): boolean {
    return this.status != null && this.status.SRState != null &&
      (this.status.SRState === SendReceiveState.CloneRequested || this.status.SRState === SendReceiveState.Cloning ||
        this.status.SRState === SendReceiveState.Syncing);
  }

  // S/R isInProgress(), SRState is unknown, or SRState is PENDING
  isStarted(): boolean {
    return this.isInProgress() || (this.status != null && this.status.SRState != null &&
      (this.status.SRState === SendReceiveState.Unknown || this.status.SRState === SendReceiveState.Pending));
  }

  isSendReceiveProject(): angular.IPromise<boolean> {
    return this.sessionService.getSession()
      .then(session => session.projectSettings<LexiconProjectSettings>().hasSendReceive);
  }

  setSyncProjectStatusSuccessCallback(callback: SRTimerCallback): void {
    this.syncProjectStatusSuccessCallback = callback;
  }

  // Called after a lexicon project page is done loading
  checkInitialState = (): void => {
    this.isSendReceiveProject().then((isSR: boolean) => {
      if (isSR) {
        if (!this.status || this.status == null) {
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

  showProjectStatusNotice(status: SendReceiveStatus): void {
    switch (status.SRState) {
      case SendReceiveState.Pending:
        this.pendingMessageId = this.notice.push(this.notice.INFO,
          'Please wait while other projects are being synchronized. ' +
          'You may continue to edit this project until it starts to synchronize.');
        break;
      case SendReceiveState.Syncing:
        this.notice.removeById(this.pendingMessageId);
        this.notice.setLoading('Synchronizing with LanguageDepot.org...');
        break;
      case SendReceiveState.Error:
        let errorMessage = '';
        switch (status.ErrorCode) {
          case SendReceiveErrorCodes.EmptyProject:
            errorMessage = 'The project \'' + this.status.ProjectCode + '\' has no data in ' +
              'LanguageDepot.org. Please do a Send / Receive in FLEx first, then try again.';
            break;
          case SendReceiveErrorCodes.NoFlexProject:
            errorMessage = '\'' + this.status.ProjectCode + '\' is not a FLEx project. Can ' +
              'only synchronize with FLEx projects.';
            break;
          case SendReceiveErrorCodes.ProjectTooOld:
            errorMessage = 'The project \'' + this.status.ProjectCode + '\' is from an ' +
              'unsupported version of FLEx. The oldest supported FLEx version is 8.2';
            break;
          case SendReceiveErrorCodes.ProjectTooNew:
            errorMessage = 'The project \'' + this.status.ProjectCode + '\' is from a version ' +
              'of FLEx that is too new. We don\'t yet support that version.';
            break;
          case SendReceiveErrorCodes.Unauthorized:
            errorMessage = 'You\'re not authorized to access project \'' +
              this.status.ProjectCode + '\' on LanguageDepot.org. Contact the project manager, ' +
              'then try again.';
            break;
          default:
            this.notice.push(this.notice.ERROR, 'Something went wrong with project \'' +
              this.status.ProjectCode + '\'. Contact an administrator.',
              this.status.ErrorMessage);
            break;
        }
        if (errorMessage !== '') {
          this.notice.push(this.notice.ERROR, errorMessage);
        }
        break;
      case SendReceiveState.Hold:
        this.notice.push(this.notice.ERROR, 'Well this is embarrassing. Something went ' +
          'wrong and your project \'' + this.status.ProjectCode + '\'is now on hold. ' +
          'Contact an administrator.');
        break;
      case SendReceiveState.Idle:
        if (this.previousSRState === SendReceiveState.Syncing) {
          this.notice.push(this.notice.SUCCESS, 'The project was successfully synchronized.');
        }
        break;
    }
  }

  getSyncProjectStatus = (): void => {
    this.sendReceiveApi.getProjectStatus().then((result: JsonRpcResult<any>) => {
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

      this.showProjectStatusNotice(this.status);

      if (this.status.SRState === SendReceiveState.Idle) {
          this.sessionService.getSession(true).then(this.updateSessionData);
          if (this.syncProjectStatusSuccessCallback) this.syncProjectStatusSuccessCallback();
      }
    });
  }

  startSyncStatusTimer(): void {
    this.cancelPollUpdateTimer();
    this.cancelCloneStatusTimer();
    if (this.syncStatusTimer != null) {
      return;
    }

    this.syncStatusTimer = this.$interval(this.getSyncProjectStatus, this.SYNC_STATUS_INTERVAL);
  }

  cancelSyncStatusTimer(): void {
    if (this.syncStatusTimer != null) {
      this.$interval.cancel(this.syncStatusTimer);
      this.syncStatusTimer = undefined;
    }
  }

  // UI strings corresponding to SRState in the LfMerge state file.
  syncStateNotice = (): string => {
    if (this.status == null) return;

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
      case SendReceiveState.Error:
        switch (this.status.ErrorCode) {
          case SendReceiveErrorCodes.EmptyProject:
            return 'Synced';
          case SendReceiveErrorCodes.NoFlexProject:
          case SendReceiveErrorCodes.ProjectTooOld:
          case SendReceiveErrorCodes.ProjectTooNew:
          default:
            return 'Error';
        }

      // Undefined initial state
      default:
        return '';
    }
  }

  lastSyncNotice = (): string => {
    if (this.status == null || this.projectSettings == null) {
      return;
    }

    switch (this.status.SRState) {
      case SendReceiveState.Syncing:
      case SendReceiveState.Pending:
      case SendReceiveState.Idle:
      case SendReceiveState.Synced:
      case SendReceiveState.Unsynced:
      case SendReceiveState.Hold:
      case SendReceiveState.Error:
        if (this.projectSettings != null && this.projectSettings.lastSyncedDate != null) {
          if (Date.parse(this.projectSettings.lastSyncedDate) <= 0) {
            return 'Never been synced';
          } else {
            const relativeTime = this.$filter<RelativeTimeFilterFunction>('relativetime');
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
        const editorData = data.editorData;
        if (editorData?.data?.sendReceive?.status == null) {
          this.clearState();
          return;
        }

        this.previousSRState = this.status.SRState;
        this.status = editorData.data.sendReceive.status;
        if (this.isInProgress()) {
          if (this.pollUpdateSuccessCallback) this.pollUpdateSuccessCallback();
          this.setSyncStarted();
        } else if (this.previousSRState === SendReceiveState.Unsynced &&
                   this.status.SRState === SendReceiveState.Idle) {
          this.status.SRState = this.previousSRState;
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
    if (this.pollUpdateTimer != null) {
      return;
    }

    this.pollUpdateTimer = this.$interval(this.getPollUpdate, this.POLL_UPDATE_INTERVAL);
  }

  cancelPollUpdateTimer(): void {
    if (this.pollUpdateTimer != null) {
      this.$interval.cancel(this.pollUpdateTimer);
      this.pollUpdateTimer = undefined;
    }
  }

  setCloneProjectStatusSuccessCallback(callback: SRTimerCallback): void {
    this.cloneProjectStatusSuccessCallback = callback;
  }

  setCloneProjectStatusFailedCallback(callback: SRFailedCallback): void {
    this.cloneProjectStatusFailedCallback = callback;
  }

  getCloneProjectStatus = (): void => {
    this.sendReceiveApi.getProjectStatus((result: JsonRpcResult<any>) => {
      if (result.ok) {
        if (!result.data) {
          this.clearState();
          this.cancelCloneStatusTimer();
          return;
        }

        this.status = result.data;

        // console.log(this.status);

        if (this.status.SRState === SendReceiveState.Idle) {
          this.cancelCloneStatusTimer();
          if (this.cloneProjectStatusSuccessCallback) this.cloneProjectStatusSuccessCallback();
        } else if (this.status.SRState === SendReceiveState.Hold || this.status.SRState === SendReceiveState.Error) {
          this.cancelCloneStatusTimer();
          if (this.cloneProjectStatusFailedCallback) {
            this.cloneProjectStatusFailedCallback(this.status);
          }
        }
      }
    });
  }

  startCloneStatusTimer(): void {
    this.cancelPollUpdateTimer();
    this.cancelSyncStatusTimer();

    // Whether the true SRState is CLONING or PENDING, the user is going to have to wait for CLONING anyway
    this.status.SRState = SendReceiveState.CloneRequested;
    if (this.cloneStatusTimer != null) return;

    this.cloneStatusTimer = this.$interval(this.getCloneProjectStatus, this.CLONE_STATUS_INTERVAL);
  }

  cancelCloneStatusTimer = (): void => {
    if (this.cloneStatusTimer != null) {
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

  private updateSessionData = (session: Session): void => {
    this.projectSettings = session.projectSettings<LexiconProjectSettings>();

    if (this.projectSettings != null && this.projectSettings.sendReceive != null &&
      this.projectSettings.sendReceive.status != null
    ) {
      this.status = this.projectSettings.sendReceive.status;
      this.previousSRState = this.status.SRState;
    }
  }

}
