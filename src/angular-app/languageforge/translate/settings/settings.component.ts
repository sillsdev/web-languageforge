import * as angular from 'angular';

import { MachineService } from '../core/machine.service';
import { ModalService } from '../../../bellows/core/modal/modal.service';
import { NoticeService } from '../../../bellows/core/notice/notice.service';
import { SessionService } from '../../../bellows/core/session.service';
import { TranslateProjectService } from '../core/translate-project.service';
import { Rights, TranslateRightsService } from '../core/translate-rights.service';

export class TranslateSettingsController implements angular.IController {
  tscOnUpdate: (params: { $event: { project: any } }) => void;

  actionInProgress: boolean;
  retrainMessage: string;
  confidence: any;
  project: any;
  rights: Rights;

  private pristineProject: any;

  static $inject = ['$scope', '$interval',
    'silNoticeService', 'sessionService',
    'translateRightsService',
    'translateProjectApi', 'machineService',
    'modalService', '$q'
  ];
  constructor(private $scope: angular.IScope, private $interval: angular.IIntervalService,
              private notice: NoticeService, private sessionService: SessionService,
              private rightsService: TranslateRightsService,
              private projectApi: TranslateProjectService, private machineService: MachineService,
              private modal: ModalService, private $q: angular.IQService) {}

  $onInit() {
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

    this.$q.all([this.sessionService.getSession(), this.rightsService.getRights(),
      this.projectApi.readProject()
    ]).then((data) => {
      let session = data[0];
      let rights = data[1];
      let readProjectResult = data[2];

      this.project = session.project();
      this.rights = rights;

      if (readProjectResult.ok) {
        angular.merge(this.project, readProjectResult.data.project);
        this.project.config = this.project.config || {};
        this.pristineProject = angular.copy(this.project);
        this.machineService.initialise(this.project.slug);
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
    });
  };

  $onDestroy() {
    angular.copy(this.pristineProject, this.project);
  };

  updateProject() {
    this.updateConfigConfidenceValues();
    let projectData = {
      id: this.project.id,
      projectName: this.project.projectName,
      interfaceLanguageCode: this.project.interfaceLanguageCode,
      featured: this.project.featured,
      config: this.project.config
    };

    this.projectApi.updateProject(projectData).then((result) => {
      if (result.ok) {
        this.project.id = result.data;
        this.machineService.initialise(this.project.slug);
        this.pristineProject = angular.copy(this.project);
        if (this.tscOnUpdate) this.tscOnUpdate({ $event: { project: this.project } });
        this.notice.push(this.notice.SUCCESS,
          this.project.projectName + ' settings updated successfully.');
      }
    });
  };

  updateConfig() {
    if (this.rights.canEditProject()) {
      this.updateProject();
    } else if (this.rights.canEditEntry()) {
      this.updateConfigConfidenceValues();
      this.projectApi.updateUserPreferences(this.project.config.userPreferences).then((result) => {
        if (result.ok) {
          this.pristineProject.config.userPreferences =
            angular.copy(this.project.config.userPreferences);
          if (this.tscOnUpdate) this.tscOnUpdate({ $event: { project: this.project } });
          this.notice.push(this.notice.SUCCESS,
            this.project.projectName + ' confidence updated successfully.');
        }
      });
    }
  };

  retrain() {
    const retrainMessage = 'This will retrain the translation engine using the existing data. ' +
      'This can take several minutes and will operate in the background.<br /><br />' +
      'Are you sure you want to retrain the translation engine?';
    this.modal.showModalSimple('Retrain Translation Engine?', retrainMessage, 'Cancel', 'Retrain')
      .then(() => {
        this.machineService.train(this.onTrainStatusUpdate, this.onTrainFinished);
      }, angular.noop);
  };

  updateLanguage(docType: string, code: string, language: any) {
    this.project.config[docType] = this.project.config[docType] || {};
    this.project.config[docType].inputSystem.tag = code;
    this.project.config[docType].inputSystem.languageName = language.name;
  };

  redrawSlider() {
    this.$interval(() => {
      this.$scope.$broadcast('rzSliderForceRender');
    }, 0, 1);
  };

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
  };

  private onTrainStatusUpdate(progress: any) {
    this.$scope.$applyAsync(() => {
      this.retrainMessage = progress.percentCompleted + '% ' + progress.currentStepMessage;
    });
  };

  private onTrainSuccess(isSuccess: boolean) {
    if (isSuccess) {
      this.$scope.$applyAsync(() => {
        this.notice.push(this.notice.SUCCESS, 'Finished re-training the translation engine');
      });
    }
  };

  private onTrainFinished(isSuccess: boolean) {
    this.onTrainSuccess(isSuccess);
    if (!isSuccess) {
      this.$scope.$applyAsync(() => {
        this.notice.push(this.notice.ERROR, 'Could not re-train the translation engine');
      });
    }
  };

  private convertThresholdToValue(threshold: number): number {
    let range = this.confidence.options.ceil - this.confidence.options.floor;
    return this.confidence.options.floor + threshold * range;
  };

  private convertValueToThreshold(value: number): number {
    let range = this.confidence.options.ceil - this.confidence.options.floor;
    return (value - this.confidence.options.floor) / range;
  };

  private updateConfigConfidenceValues() {
    this.project.config.userPreferences = this.project.config.userPreferences || {};
    this.project.config.userPreferences.hasConfidenceOverride = this.confidence.isMyThreshold;
    if (this.confidence.isMyThreshold) {
      this.project.config.userPreferences.confidenceThreshold =
        this.convertValueToThreshold(this.confidence.value);
    } else {
      this.project.config.confidenceThreshold =
        this.convertValueToThreshold(this.confidence.value);
    }
  };

}

export const TranslateSettingsComponent = {
  bindings: {
    tscOnUpdate: '&'
  },
  templateUrl: '/angular-app/languageforge/translate/settings/settings.component.html',
  controller: TranslateSettingsController
};
