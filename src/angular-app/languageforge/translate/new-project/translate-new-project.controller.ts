import * as angular from 'angular';

import { InputSystemsService } from '../../../bellows/core/input-systems/input-systems.service';
import { LinkService } from '../../../bellows/core/link.service';
import { NoticeService } from '../../../bellows/core/notice/notice.service';
import { SessionCallback, SessionService } from '../../../bellows/core/session.service';
import { JsonRpcCallback, TranslateProjectService } from '../core/translate-project.service';
import { TranslateConfig, TranslateProject } from '../shared/model/translate-project.model';

export class InterfaceConfig {
  direction = 'ltr';
  pullNormal = 'float-left';
  pullToSide = 'float-right';
  placementNormal = 'right';
  placementToSide = 'left';
  userLanguageCode = 'en';
}

class NewProject extends TranslateProject {
  editProjectCode: boolean;
}

class Show {
  backButton: boolean;
  cloning: boolean;
  flexHelp: boolean;
  nextButton: boolean;
  step3: boolean;
}

export class TranslateNewProjectController implements angular.IController {
  formStatus: string;
  formStatusClass: string;
  formValidated: boolean;
  formValidationDefer: angular.IDeferred<boolean>;
  forwardBtnClass: string;
  interfaceConfig: InterfaceConfig;
  isSRProject: boolean;
  nextButtonLabel: string;
  newProject: NewProject;
  progressIndicatorStep1Label: string;
  progressIndicatorStep2Label: string;
  progressIndicatorStep3Label: string;
  project: TranslateProject;
  projectCodeState: string;
  projectCodeStateDefer: angular.IDeferred<string>;
  show: Show;

  private readonly bootstrapVersion = 'bootstrap4';

  // Shorthand to make things look a touch nicer
  private readonly ok = this.makeFormValid;
  private readonly neutral = this.makeFormNeutral;
  private readonly error = this.makeFormInvalid;

  static $inject = ['$scope', '$q',
    '$filter', '$window',
    '$state', 'sessionService',
    'silNoticeService', 'inputSystems',
    'translateProjectApi', 'linkService'
  ];
  constructor(private $scope: angular.IScope, private $q: angular.IQService,
              private $filter: angular.IFilterService, private $window: angular.IWindowService,
              private $state: angular.ui.IStateService, private sessionService: SessionService,
              private notice: NoticeService, private inputSystems: InputSystemsService,
              private projectApi: TranslateProjectService, private linkService: LinkService) {}

  $onInit() {
    this.interfaceConfig = new InterfaceConfig();
    this.sessionService.getSession().then(session => {
      if (session.projectSettings() != null && session.projectSettings().interfaceConfig != null) {
        angular.merge(this.interfaceConfig, session.projectSettings().interfaceConfig);
        if (this.inputSystems.isRightToLeft(this.interfaceConfig.userLanguageCode)) {
          this.interfaceConfig.direction = 'rtl';
          this.interfaceConfig.pullToSide = 'float-left';
          this.interfaceConfig.pullNormal = 'float-right';
          this.interfaceConfig.placementToSide = 'right';
          this.interfaceConfig.placementNormal = 'left';
        }
      }
    });

    this.newProject = new NewProject();
    this.newProject.appName = 'translate';

    this.show = new Show();
    this.show.nextButton = true;
    this.show.backButton = false;
    this.show.flexHelp = false;
    this.show.cloning = true;
    this.show.step3 = false;
    this.nextButtonLabel = this.$filter('translate')('Next');
    this.progressIndicatorStep1Label = this.$filter('translate')('Name');
    this.progressIndicatorStep2Label = this.$filter('translate')('Languages');
    this.progressIndicatorStep3Label = this.$filter('translate')('Verify');
    this.resetValidateProjectForm();

    this.$scope.$watch(() => {
      return this.projectCodeState;
    }, (newVal: string, oldVal: string) => {
      if (!newVal || newVal === oldVal) { return; }

      if (newVal === 'unchecked') {
        // User just typed in the project name box.
        // Need to wait just a bit for the idle-validate to kick in.
        return;
      }

      if (oldVal === 'loading') {
        // Project code state just resolved. Validate rest of form so Forward button can activate.
        this.validateForm();
      }
    });

    this.$scope.$watch(() => {
      return this.newProject.editProjectCode;
    }, (newVal: boolean, oldVal: boolean) => {
      if (oldVal && !newVal) {
        // When user unchecks the "edit project code" box, go back to setting it from project name
        this.newProject.projectCode = TranslateNewProjectController.projectNameToCode(this.newProject.projectName);
        this.checkProjectCode();
      }
    });

    this.$scope.$watch(() => {
      return this.newProject.projectName;
    }, (newVal: string, oldVal: string) => {
      if (!this.isSRProject) {
        if (angular.isUndefined(newVal)) {
          this.newProject.projectCode = '';
        } else if (newVal !== oldVal) {
          this.newProject.projectCode = newVal.toLowerCase().replace(/ /g, '_');
        }
      }
    });

  }

