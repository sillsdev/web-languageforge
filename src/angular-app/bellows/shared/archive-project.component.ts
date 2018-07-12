import * as angular from 'angular';

import {ProjectService} from '../core/api/project.service';
import {CoreModule} from '../core/core.module';
import {ModalService} from '../core/modal/modal.service';
import {NoticeService} from '../core/notice/notice.service';

export class ArchiveProjectController implements angular.IController {
  puiActionInProgress: boolean;

  static $inject: string[] = ['$scope', '$window', 'projectService',
    'silNoticeService', 'modalService'];
  constructor(private readonly $scope: angular.IScope, private readonly $window: angular.IWindowService,
              private readonly projectService: ProjectService, private readonly notice: NoticeService,
              private readonly modalService: ModalService) { }

  archiveProject() {
    const modalOptions = {
      closeButtonText: 'Cancel',
      actionButtonText: 'Archive',
      headerText: 'Archive Project?',
      bodyText: 'Are you sure you want to archive this project?'
    };
    this.modalService.showModal({}, modalOptions).then(() => {
      this.puiActionInProgress = true;
      this.projectService.archiveProject().then(result => {
        if (result.ok) {
          this.notice.push(this.notice.SUCCESS, 'The project was archived successfully');
          this.$window.location.href = '/app/projects';
        } else {
          this.puiActionInProgress = false;
        }
      });
    }, () => {});
  }

}

export const ArchiveProjectComponent: angular.IComponentOptions = {
  bindings: {
    puiActionInProgress: '<'
  },
  controller: ArchiveProjectController,
  templateUrl: '/angular-app/bellows/shared/archive-project.component.html'
};

export const ArchiveProjectModule = angular
  .module('palaso.ui.archiveProject', [
    CoreModule
  ])
  .component('puiArchiveProject', ArchiveProjectComponent)
  .name;
