import * as angular from 'angular';

import { NoticeService } from '../../../bellows/core/notice/notice.service';
import { TranslateProjectService } from '../core/translate-project.service';
import { Rights } from '../core/translate-rights.service';
import { TranslateProject } from '../shared/model/translate-project.model';
import { TranslateUtilities } from '../shared/translate-utilities';

export class TranslateSettingsController implements angular.IController {
  tscProject: TranslateProject;
  tscRights: Rights;
  tscInterfaceConfig: any;
  tscOnUpdate: (params: { $event: { project: any } }) => void;

  actionInProgress: boolean;
  confidence: any;
  project: TranslateProject;
  rights: Rights;
  interfaceConfig: any;

  static $inject = ['$scope', '$interval',
    'silNoticeService', 'translateProjectApi'
  ];
  constructor(private $scope: angular.IScope, private $interval: angular.IIntervalService,
              private notice: NoticeService, private projectApi: TranslateProjectService) {}

  $onChanges(changes: any) {
    if (changes.tscRights != null && changes.tscRights.currentValue != null) {
      this.rights = angular.copy(changes.tscRights.currentValue);
    }

    if (changes.tscInterfaceConfig != null && changes.tscInterfaceConfig.currentValue != null) {
      this.interfaceConfig = angular.copy(changes.tscInterfaceConfig.currentValue);
    }

    if (changes.tscProject.isFirstChange()) {
      this.actionInProgress = false;
      // noinspection JSUnusedGlobalSymbols
      this.confidence = {
        value: undefined,
        options: {
          floor: 0,
          ceil: 1,
          step: 0.01,
          precision: 2,
          showSelectionBar: true,
          getSelectionBarColor: (value: number) => {
            return TranslateUtilities.sliderColor(value);
          },
          translate: (value: number) => {
            switch (value) {
              case 0:
                return 'most suggestions';
              case 1:
                return 'better phrases';
              default:
                return Math.round(value * 100) + '%';
            }
          }
        }
      };
    }

    if (changes.tscProject != null && changes.tscProject.currentValue != null) {
      this.project = angular.copy(changes.tscProject.currentValue);
      this.confidence.value = this.project.config.confidenceThreshold;
      if (angular.isUndefined(this.project.config.isTranslationDataShared) ||
        this.project.config.isTranslationDataShared === ''
      ) {
        this.project.config.isTranslationDataShared = true;
      }
    }
  }

  updateProject() {
    this.project.config.confidenceThreshold = this.confidence.value;
    const projectData = {
      id: this.project.id,
      projectName: this.project.projectName,
      interfaceLanguageCode: this.project.interfaceLanguageCode,
      featured: this.project.featured,
      config: this.project.config
    };

    this.projectApi.updateProject(projectData).then(result => {
      if (result.ok) {
        this.project.id = result.data;
        if (this.tscOnUpdate) this.tscOnUpdate({ $event: { project: this.project } });
        this.notice.push(this.notice.SUCCESS,
          this.project.projectName + ' settings updated successfully.');
      }
    });
  }

  // noinspection JSUnusedGlobalSymbols
  updateLanguage(docType: string, code: string, language: any) {
    this.project.config[docType] = this.project.config[docType] || {};
    this.project.config[docType].inputSystem.tag = code;
    this.project.config[docType].inputSystem.languageName = language.name;
  }

  // noinspection JSUnusedGlobalSymbols
  redrawSlider() {
    this.$interval(() => this.$scope.$broadcast('rzSliderForceRender'), 0, 1);
  }

}

export const TranslateSettingsComponent: angular.IComponentOptions = {
  bindings: {
    tscProject: '<',
    tscRights: '<',
    tscInterfaceConfig: '<',
    tscOnUpdate: '&'
  },
  templateUrl: '/angular-app/languageforge/translate/settings/settings.component.html',
  controller: TranslateSettingsController
};
