import * as angular from 'angular';

import {ProjectService} from '../core/api/project.service';
import {CoreModule} from '../core/core.module';
import {ModalService} from '../core/modal/modal.service';
import {NoticeService} from '../core/notice/notice.service';
import {SessionService} from '../core/session.service';

export class DeleteProjectController implements angular.IController {
  actionInProgress: boolean = false;

  static $inject: string[] = ['$scope', '$window',
    'modalService', 'silNoticeService',
    'projectService', 'sessionService'];
  constructor(private readonly $scope: angular.IScope, private readonly $window: angular.IWindowService,
              private readonly modalService: ModalService, private readonly notice: NoticeService,
              private readonly projectService: ProjectService, private readonly sessionService: SessionService) { }

  deleteProject() {
    const modalOptions = {
      closeButtonText: 'Cancel',
      actionButtonText: 'Delete',
      headerText: 'Permanently delete project?',
      bodyText: 'Are you sure you want to delete this project?\n' +
      'This is a permanent action and cannot be restored.'
    };
    this.modalService.showModal({}, modalOptions).then(() => {
      this.sessionService.getSession().then(session => {
        const projectIds = [session.project().id];
        this.actionInProgress = true;
        this.projectService.deleteProject(projectIds).then(() => {
          this.notice.push(this.notice.SUCCESS, 'The project was permanently deleted');
          this.$window.location.href = '/app/projects';
        }).catch(() => {
          this.actionInProgress = false;
        });
      });
    }, () => {});
  }

}

export const DeleteProjectComponent: angular.IComponentOptions = {
  bindings: {
  },
  controller: DeleteProjectController,
  templateUrl: '/angular-app/bellows/shared/delete-project.component.html'
};

export const DeleteProjectModule = angular
  .module('palaso.ui.deleteProject', [
    CoreModule
  ])
  .component('puiDeleteProject', DeleteProjectComponent)
  .name;