  private makeFormValid(msg: string = '') {
    this.formValidated = true;
    this.formStatus = msg;
    this.formStatusClass = 'alert alert-info';
    if (!msg) this.formStatusClass = (this.bootstrapVersion === 'bootstrap4' ? '' : 'neutral');
    this.forwardBtnClass = 'btn-success';
    this.formValidationDefer.resolve(true);
    return this.formValidationDefer.promise;
  }

  private makeFormNeutral(msg: string = '') {
    this.formValidated = false;
    this.formStatus = msg;
    this.formStatusClass = (this.bootstrapVersion === 'bootstrap4' ? '' : 'neutral');
    this.forwardBtnClass = (this.bootstrapVersion === 'bootstrap4' ? 'btn-std' : '');
    this.formValidationDefer = this.$q.defer();
    this.formValidationDefer.resolve(true);
    return this.formValidationDefer.promise;
  }

  private makeFormInvalid(msg: string = '') {
    this.formValidated = false;
    this.formStatus = msg;
    this.formStatusClass =
      (this.bootstrapVersion === 'bootstrap4' ? 'alert alert-danger' : 'alert alert-error');
    if (!msg) this.formStatusClass = (this.bootstrapVersion === 'bootstrap4' ? '' : 'neutral');
    this.forwardBtnClass = '';
    this.formValidationDefer.resolve(false);
    return this.formValidationDefer.promise;
  }

  resetValidateProjectForm() {
    this.makeFormNeutral();
    this.projectCodeState = 'unchecked';
    this.projectCodeStateDefer = this.$q.defer();
    this.projectCodeStateDefer.resolve('unchecked');
  }

  iconForStep(step: number) {
    const classes = [];
    if (this.$state.current.data.step > step) {
      classes.push(
        (this.bootstrapVersion === 'bootstrap4' ? 'fa fa-check-square' : 'icon-check-sign'));
    }

    if (this.$state.current.data.step === step) {
      classes.push((this.bootstrapVersion === 'bootstrap4' ? 'fa fa-square-o' : 'icon-check-empty'));
    } else if (this.$state.current.data.step < step) {
      classes.push(
        (this.bootstrapVersion === 'bootstrap4' ? 'fa fa-square-o muted' : 'icon-check-empty muted'));
    }

    return classes;
  }

  prevStep() {
    this.show.backButton = false;
    this.resetValidateProjectForm();
    switch (this.$state.current.name) {
      case 'newProject.name':
        break;
    }
  }

  nextStep() {
    this.validateForm().then((isValid: boolean) => {
      if (isValid) {
        this.gotoNextState();
      }
    });
  }

