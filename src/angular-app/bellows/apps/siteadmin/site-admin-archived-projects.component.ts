import * as angular from 'angular';

import { ProjectService } from '../../core/api/project.service';
import { ModalService } from '../../core/modal/modal.service';
import { NoticeService } from '../../core/notice/notice.service';
import { SessionService } from '../../core/session.service';
import { Project } from '../../shared/model/project.model';

class Rights {
  remove: boolean;
  publish: boolean;
  showControlBar: boolean;
}

export class SiteAdminArchivedProjectsController implements angular.IController {
  finishedLoading = false;
  archivedProjects: Project[] = [];
  selected: Project[] = [];
  rights = new Rights();

  static $inject = ['projectService', 'sessionService',
    'silNoticeService', 'modalService'];
  constructor(private projectService: ProjectService, private sessionService: SessionService,
              private notice: NoticeService, private modalService: ModalService) {}

  $onInit() {
    this.sessionService.getSession().then((session) => {
      const hasRight = session.hasSiteRight(this.sessionService.domain.PROJECTS, this.sessionService.operation.DELETE);
      this.rights.remove = hasRight;
      this.rights.publish = hasRight;
      this.rights.showControlBar = hasRight;
    });

    this.queryArchivedProjects();
  }

  updateSelection(event: Event, project: Project): void {
    const selectedIndex = this.selected.indexOf(project);
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked && selectedIndex === -1) {
      this.selected.push(project);
    } else if (!checkbox.checked && selectedIndex !== -1) {
      this.selected.splice(selectedIndex, 1);
    }
  }

  isSelected(project: Project): boolean {
    return project !== null && this.selected.indexOf(project) >= 0;
  }

  publishProjects(): void {
    let projectIds: string[] = [];
    for (let i = 0, l = this.selected.length; i < l; i++) {
      projectIds.push(this.selected[i].id);
    }

    this.projectService.publish(projectIds, (result) => {
      if (result.ok) {
        this.selected = []; // Reset the selection
        this.queryArchivedProjects();
        if (projectIds.length === 1) {
          this.notice.push(this.notice.SUCCESS, 'The project was re-published successfully');
        } else {
          this.notice.push(this.notice.SUCCESS, 'The projects were re-published successfully');
        }
      }
    });
  }

  deleteProjects(): void {
    const message = 'Are you sure you want permanently delete these projects?';
    const modalOptions = {
      closeButtonText: 'Cancel',
      actionButtonText: 'Delete',
      headerText: 'Permanently Delete Project?',
      bodyText: message
    };
    this.modalService.showModal({}, modalOptions).then(() => {
      let projectIds: string[] = [];
      for (let i = 0, l = this.selected.length; i < l; i++) {
        projectIds.push(this.selected[i].id);
      }

      this.projectService.deleteProject(projectIds, (result) => {
        if (result.ok) {
          this.selected = []; // Reset the selection
          this.queryArchivedProjects();
          if (projectIds.length === 1) {
            this.notice.push(this.notice.SUCCESS, 'The project was permanently deleted');
          } else {
            this.notice.push(this.notice.SUCCESS, 'The projects were permanently deleted');
          }
        }
      });
    }, angular.noop);
  }

  private queryArchivedProjects(): void {
    this.projectService.archivedList((result) => {
      if (result.ok) {
        for (let i = 0; i < result.data.entries.length; i++) {
          result.data.entries[i].dateModified = new Date(result.data.entries[i].dateModified);
        }

        this.archivedProjects = result.data.entries;
        this.finishedLoading = true;
      }
    });
  }

}

export const SiteAdminArchivedProjectsComponent: angular.IComponentOptions = {
  controller: SiteAdminArchivedProjectsController,
  templateUrl: '/angular-app/bellows/apps/siteadmin/site-admin-archived-projects.component.html'
};
