import * as angular from 'angular';

import { InputSystemsService } from '../../../core/input-systems/input-systems.service';
import { LinkService } from '../../../core/link.service';
import { NoticeService } from '../../../core/notice/notice.service';
import { SessionService } from '../../../core/session.service';
import { InputSystem } from '../../../shared/model/input-system.model';
import { InterfaceConfig } from '../../../shared/model/interface-config.model';
import { ParatextProject, ParatextUserInfo } from '../../../shared/model/paratext-user-info.model';
import { MachineService } from '../core/machine.service';
import { ParatextService } from '../core/paratext.service';
import { TranslateProjectService } from '../core/translate-project.service';
import { TranslateSendReceiveService } from '../core/translate-send-receive.service';
import { TranslateConfig, TranslateConfigDocType } from '../shared/model/translate-config.model';
import { TranslateProjectSettings } from '../shared/model/translate-project-settings.model';
import { TranslateProject } from '../shared/model/translate-project.model';

interface NewProject extends TranslateProject {
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
  projectCodeState: string;
  projectCodeStateDefer: angular.IDeferred<string>;
  show: Show;
  paratextUserInfo: ParatextUserInfo;
  isRetrievingParatextUserInfo: boolean = false;
  sourceParatextProject: ParatextProject;
  targetParatextProject: ParatextProject;

  // Shorthand to make things look a touch nicer
  private readonly ok = this.makeFormValid;
  private readonly neutral = this.makeFormNeutral;
  private readonly error = this.makeFormInvalid;

  static $inject = ['$scope', '$state',
    '$q', '$window',
    'sessionService', 'silNoticeService',
    'translateProjectApi', 'linkService',
    'machineService',
    'translateSendReceiveService',
    'paratextService'
  ];
  constructor(private readonly $scope: angular.IScope, private readonly $state: angular.ui.IStateService,
              private readonly $q: angular.IQService, private readonly $window: angular.IWindowService,
              private readonly sessionService: SessionService, private readonly notice: NoticeService,
              private readonly projectApi: TranslateProjectService, private readonly linkService: LinkService,
              private readonly machine: MachineService,
              private readonly translateSendReceiveService: TranslateSendReceiveService,
              private readonly paratextService: ParatextService) {}

