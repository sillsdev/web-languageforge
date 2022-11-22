import * as angular from 'angular';

import {ApplicationHeaderService} from '../../../bellows/core/application-header.service';
import {NoticeService} from '../../../bellows/core/notice/notice.service';
import {Session, SessionService} from '../../../bellows/core/session.service';
import {InterfaceConfig} from '../../../bellows/shared/model/interface-config.model';
import {SemanticDomainsService} from '../../core/semantic-domains/semantic-domains.service';
import {LexiconProjectService} from '../core/lexicon-project.service';
import {Rights} from '../core/lexicon-rights.service';
import {LexiconProject} from '../shared/model/lexicon-project.model';

export class LexiconProjectSettingsController implements angular.IController {
  lpsProject: LexiconProject;
  lpsRights: Rights;
  lpsInterfaceConfig: InterfaceConfig;
  lpsOnUpdate: (params: { $event: { project: LexiconProject } }) => void;

  project: LexiconProject = {} as LexiconProject;
  actionInProgress: boolean = false;
  session: Session;

  static $inject = ['applicationHeaderService',
    'silNoticeService', 'sessionService',
    'semanticDomainsService',
    'lexProjectService'];
  constructor(private readonly applicationHeaderService: ApplicationHeaderService,
              private readonly notice: NoticeService,
              private readonly sessionService: SessionService,
              private readonly semanticDomains: SemanticDomainsService,
              private readonly lexProjectService: LexiconProjectService) {

              }

  async $onInit(): Promise<void> {
    this.lexProjectService.setBreadcrumbs('settings', 'Project Settings');
    this.lexProjectService.setupSettings();

    await this.sessionService.getSession().then((s) => {
      this.session = s;
    });

  }

  $onChanges(changes: any) {
    if (changes.lpsProject != null && changes.lpsProject.currentValue != null) {
      this.project = angular.copy(changes.lpsProject.currentValue);
      this.lexProjectService.readProject(result => {
        if (result.ok) {
          angular.merge(this.project, result.data.project);
          this.applicationHeaderService.setPageName(this.project.projectName + ' Settings');
        }
      });
    }
  }

  updateProject() {
    const settings = {
      projectName: this.project.projectName,
      interfaceLanguageCode: this.project.interfaceLanguageCode,
      featured: this.project.featured
    };

    if (this.project.interfaceLanguageCode !== this.lpsProject.interfaceLanguageCode &&
      !this.lpsInterfaceConfig.isUserLanguageCode
    ) {
      this.semanticDomains.setLanguageCode(this.project.interfaceLanguageCode);
    }

    this.lexProjectService.updateProject(settings).then(result => {
      if (result.ok) {
        this.lpsOnUpdate({ $event: { project: this.project } });
        this.notice.push(this.notice.SUCCESS, this.project.projectName + ' settings updated successfully.');
      }
    });
  }

  currentUserIsOwnerOrAdmin(): boolean {
    if (typeof this.project.ownerRef == 'object') {
      return (this.project.ownerRef.id === this.session.data.userId) || this.sessionService.userIsAdmin();
    }
    return false;
  }

}

export const LexiconProjectSettingsComponent: angular.IComponentOptions = {
  bindings: {
    lpsProject: '<',
    lpsRights: '<',
    lpsInterfaceConfig: '<',
    lpsOnUpdate: '&'
  },
  controller: LexiconProjectSettingsController,
  templateUrl: '/angular-app/languageforge/lexicon/settings/project-settings.component.html'
};
