import * as angular from 'angular';

import { ProjectService } from '../../core/api/project.service';
import { ApplicationHeaderService } from '../../core/application-header.service';
import { BreadcrumbService } from '../../core/breadcrumbs/breadcrumb.service';
import { SiteWideNoticeService } from '../../core/site-wide-notice-service';
import { NoticeService } from '../../core/notice/notice.service';
import { SessionService } from '../../core/session.service';
import { Project } from '../../shared/model/project.model';
import { UserService } from '../../core/api/user.service';
import { RolesService } from '../../core/api/roles.service';

class Rights {
  canEditProjects: boolean;
  canCreateProject: boolean;
  showControlBar: boolean;
}

interface ViewModelProject {
  id: string;
  projectName: string;
  appName: string;
  role: string;
}

export class ProjectsAppController implements angular.IController {
  finishedLoading: boolean = false;
  rights: Rights = new Rights();
  selected: Project[] = [];
  projects: Project[] = [];
  siteName: string;
  projectCount: number;

  static $inject = ['$window', 'projectService',
                    'userService',
                    'rolesService',
                    'sessionService', 'silNoticeService',
                    'breadcrumbService',
                    'siteWideNoticeService',
                    'applicationHeaderService',
                   ];
  constructor(private $window: angular.IWindowService, private projectService: ProjectService,
              private userService: UserService,
              private rolesService: RolesService,
              private sessionService: SessionService, private notice: NoticeService,
              private breadcrumbService: BreadcrumbService,
              private siteWideNoticeService: SiteWideNoticeService,
              private applicationHeaderService: ApplicationHeaderService,
             ) { }

  $onInit() {
    this.applicationHeaderService.setPageName('My Projects');
    this.breadcrumbService.set('top', [{
          href: '/app/projects',
          label: 'My Projects'
        }]);
    this.siteWideNoticeService.displayNotices();

    this.sessionService.getSession().then(session => {
      this.rights.canEditProjects =
        session.hasSiteRight(this.sessionService.domain.PROJECTS, this.sessionService.operation.EDIT);
      this.rights.canCreateProject =
        session.hasSiteRight(this.sessionService.domain.PROJECTS, this.sessionService.operation.CREATE);
      this.rights.showControlBar = this.rights.canCreateProject;
      this.siteName = session.baseSite();
    });

    this.notice.checkUrlForNotices();
  }

  isSelected(project: Project) {
    // noinspection EqualityComparisonWithCoercionJS
    return project != null && this.selected.indexOf(project) >= 0;
  }

  queryProjectsForUser() {
    this.projectService.list().then((projects: Project[]) => {
      this.projects = projects || [];

      // Is this perhaps wrong? Maybe not all projects are included in the JSONRPC response?
      // That might explain the existance of the previous result.data.count
      this.projectCount = projects.length;
      this.finishedLoading = true;
    }).catch(console.error);
  }

  isInProject(project: Project) {
    return (project.role !== 'none');
  }

  isManager(project: Project) {
    return project.role === 'project_manager' || project.role === 'tech_support';
  }

  // Add user as Tech Support to a project
  addTechSupportToProject(project: Project) {
    this.projectService.joinProject(project.id, 'tech_support', result => {
      if (result.ok) {
        this.notice.push(this.notice.SUCCESS, 'You are now Tech Support for the \'' +
          project.projectName + '\' project.');
        this.queryProjectsForUser();
      }
    });
  }

  startProject() {
    this.$window.location.href = '/app/lexicon/new-project';
  }

}

export const ProjectsAppComponent: angular.IComponentOptions = {
  controller: ProjectsAppController,
  templateUrl: '/angular-app/bellows/apps/projects/projects-app.component.html'
};
