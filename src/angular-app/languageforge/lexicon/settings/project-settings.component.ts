import * as angular from 'angular';

import {NoticeService} from '../../../bellows/core/notice/notice.service';
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

  static $inject = ['silNoticeService', 'lexProjectService'];
  constructor(private notice: NoticeService, private lexProjectService: LexiconProjectService) { }

  $onInit() {
    this.lexProjectService.setBreadcrumbs('settings', 'Project Settings');
  }

  $onChanges(changes: any) {
    if (changes.lpsProject != null && changes.lpsProject.currentValue != null) {
      this.project = angular.copy(changes.lpsProject.currentValue);
      this.lexProjectService.readProject(result => {
        if (result.ok) {
          angular.merge(this.project, result.data.project);
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
