import * as angular from 'angular';

import {NoticeService} from '../../../bellows/core/notice/notice.service';
import {Session, SessionService} from '../../../bellows/core/session.service';
import {LexiconProjectService} from '../core/lexicon-project.service';
import {LexiconRightsService, Rights} from '../core/lexicon-rights.service';
import {LexiconSendReceiveApiService} from '../core/lexicon-send-receive-api.service';
import {LexiconSendReceiveService} from '../core/lexicon-send-receive.service';
import {LexiconProjectSettings} from '../shared/model/lexicon-project-settings.model';

export class LexiconSyncController implements angular.IController {
  syncStateNotice = this.sendReceive.syncStateNotice;
  lastSyncNotice = this.sendReceive.lastSyncNotice;

  private rights: Rights;
  private session: Session;

  static $inject = ['$q', 'silNoticeService', 'sessionService',
    'lexProjectService', 'lexRightsService',
    'lexSendReceiveApi', 'lexSendReceive'
  ];
  constructor(private $q: angular.IQService, private notice: NoticeService, private sessionService: SessionService,
              private lexProjectService: LexiconProjectService, private rightsService: LexiconRightsService,
              private sendReceiveApi: LexiconSendReceiveApiService, private sendReceive: LexiconSendReceiveService) { }

  $onInit() {
    this.lexProjectService.setBreadcrumbs('sync', 'Synchronize');
    this.$q.all([this.rightsService.getRights(), this.sessionService.getSession()]).then(([rights, session]) => {
      this.rights = rights;
      this.session = session;
    });
  }

  showSyncButton() {
    if (this.rights == null || this.session == null) {
      return false;
    }

    return !this.session.project().isArchived && this.rights.canEditUsers() &&
      this.session.projectSettings<LexiconProjectSettings>().hasSendReceive;
  }

  disableSyncButton() {
    return this.sendReceive.isStarted();
  }

  // Called when Send/Receive button clicked
  syncProject() {
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
  },
  controller: LexiconSyncController,
  templateUrl: '/angular-app/languageforge/lexicon/settings/sync.component.html'
};