  // Form validation requires API calls, so it return a promise rather than a value.
  validateForm() {
    this.formValidationDefer = this.$q.defer();

    switch (this.$state.current.name) {
      case 'newProject.name':
        if (!this.newProject.projectName) {
          return this.error('Project Name cannot be empty. Please enter a project name.');
        }

        if (!this.newProject.projectCode) {
          return this.error('Project Code cannot be empty. ' +
            'Please enter a project code or uncheck "Edit project code".');
        }

        if (!this.newProject.appName) {
          return this.error('Please select a project type.');
        }

        if (this.projectCodeState === 'unchecked') {
          this.checkProjectCode();
        }

        return this.projectCodeStateDefer.promise.then(() => {
          switch (this.projectCodeState) {
            case 'ok':
              return this.ok();
            case 'exists':
              return this.error('Another project with code \'' + this.newProject.projectCode +
                '\' already exists.');
            case 'invalid':
              return this.error('Project Code must begin with a letter, ' +
                'and only contain lower-case letters, numbers, dashes and underscores.');
            case 'loading':
              return this.error();
            case 'empty':
              return this.neutral();
            default:

              // Project code state is unknown. Give a generic message,
              // adapted based on whether the user checked "Edit project code" or not.
              if (this.newProject.editProjectCode) {
                return this.error('Project code \'' + this.newProject.projectCode +
                  '\' cannot be used. Please choose a new project code.');
              } else {
                return this.error('Project code \'' + this.newProject.projectCode +
                  '\' cannot be used. Either change the project name, ' +
                  'or check the "Edit project code" box and choose a new code.');
              }
          }
        });
    }
    return this.ok();
  }

  private gotoNextState() {
    switch (this.$state.current.name) {
      case 'newProject.name':
        this.createProject();
        this.$state.go('newProject.languages');
        this.show.backButton = false;
        this.projectCodeState = 'empty';
        this.projectCodeStateDefer = this.$q.defer();
        this.projectCodeStateDefer.resolve('empty');
        this.makeFormNeutral();
        break;
      case 'newProject.languages':
        this.updateConfig(() => {
          this.gotoEditor();
        });
        break;
    }
  }

  private gotoEditor() {
    let url;
    this.makeFormValid();
    url = this.linkService.project(this.newProject.id, this.newProject.appName);
    this.$window.location.href = url;
  }

  // ----- Step 1: Project name -----

  private static projectNameToCode(name: string): string {
    if (angular.isUndefined(name)) return undefined;
    return name.toLowerCase().replace(/ /g, '_');
  }

  checkProjectCode() {
    this.projectCodeStateDefer = this.$q.defer();
    if (!this.projectApi.isValidProjectCode(this.newProject.projectCode)) {
      this.projectCodeState = 'invalid';
      this.projectCodeStateDefer.resolve('invalid');
    } else {
      this.projectCodeState = 'loading';
      this.projectCodeStateDefer.notify('loading');
      this.projectApi.projectCodeExists(this.newProject.projectCode, result => {
        if (result.ok) {
          if (result.data) {
            this.projectCodeState = 'exists';
            this.projectCodeStateDefer.resolve('exists');
          } else {
            this.projectCodeState = 'ok';
            this.projectCodeStateDefer.resolve('ok');
          }
        } else {
          this.projectCodeState = 'failed';
          this.projectCodeStateDefer.reject('failed');
        }
      });
    }

    return this.projectCodeStateDefer.promise;
  }

  private createProject(callback?: SessionCallback) {
    if (!this.newProject.projectName || !this.newProject.projectCode ||
      !this.newProject.appName) {
      // This function sometimes gets called during setup, when this.newProject is still empty.
      return;
    }

    this.projectApi.createSwitchSession(this.newProject.projectName,
      this.newProject.projectCode, this.newProject.appName, false, result => {
        if (result.ok) {
          this.newProject.id = result.data;
          this.project = this.newProject;
          this.project.config = new TranslateConfig();
          this.project.config.isTranslationDataShared = false;
          this.sessionService.getSession(true).then(callback);
        } else {
          this.notice.push(this.notice.ERROR, 'The ' + this.newProject.projectName +
            ' project could not be created. Please try again.');
        }
      });
  }

  // ----- Step 2: select source and target languages -----

  private updateConfig(callback?: JsonRpcCallback) {
    this.projectApi.updateConfig(this.project.config, result => {
      if (result.ok) {
        this.notice.push(this.notice.SUCCESS,
          this.project.projectName + ' configuration updated successfully.');
        if (callback != null) callback();
      } else {
        this.makeFormInvalid('Could not save languages for ' + this.project.projectName);
      }
    });
  }

  updateLanguage(docType: string, code: string, language: any) {
    this.project.config[docType] = this.project.config[docType] || {};
    this.project.config[docType].inputSystem.tag = code;
    this.project.config[docType].inputSystem.languageName = language.name;
  }

}
