import * as angular from 'angular';

import { UserRestApiService } from '../../../bellows/core/api/user-rest-api.service';
import { InputSystemsService } from '../../../bellows/core/input-systems/input-systems.service';
import { LinkService } from '../../../bellows/core/link.service';
import { NoticeService } from '../../../bellows/core/notice/notice.service';
import { SessionCallback, SessionService } from '../../../bellows/core/session.service';
import { ParatextProject, ParatextUserInfo } from '../../../bellows/shared/model/paratext-user-info.model';
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
  projectCodeState: string;
  projectCodeStateDefer: angular.IDeferred<string>;
  show: Show;
  paratextUserInfo: ParatextUserInfo;
  sourceProject: ParatextProject;
  targetProject: ParatextProject;
  isRetrievingParatextUserInfo: boolean = false;

  private readonly bootstrapVersion = 'bootstrap4';

  // Shorthand to make things look a touch nicer
  private readonly ok = this.makeFormValid;
  private readonly neutral = this.makeFormNeutral;
  private readonly error = this.makeFormInvalid;
  private paratextSignInWindow: Window;

  static $inject = ['$scope', '$q',
    '$filter', '$window',
    '$state', 'sessionService',
    'silNoticeService', 'inputSystems',
    'translateProjectApi', 'linkService',
    'userRestApiService'
  ];
  constructor(private $scope: angular.IScope, private $q: angular.IQService,
              private $filter: angular.IFilterService, private $window: angular.IWindowService,
              private $state: angular.ui.IStateService, private sessionService: SessionService,
              private notice: NoticeService, private inputSystems: InputSystemsService,
              private projectApi: TranslateProjectService, private linkService: LinkService,
              private userRestApiService: UserRestApiService) {}

  $onInit() {
    this.interfaceConfig = new InterfaceConfig();
    this.sessionService.getSession().then(session => {
      if (session.projectSettings() != null && session.projectSettings().interfaceConfig != null) {
        angular.merge(this.interfaceConfig, session.projectSettings().interfaceConfig);
        if (InputSystemsService.isRightToLeft(this.interfaceConfig.userLanguageCode)) {
          this.interfaceConfig.direction = 'rtl';
          this.interfaceConfig.pullToSide = 'float-left';
          this.interfaceConfig.pullNormal = 'float-right';
          this.interfaceConfig.placementToSide = 'right';
          this.interfaceConfig.placementNormal = 'left';
        }
      }
    });

    this.newProject = new NewProject();
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

  getProjectFromInternet() {
    this.$state.go('newProject.name');
    this.isSRProject = true;
    this.show.nextButton = true;
    this.show.backButton = true;
    this.nextButtonLabel = this.$filter('translate')('Next');
    this.progressIndicatorStep2Label = this.$filter('translate')('Connect');
    this.resetValidateProjectForm();
    this.getParatextUserInfo();
  }

  createNew() {
    this.$state.go('newProject.name');
    this.isSRProject = false;
    this.show.nextButton = true;
    this.show.backButton = true;
    this.nextButtonLabel = this.$filter('translate')('Next');
    this.progressIndicatorStep2Label = this.$filter('translate')('Languages');
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
    this.resetValidateProjectForm();
    switch (this.$state.current.name) {
      case 'newProject.sendReceiveCredentials':
        this.$state.go('newProject.name');
        this.nextButtonLabel = this.$filter('translate')('Next');
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
    if (this.paratextSignInWindow != null && !this.paratextSignInWindow.closed) {
      return this.error();
    }

    if (!this.isSignedIntoParatext) {
      return this.error('Please sign into ParaTExt.');
    }

    if (this.sourceProject == null || this.targetProject == null) {
      return this.error();
    }

    if (this.sourceProject.id === this.targetProject.id) {
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
        this.createProject().then(success => {
          if (success) {
            // TODO: start send/receive here
          }
        });
        break;
      case 'newProject.sendReceiveClone':
        // TODO: go to translation project when send/receive completes
        break;
      case 'newProject.name':
        this.$state.go(this.isSRProject ? 'newProject.sendReceiveCredentials' : 'newProject.languages');
        this.projectCodeState = 'empty';
        this.projectCodeStateDefer = this.$q.defer();
        this.projectCodeStateDefer.resolve('empty');
        this.nextButtonLabel = this.$filter('translate')(this.isSRProject ? 'Get Started' : 'Next');
        this.makeFormNeutral();
        break;
      case 'newProject.languages':
        this.createProject()
          .then(success => success ? this.updateConfig() : false)
          .then(success => {
            if (success) {
              this.gotoEditor();
            }
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

  // ----- Step 1: Get S/R credentials -----
  get isSignedIntoParatext(): boolean {
    return this.paratextUserInfo != null;
  }

  signIntoParatext(): void {
    if (this.paratextSignInWindow != null && !this.paratextSignInWindow.closed) {
      this.paratextSignInWindow.focus();
      return;
    }

    const wLeft = this.$window.screenLeft ? this.$window.screenLeft : this.$window.screenX;
    const wTop = this.$window.screenTop ? this.$window.screenTop : this.$window.screenY;
    const width = 760;
    const height = 852;
    const left = wLeft + (this.$window.innerWidth / 2) - (width / 2);
    const top = wTop + (this.$window.innerHeight / 2) - (height / 2);
    const features = 'top=' + top + ',left=' + left + ',width=' + width + ',height=' + height + ',menubar=0,toolbar=0';
    this.paratextSignInWindow = this.$window.open('/oauthcallback/paratext', 'ParatextSignIn', features);
    const checkWindow = setInterval(() => {
      if (this.paratextSignInWindow == null || !this.paratextSignInWindow.closed) {
        return;
      }

      clearInterval(checkWindow);
      this.paratextSignInWindow = null;
      this.getParatextUserInfo();
    }, 100);
  }

  private getParatextUserInfo(): void {
    this.isRetrievingParatextUserInfo = true;
    this.sessionService.getSession()
      .then(session => this.userRestApiService.getParatextInfo(session.userId()))
      .then(paratextUserInfo => this.paratextUserInfo = paratextUserInfo)
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

  private createProject(): angular.IPromise<boolean> {
    if (!this.newProject.projectName || !this.newProject.projectCode ||
      !this.newProject.appName) {
      // This function sometimes gets called during setup, when this.newProject is still empty.
      return this.$q.resolve(false);
    }

    return this.projectApi.createSwitchSession(this.newProject.projectName,
      this.newProject.projectCode, this.newProject.appName, false
    ).then(result => {
      if (result.ok) {
        this.newProject.id = result.data;
        return this.sessionService.getSession(true).then(session => true);
      } else {
        this.notice.push(this.notice.ERROR, 'The ' + this.newProject.projectName +
          ' project could not be created. Please try again.');
        return false;
      }
    });
  }

  // ----- Step 2: select source and target languages -----

  private updateConfig(): angular.IPromise<boolean> {
    return this.projectApi.updateConfig(this.newProject.config).then(result => {
      if (result.ok) {
        this.notice.push(this.notice.SUCCESS,
          this.newProject.projectName + ' configuration updated successfully.');
        return true;
      } else {
        this.makeFormInvalid('Could not save languages for ' + this.newProject.projectName);
        return false;
      }
    });
  }

  updateLanguage(docType: string, code: string, language: any) {
    this.newProject.config[docType] = this.newProject.config[docType] || {};
    this.newProject.config[docType].inputSystem.tag = code;
    this.newProject.config[docType].inputSystem.languageName = language.name;
  }

}
