import * as angular from 'angular';

import { ParatextUserInfo } from '../../../shared/model/paratext-user-info.model';
import { ParatextService } from '../core/paratext.service';
import { TranslateRights } from '../core/translate-rights.service';
import { TranslateSendReceiveService } from '../core/translate-send-receive.service';
import { TranslateProject } from '../shared/model/translate-project.model';

export class TranslateSyncController implements angular.IController {
  tsycProject: TranslateProject;
  tsycRights: TranslateRights;

  paratextUserInfo: ParatextUserInfo;
  isRetrievingParatextUserInfo: boolean = false;

  static $inject = ['translateSendReceiveService',
    'paratextService'];
  constructor(private readonly sendReceiveService: TranslateSendReceiveService,
              private readonly paratextService: ParatextService) {}

  $onInit() {
    this.isRetrievingParatextUserInfo = true;
    this.paratextService.getUserInfo()
      .then(pui => this.paratextUserInfo = pui)
      .finally(() => this.isRetrievingParatextUserInfo = false);
  }

  get disableSyncButton(): boolean {
    return this.sendReceiveService.isStarted;
  }

  get syncStateNotice(): string {
    return this.sendReceiveService.syncStateNotice;
  }

  get lastSyncNotice(): string {
    return this.sendReceiveService.lastSyncNotice;
  }

  get isSignedIntoParatext(): boolean {
    return this.paratextUserInfo != null;
  }

  syncProject(): void {
    this.sendReceiveService.startSync();
  }

  signIntoParatext(): void {
    this.isRetrievingParatextUserInfo = true;
    this.paratextService.signIn()
      .then(pui => this.paratextUserInfo = pui)
      .finally(() => this.isRetrievingParatextUserInfo = false);
  }
}

export const TranslateSyncComponent: angular.IComponentOptions = {
  bindings: {
    tsycProject: '<',
    tsycRights: '<'
  },
  templateUrl: '/angular-app/bellows/apps/translate/settings/sync.component.html',
  controller: TranslateSyncController
};
