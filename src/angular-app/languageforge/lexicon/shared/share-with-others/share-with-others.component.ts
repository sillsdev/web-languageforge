import * as angular from 'angular';
import { Session, SessionService } from '../../../../bellows/core/session.service';
import { Project } from '../../../../bellows/shared/model/project.model';

export class ShareWithOthersModalInstanceController implements angular.IController {
  modalInstance: any;
  allowSharing: boolean;
  listProject: boolean;
  project: Project;
  session: Session;

  static $inject = ['sessionService'];
  constructor(private readonly sessionService: SessionService) {}

  $onInit(): void {
    this.sessionService.getSession().then(session => {
      this.session = session;
      this.project = session.data.project;
    });
  }

  setProjectSharability(): void {
    console.log('TODO: actually set project.allowSharing = ' + this.allowSharing);
  }

  setProjectListability(): void {
    console.log('TODO: actually set project.listProject = ' + this.listProject);
  }
}

export const ShareWithOthersComponent: angular.IComponentOptions = {
  bindings: {
    modalInstance: '<',
    close: '&',
    dismiss: '&'
  },
  controller: ShareWithOthersModalInstanceController,
  templateUrl: '/angular-app/languageforge/lexicon/shared/share-with-others/share-with-others.modal.html'
};
