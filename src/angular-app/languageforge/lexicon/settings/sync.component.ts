import * as angular from 'angular';

import {NoticeService} from '../../../bellows/core/notice/notice.service';
import {LexiconProjectService} from '../core/lexicon-project.service';
import {Rights} from '../core/lexicon-rights.service';
import {LexiconSendReceiveApiService} from '../core/lexicon-send-receive-api.service';
import {LexiconSendReceiveService} from '../core/lexicon-send-receive.service';
import {LexiconProjectSettings} from '../shared/model/lexicon-project-settings.model';
import {LexiconProject} from '../shared/model/lexicon-project.model';

export class LexiconSyncController implements angular.IController {
  lsyRights: Rights;

  syncStateNotice = this.sendReceive.syncStateNotice;
  lastSyncNotice = this.sendReceive.lastSyncNotice;

  static $inject = ['silNoticeService', 'lexProjectService',
    'lexSendReceiveApi', 'lexSendReceive'
  ];
  constructor(private notice: NoticeService, private lexProjectService: LexiconProjectService,
              private sendReceiveApi: LexiconSendReceiveApiService, private sendReceive: LexiconSendReceiveService) { }

  $onInit(): void {
    this.lexProjectService.setBreadcrumbs('sync', 'Synchronize');
    this.lexProjectService.setupSettings();
  }

  showSyncButton(): boolean {
    if (this.lsyRights == null || this.lsyRights.session == null) {
      return false;
    }

    return !this.lsyRights.session.project<LexiconProject>().isArchived && this.lsyRights.canEditUsers() &&
      this.lsyRights.session.projectSettings<LexiconProjectSettings>().hasSendReceive;
  }

  disableSyncButton(): boolean {
    return this.sendReceive.isStarted();
  }

  // Called when Send/Receive button clicked
  syncProject(): void {
    if (!this.showSyncButton()) return;

    this.sendReceiveApi.receiveProject(result => {
      if (result.ok) {
        this.sendReceive.setSyncStarted();
      } else {
        this.notice.push(this.notice.ERROR,
          'The project could not be synchronized with LanguageDepot.org. Please try again.');
      }
    });
  }

}

export const LexiconSyncComponent: angular.IComponentOptions = {
  bindings: {
    lsyRights: '<'
  },
  controller: LexiconSyncController,
  templateUrl: '/angular-app/languageforge/lexicon/settings/sync.component.html'
};
