import * as angular from 'angular';

import { NoticeService } from '../../../core/notice/notice.service';
import { TranslateProjectService } from '../core/translate-project.service';
import { TranslateRights } from '../core/translate-rights.service';
import { TranslateSendReceiveService } from '../core/translate-send-receive.service';
import { TranslateProject } from '../shared/model/translate-project.model';
import { TranslateUtilities } from '../shared/translate-utilities';

export class TranslateSyncController implements angular.IController {
  tsycProject: TranslateProject;
  tsycRights: TranslateRights;

  static $inject = ['translateSendReceiveService'];
  constructor(private readonly sendReceiveService: TranslateSendReceiveService) {}

  get disableSyncButton(): boolean {
    return this.sendReceiveService.isStarted;
  }

  get syncStateNotice(): string {
    return this.sendReceiveService.syncStateNotice;
  }

  get lastSyncNotice(): string {
    return this.sendReceiveService.lastSyncNotice;
  }

  syncProject(): void {
    this.sendReceiveService.startSync();
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
