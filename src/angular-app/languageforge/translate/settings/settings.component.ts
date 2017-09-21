import * as angular from 'angular';

import { ModalService } from '../../../bellows/core/modal/modal.service';
import { NoticeService } from '../../../bellows/core/notice/notice.service';
import { MachineService } from '../core/machine.service';
import { TranslateProjectService } from '../core/translate-project.service';
import { Rights } from '../core/translate-rights.service';
import { TranslateProject, TranslateUserPreferences } from '../shared/model/translate-project.model';

export class TranslateSettingsController implements angular.IController {
  tscProject: TranslateProject;
  tscRights: Rights;
  tscInterfaceConfig: any;
  tscOnUpdate: (params: { $event: { project: any } }) => void;

  actionInProgress: boolean;
  retrainMessage: string;
  confidence: any;
  project: TranslateProject;
  rights: Rights;
  interfaceConfig: any;

  static $inject = ['$scope', '$interval',
    'silNoticeService', 'translateProjectApi',
    'machineService', 'modalService'
  ];
  constructor(private $scope: angular.IScope, private $interval: angular.IIntervalService,
              private notice: NoticeService, private projectApi: TranslateProjectService,
              private machineService: MachineService, private modal: ModalService) {}

  $onChanges(changes: any) {
    if (changes.tscRights) {
      this.rights = angular.copy(changes.tscRights.currentValue);
    }

    if (changes.tscInterfaceConfig) {
      this.interfaceConfig = angular.copy(changes.tscInterfaceConfig.currentValue);
    }

    if (changes.tscProject) {
      this.project = angular.copy(changes.tscProject.currentValue);
      if (changes.tscProject.isFirstChange()) {
        this.actionInProgress = false;
        this.retrainMessage = '';
        this.confidence = {
          value: undefined,
          isMyThreshold: false,
          options: {
            floor: 0,
            ceil: 100,
            step: 1,
            showSelectionBar: true,
            translate: (value: number) => {
              return value + '%';
            }
          }
        };
      }

      this.machineService.initialise(this.project.slug, this.project.config.isTranslationDataScripture);
      this.machineService.listenForTrainingStatus(this.onTrainStatusUpdate, this.onTrainSuccess);
      if (angular.isDefined(this.project.config.userPreferences)) {
        if (angular.isDefined(this.project.config.userPreferences.hasConfidenceOverride)) {
          this.confidence.isMyThreshold =
            this.project.config.userPreferences.hasConfidenceOverride;
        }
        if (angular.isUndefined(this.project.config.userPreferences.confidenceThreshold) ||
          !(isFinite(this.project.config.userPreferences.confidenceThreshold) &&
            angular.isNumber(this.project.config.userPreferences.confidenceThreshold))
        ) {
          this.project.config.userPreferences.confidenceThreshold =
            this.project.config.confidenceThreshold;
        }
      }
      this.selectWhichConfidence();
      if (angular.isUndefined(this.project.config.isTranslationDataShared) ||
        this.project.config.isTranslationDataShared === ''
      ) {
        this.project.config.isTranslationDataShared = true;
      }
    }
  }

  updateProject() {
    this.updateConfigConfidenceValues();
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
        this.machineService.initialise(this.project.slug, this.project.config.isTranslationDataScripture);
        if (this.tscOnUpdate) this.tscOnUpdate({ $event: { project: this.project } });
        this.notice.push(this.notice.SUCCESS,
          this.project.projectName + ' settings updated successfully.');
      }
    });
  }

  updateConfig() {
    if (this.rights.canEditProject()) {
      this.updateProject();
    } else if (this.rights.canEditEntry()) {
      this.updateConfigConfidenceValues();
      this.projectApi.updateUserPreferences(this.project.config.userPreferences).then(result => {
        if (result.ok) {
          if (this.tscOnUpdate) this.tscOnUpdate({ $event: { project: this.project } });
          this.notice.push(this.notice.SUCCESS,
            this.project.projectName + ' confidence updated successfully.');
        }
      });
    }
  }

  retrain() {
    const retrainMessage = 'This will retrain the translation engine using the existing data. ' +
      'This can take several minutes and will operate in the background.<br /><br />' +
      'Are you sure you want to retrain the translation engine?';
    this.modal.showModalSimple('Retrain Translation Engine?', retrainMessage, 'Cancel', 'Retrain')
      .then(() => {
        this.machineService.train(this.onTrainStatusUpdate, this.onTrainFinished);
      }, angular.noop);
  }

  // noinspection JSUnusedGlobalSymbols
  updateLanguage(docType: string, code: string, language: any) {
    this.project.config[docType] = this.project.config[docType] || {};
    this.project.config[docType].inputSystem.tag = code;
    this.project.config[docType].inputSystem.languageName = language.name;
  }

  // noinspection JSUnusedGlobalSymbols
  redrawSlider() {
    this.$interval(() => {
      this.$scope.$broadcast('rzSliderForceRender');
    }, 0, 1);
  }

  selectWhichConfidence() {
    this.confidence.options.disabled = !this.confidence.isMyThreshold &&
      !this.rights.canEditProject();
    if (this.confidence.isMyThreshold) {
      if (angular.isDefined(this.confidence.value) && isFinite(this.confidence.value)) {
        this.project.config.confidenceThreshold =
          this.convertValueToThreshold(this.confidence.value);
        delete this.confidence.value;
      }

      this.confidence.value =
        this.convertThresholdToValue(this.project.config.userPreferences.confidenceThreshold);
    } else {
      if (angular.isDefined(this.confidence.value) && isFinite(this.confidence.value)) {
        this.project.config.userPreferences.confidenceThreshold =
          this.convertValueToThreshold(this.confidence.value);
        delete this.confidence.value;
      }

      this.confidence.value =
        this.convertThresholdToValue(this.project.config.confidenceThreshold);
    }
  }

  private onTrainStatusUpdate(progress: any) {
    this.$scope.$applyAsync(() => {
      this.retrainMessage = progress.percentCompleted + '% ' + progress.currentStepMessage;
    });
  }

  private onTrainSuccess(isSuccess: boolean) {
    if (isSuccess) {
      this.$scope.$applyAsync(() => {
        this.notice.push(this.notice.SUCCESS, 'Finished re-training the translation engine');
      });
    }
  }

  private onTrainFinished(isSuccess: boolean) {
    this.onTrainSuccess(isSuccess);
    if (!isSuccess) {
      this.$scope.$applyAsync(() => {
        this.notice.push(this.notice.ERROR, 'Could not re-train the translation engine');
      });
    }
  }

  private convertThresholdToValue(threshold: number): number {
    const range = this.confidence.options.ceil - this.confidence.options.floor;
    return this.confidence.options.floor + threshold * range;
  }

  private convertValueToThreshold(value: number): number {
    const range = this.confidence.options.ceil - this.confidence.options.floor;
    return (value - this.confidence.options.floor) / range;
  }

  private updateConfigConfidenceValues() {
    this.project.config.userPreferences = this.project.config.userPreferences || new TranslateUserPreferences();
    this.project.config.userPreferences.hasConfidenceOverride = this.confidence.isMyThreshold;
    if (this.confidence.isMyThreshold) {
      this.project.config.userPreferences.confidenceThreshold =
        this.convertValueToThreshold(this.confidence.value);
    } else {
      this.project.config.confidenceThreshold =
        this.convertValueToThreshold(this.confidence.value);
    }
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
