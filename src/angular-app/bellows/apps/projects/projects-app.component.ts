import * as angular from 'angular';

import { ProjectService } from '../../core/api/project.service';
import { ApplicationHeaderService } from '../../core/application-header.service';
import { BreadcrumbService } from '../../core/breadcrumbs/breadcrumb.service';
import { SiteWideNoticeService } from '../../core/site-wide-notice-service';
import { HelpHeroService } from '../../core/helphero.service';
import { NoticeService } from '../../core/notice/notice.service';
import { SessionService } from '../../core/session.service';
import { Project } from '../../shared/model/project.model';
import { LdapiProjectInfo } from '../siteadmin/ldapi-projects-view';
import { UserService } from '../../core/api/user.service';

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
  newProjectCollapsed: boolean = true;
  selected: Project[] = [];
  projects: ViewModelProject[] = [];
  projectTypeNames: any;
  projectTypesBySite: () => string[];
  siteName: string;
  projectCount: number;

  static $inject = ['$window', 'projectService',
                    'userService',
                    'sessionService', 'silNoticeService',
                    'breadcrumbService',
                    'siteWideNoticeService',
                    'applicationHeaderService',
                    'helpHeroService'];
  constructor(private $window: angular.IWindowService, private projectService: ProjectService,
              private userService: UserService,
              private sessionService: SessionService, private notice: NoticeService,
              private breadcrumbService: BreadcrumbService,
              private siteWideNoticeService: SiteWideNoticeService,
              private applicationHeaderService: ApplicationHeaderService,
              private readonly helpHeroService: HelpHeroService) { }

  $onInit() {
    this.projectTypeNames = this.projectService.data.projectTypeNames;
    this.projectTypesBySite = this.projectService.data.projectTypesBySite;
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

      const userId = session.userId();
      if (userId) {
        this.helpHeroService.setIdentity(userId);
      } else {
        this.helpHeroService.anonymous();
      }
    });

    this.notice.checkUrlForNotices();
  }

  isSelected(project: Project) {
    // noinspection EqualityComparisonWithCoercionJS
    return project != null && this.selected.indexOf(project) >= 0;
  }

  queryProjectsForUser() {
    this.projectService.list().then(projects => {
      this.projects = projects;

      this.sessionService.getSession().then(session => {
        const username = session.username();  // TODO: Handle cases where LF username and LD username differ
        this.userService.getProjectsForUser(username).then(result => {
          if (result.ok) {
            console.log('LD query result:', result.data);
            angular.forEach<[LdapiProjectInfo, string]>(result.data, ([ldapiProject, role]) => {
              const convertedRole = role ? role === 'Manager' ? 'project_manager' : role.toLowerCase() : '';
              console.log('LD project found with role', convertedRole, ':', ldapiProject);
              if (role === 'Manager') {
                role = 'project_manager';
              }
              const project: ViewModelProject = {
                id: ldapiProject.code,
                projectName: ldapiProject.name,
                appName: 'languagedepot',
                role: convertedRole,
              };
              if (this.isManager(project)) {
                this.projects.push(project);
                console.log('Was manager, so pushing');
              }
            });
          }
        }).catch(console.error);
      });

      // Is this perhaps wrong? Maybe not all projects are included in the JSONRPC response?
      // That might explain the existance of the previous result.data.count
      this.projectCount = projects.length;
      this.finishedLoading = true;
    }).catch(console.error);
  }

  isInProject(project: Project) {
    return (project.role !== 'none');
  }

  isManager(project: ViewModelProject) {
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
    if (this.projectTypesBySite().length === 1) {
      const appName = this.projectTypesBySite()[0];
      this.$window.location.href = '/app/' + appName + '/new-project';
    } else {
      this.newProjectCollapsed = !this.newProjectCollapsed;
    }
  }

}

export const ProjectsAppComponent: angular.IComponentOptions = {
  controller: ProjectsAppController,
  templateUrl: '/angular-app/bellows/apps/projects/projects-app.component.html'
};