  $onInit() {
    this.interfaceConfig = new InterfaceConfig();
    this.sessionService.getSession().then(session => {
      const projectSettings = session.projectSettings<TranslateProjectSettings>();
      if (projectSettings != null && projectSettings.interfaceConfig != null) {
        angular.merge(this.interfaceConfig, projectSettings.interfaceConfig);
        if (InputSystemsService.isRightToLeft(this.interfaceConfig.languageCode)) {
          this.interfaceConfig.direction = 'rtl';
          this.interfaceConfig.pullToSide = 'float-left';
          this.interfaceConfig.pullNormal = 'float-right';
          this.interfaceConfig.placementToSide = 'right';
          this.interfaceConfig.placementNormal = 'left';
        }
      }
    });

    this.newProject = {} as NewProject;
    this.newProject.config = new TranslateConfig();
    this.newProject.appName = 'translate';
    this.newProject.config.isTranslationDataShared = false;

    this.isSRProject = false;
    this.show = new Show();
    this.show.nextButton = this.$state.current.name !== 'newProject.chooser';
    this.show.backButton = false;
    this.show.flexHelp = false;
    this.show.cloning = true;
    this.show.step3 = true;
    this.nextButtonLabel = 'Next';
    this.progressIndicatorStep1Label = 'Name';
    this.progressIndicatorStep2Label = 'Languages';
    this.progressIndicatorStep3Label = 'Verify';
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
      if (angular.isUndefined(newVal)) {
        this.newProject.projectCode = '';
      } else if (newVal !== oldVal) {
        this.newProject.projectCode = newVal.toLowerCase().replace(/ /g, '_');
      }
    });

  }

  private makeFormValid(msg: string = '') {
    this.formValidated = true;
    this.formStatus = msg;
    this.formStatusClass = 'alert alert-info';
    if (!msg) this.formStatusClass = '';
    this.forwardBtnClass = 'btn-success';
    this.formValidationDefer.resolve(true);
    return this.formValidationDefer.promise;
  }

  private makeFormNeutral(msg: string = '') {
    this.formValidated = false;
    this.formStatus = msg;
    this.formStatusClass = '';
    this.forwardBtnClass = 'btn-std';
    this.formValidationDefer = this.$q.defer();
    this.formValidationDefer.resolve(true);
    return this.formValidationDefer.promise;
  }

  private makeFormInvalid(msg: string = '') {
    this.formValidated = false;
    this.formStatus = msg;
    this.formStatusClass = 'alert alert-danger';
    if (!msg) this.formStatusClass = '';
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

  getProjectFromInternet() {
    this.$state.go('newProject.name');
    this.isSRProject = true;
    this.show.nextButton = true;
    this.show.backButton = true;
    this.nextButtonLabel = 'Next';
    this.progressIndicatorStep2Label = 'Connect';
    this.resetValidateProjectForm();
  }

  createNew() {
    this.$state.go('newProject.name');
    this.isSRProject = false;
    this.show.nextButton = true;
    this.show.backButton = true;
    this.nextButtonLabel = 'Next';
    this.progressIndicatorStep2Label = 'Languages';
  }

  iconForStep(step: number) {
    const classes = [];
    if (this.$state.current.data.step > step) {
      classes.push('fa fa-check-square');
    }

    if (this.$state.current.data.step === step) {
      classes.push('fa fa-square-o');
    } else if (this.$state.current.data.step < step) {
      classes.push('fa fa-square-o text-muted');
    }

    return classes;
  }

  prevStep() {
    this.resetValidateProjectForm();
    switch (this.$state.current.name) {
      case 'newProject.sendReceiveCredentials':
        this.$state.go('newProject.name');
        this.nextButtonLabel = 'Next';
        break;
      case 'newProject.name':
        this.$state.go('newProject.chooser');
        this.show.backButton = false;
        this.show.nextButton = false;
        break;
      case 'newProject.languages':
        this.$state.go('newProject.name');
        break;
    }
  }

  nextStep() {
    this.validateForm().then(isValid => {
      if (isValid) {
        this.gotoNextState();
      }
    });
  }

  // Form validation requires API calls, so it return a promise rather than a value.
  validateForm() {
    this.formValidationDefer = this.$q.defer();

    switch (this.$state.current.name) {
      case 'newProject.chooser':
        return this.error();
      case 'newProject.sendReceiveCredentials':
        return this.validateSendReceiveCredentialsForm();
      case 'newProject.sendReceiveClone':
        return this.error();
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

  private validateSendReceiveCredentialsForm(): angular.IPromise<boolean> {
    if (this.paratextService.isSigningIn) {
      return this.error();
    }

    if (!this.isSignedIntoParatext) {
      return this.error();
    }

    if (this.sourceParatextProject == null || this.targetParatextProject == null) {
      return this.error();
    }

    if (this.sourceParatextProject.id === this.targetParatextProject.id) {
      return this.error('The source and target projects cannot be the same.');
    }

    return this.ok();
  }

  private gotoNextState() {
    switch (this.$state.current.name) {
      case 'newProject.sendReceiveCredentials':
        this.$state.go('newProject.sendReceiveClone');
        this.show.backButton = false;
        this.show.cloning = true;
        this.show.nextButton = false;
        this.resetValidateProjectForm();

        this.newProject.config.isTranslationDataScripture = true;
        this.updateConfigForParatextProject('source', this.sourceParatextProject);
        this.updateConfigForParatextProject('target', this.targetParatextProject);

        this.createProject()
          .then(() => this.updateConfig())
          .then(() => this.translateSendReceiveService.startClone())
          .then(() => {
            this.machine.initialise(this.newProject.id);
            return this.machine.startTraining();
          }).then(() => this.gotoEditor());
        break;
      case 'newProject.sendReceiveClone':
        break;
      case 'newProject.name':
        this.$state.go(this.isSRProject ? 'newProject.sendReceiveCredentials' : 'newProject.languages');
        this.projectCodeState = 'empty';
        this.projectCodeStateDefer = this.$q.defer();
        this.projectCodeStateDefer.resolve('empty');
        this.nextButtonLabel = this.isSRProject ? 'Get Started' : 'Next';
        this.makeFormNeutral();
        if (this.isSRProject) {
          this.isRetrievingParatextUserInfo = true;
          this.paratextService.getUserInfo()
            .then(pui => this.paratextUserInfo = pui)
            .finally(() => this.isRetrievingParatextUserInfo = false);
        }
        break;
      case 'newProject.languages':
        this.createProject()
          .then(() => this.updateConfig())
          .then(() => this.gotoEditor());
        break;
    }
  }

  private gotoEditor() {
    let url;
    this.makeFormValid();
    url = this.linkService.project(this.newProject.id, this.newProject.appName);
    this.$window.location.href = url;
  }

  // ----- Step 1: Get S/R credentials -----

  get isSignedIntoParatext(): boolean {
    return this.paratextUserInfo != null;
  }

  signIntoParatext(): void {
    this.isRetrievingParatextUserInfo = true;
    this.paratextService.signIn()
      .then(pui => this.paratextUserInfo = pui)
      .finally(() => this.isRetrievingParatextUserInfo = false);
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

  // ----- Step 2: select source and target languages -----

  updateLanguage(docType: string, code: string, language: any) {
    const configDocType: TranslateConfigDocType = this.newProject.config[docType] || new TranslateConfigDocType();
    if (configDocType.inputSystem == null) {
      configDocType.inputSystem = new InputSystem();
    }
    configDocType.inputSystem.tag = code;
    configDocType.inputSystem.languageName = language.name;
    this.newProject.config[docType] = configDocType;
  }

  // ----- Project creation -----

  private updateConfigForParatextProject(docType: string, paratextProject: ParatextProject): void {
    const configDocType: TranslateConfigDocType = this.newProject.config[docType] || new TranslateConfigDocType();
    configDocType.paratextProject = paratextProject;
    if (configDocType.inputSystem == null) {
      configDocType.inputSystem = new InputSystem();
    }
    configDocType.inputSystem.tag = paratextProject.languageTag;
    configDocType.inputSystem.languageName = paratextProject.languageName;
    this.newProject.config[docType] = configDocType;
  }

  private createProject(): angular.IPromise<void> {
    if (!this.newProject.projectName || !this.newProject.projectCode ||
      !this.newProject.appName) {
      // This function sometimes gets called during setup, when this.newProject is still empty.
      return this.$q.resolve();
    }

    return this.projectApi.createSwitchSession(this.newProject.projectName,
      this.newProject.projectCode, this.newProject.appName, false
    ).then(result => {
      if (result.ok) {
        this.newProject.id = result.data;
        return this.sessionService.getSession(true).then(() => { });
      } else {
        this.notice.push(this.notice.ERROR, 'The ' + this.newProject.projectName +
          ' project could not be created. Please try again.');
        return this.$q.reject();
      }
    });
  }

  private updateConfig(): angular.IPromise<void> {
    return this.projectApi.updateConfig(this.newProject.config).then(result => {
      if (!result.ok) {
        this.makeFormInvalid('Could not save languages for ' + this.newProject.projectName);
        return this.$q.reject();
      }
    });
  }
}
