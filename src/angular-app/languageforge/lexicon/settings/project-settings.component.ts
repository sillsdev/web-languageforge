import * as angular from 'angular';

import {ApplicationHeaderService} from '../../../bellows/core/application-header.service';
import {NoticeService} from '../../../bellows/core/notice/notice.service';
import {SessionService} from '../../../bellows/core/session.service';
import {LexiconProjectService} from '../core/lexicon-project.service';
import {Rights} from '../core/lexicon-rights.service';
import {LexiconProject} from '../shared/model/lexicon-project.model';

export class LexiconProjectSettingsController implements angular.IController {
  lpsProject: LexiconProject;
  lpsRights: Rights;
  lpsInterfaceConfig: any;
  lpsOnUpdate: (params: { $event: { project: any } }) => void;

  project: any = {};
  actionInProgress: boolean = false;

  static $inject = ['silNoticeService', 'lexProjectService',
                    'sessionService', 'applicationHeaderService'];
  constructor(private notice: NoticeService, private lexProjectService: LexiconProjectService,
              private sessionService: SessionService, private applicationHeaderService: ApplicationHeaderService) { }

  $onInit() {
    this.lexProjectService.setBreadcrumbs('settings', 'Project Settings');
    this.lexProjectService.setupSettings();
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

    this.lexProjectService.updateProject(settings, result => {
      if (result.ok) {
        this.lpsOnUpdate({ $event: { project: this.project } });
        this.lexProjectService.setBreadcrumbs('settings', 'Project Settings', true);
        this.lexProjectService.setupSettings();
        this.notice.push(this.notice.SUCCESS, this.project.projectName + ' settings updated successfully.');
      }
    });
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
