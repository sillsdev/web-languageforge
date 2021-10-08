import * as angular from 'angular';
import { NoticeService } from '../../../../bellows/core/notice/notice.service';
import { Session, SessionService } from '../../../../bellows/core/session.service';
import { Project } from '../../../../bellows/shared/model/project.model';
import { LexiconProjectService } from '../../core/lexicon-project.service';
import { LexRoles } from '../model/lexicon-project.model';

export class ShareWithOthersModalInstanceController implements angular.IController {
  modalInstance: any;
  allowSharing: boolean;
  listProject: boolean;
  project: Project;
  session: Session;
  currentUserIsManager: boolean;

  static $inject = ['lexProjectService', 'sessionService', 'silNoticeService'];
  constructor(private readonly lexProjectService: LexiconProjectService,
              private readonly sessionService: SessionService,
              private readonly notice: NoticeService) {}

  $onInit(): void {
    this.sessionService.getSession().then((session: Session) => {
      this.session = session;
      this.project = session.data.project;
      this.currentUserIsManager =
        this.session.data.userProjectRole === LexRoles.MANAGER.key ||
        this.session.data.userProjectRole === LexRoles.TECH_SUPPORT.key;
    });
  }

  setProjectSharability(): void {
    this.lexProjectService.updateProject({allowSharing: this.project.allowSharing}).then((result: any) => {
      this.sessionService.getSession(true).then((session: Session) => {
        this.session = session;
        this.project = session.data.project;
      });
    });
  }

  dismissWithNotification(message: string): void {
    this.modalInstance.dismiss();

    this.notice.push(this.notice.SUCCESS, message);
  }
}

export const ShareWithOthersComponent: angular.IComponentOptions = {
  bindings: {
    modalInstance: '<',
    dismiss: '&'
  },
  controller: ShareWithOthersModalInstanceController,
  templateUrl: '/angular-app/languageforge/lexicon/shared/share-with-others/share-with-others.modal.html'
};
