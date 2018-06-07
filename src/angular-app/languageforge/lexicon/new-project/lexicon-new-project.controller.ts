import * as angular from 'angular';

import {ProjectService} from '../../../bellows/core/api/project.service';
import {ApplicationHeaderService} from '../../../bellows/core/application-header.service';
import {BreadcrumbService} from '../../../bellows/core/breadcrumbs/breadcrumb.service';
import {BytesFilterFunction} from '../../../bellows/core/filters';
import {InputSystemsService} from '../../../bellows/core/input-systems/input-systems.service';
import {LinkService} from '../../../bellows/core/link.service';
import {ModalService} from '../../../bellows/core/modal/modal.service';
import {NoticeService} from '../../../bellows/core/notice/notice.service';
import {SessionService} from '../../../bellows/core/session.service';
import {InputSystem} from '../../../bellows/shared/model/input-system.model';
import {InterfaceConfig} from '../../../bellows/shared/model/interface-config.model';
import {LexiconProjectService} from '../core/lexicon-project.service';
import {LexiconSendReceiveApiService} from '../core/lexicon-send-receive-api.service';
import {LexiconSendReceiveService} from '../core/lexicon-send-receive.service';
import {
  LexConfigField,
  LexConfigFieldList,
  LexConfigMultiText,
  LexiconConfig
} from '../shared/model/lexicon-config.model';
import {LexiconProjectSettings} from '../shared/model/lexicon-project-settings.model';
import {LexiconProject, SendReceive} from '../shared/model/lexicon-project.model';
import {LexOptionList} from '../shared/model/option-list.model';
import {UploadFile, UploadResponse} from '../shared/model/upload.model';

class NewProject extends LexiconProject {
  editProjectCode?: boolean;
  emptyProjectDesired?: boolean;
  entriesImported: number;
  importErrors: string;
  language: {
    name: string;
  };
}

class Show {
  importErrors: boolean = false;
  backButton: boolean;
  cloning: boolean;
  flexHelp: boolean;
  nextButton: boolean;
  step3: boolean;
}

export class LexiconNewProjectController implements angular.IController {
  cloneNotice = this.sendReceive.cloneNotice;
  newProject: NewProject = new NewProject();
  project: LexiconProject = new LexiconProject();
  state = this.$state;
  formStatus: string;
  formStatusClass: string;
  formValidated: boolean;
  formValidationDefer: angular.IDeferred<boolean>;
  forwardBtnClass: string;
  interfaceConfig: InterfaceConfig;
  isSRProject: boolean;
  nextButtonLabel: string;
  progressIndicatorStep1Label: string;
  progressIndicatorStep2Label: string;
  progressIndicatorStep3Label: string;
  projectCodeState: string;
  projectCodeStateDefer: angular.IDeferred<string>;
  show: Show;

  // Shorthand to make things look a touch nicer
  private readonly ok = this.makeFormValid;
  private readonly neutral = this.makeFormNeutral;
  private readonly error = this.makeFormInvalid;

  static $inject = ['$scope', '$q',
    '$filter', '$window',
    '$state', '$uibModal',
    'Upload', 'applicationHeaderService',
    'breadcrumbService', 'sessionService',
    'silNoticeService', 'linkService',
    'projectService',
    'lexProjectService',
    'lexSendReceiveApi',
    'lexSendReceive'
  ];
  constructor(private readonly $scope: angular.IScope, private readonly $q: angular.IQService,
              private readonly $filter: angular.IFilterService, private readonly $window: angular.IWindowService,
              private readonly $state: angular.ui.IStateService, private readonly $modal: ModalService,
              private readonly Upload: any, private readonly applicationHeaderService: ApplicationHeaderService,
              private readonly breadcrumbService: BreadcrumbService, private readonly sessionService: SessionService,
              private readonly notice: NoticeService, private readonly linkService: LinkService,
              private readonly projectService: ProjectService,
              private readonly lexProjectService: LexiconProjectService,
              private readonly sendReceiveApi: LexiconSendReceiveApiService,
              private readonly sendReceive: LexiconSendReceiveService) {}

  $onInit() {
    this.interfaceConfig = new InterfaceConfig();
    this.sessionService.getSession().then(session => {
      const projectSettings = session.projectSettings<LexiconProjectSettings>();
      if (projectSettings != null && projectSettings.interfaceConfig != null) {
        angular.merge(this.interfaceConfig, projectSettings.interfaceConfig);
        if (InputSystemsService.isRightToLeft(this.interfaceConfig.userLanguageCode)) {
          this.interfaceConfig.direction = 'rtl';
          this.interfaceConfig.pullToSide = 'float-left';
          this.interfaceConfig.pullNormal = 'float-right';
          this.interfaceConfig.placementToSide = 'right';
          this.interfaceConfig.placementNormal = 'left';
        }
      }
    });

    this.project.sendReceive  = new SendReceive();
    this.newProject.config = new LexiconConfig();
    this.newProject.appName = 'lexicon';

    this.isSRProject = false;
    this.show = new Show();
    this.show.nextButton = this.$state.current.name !== 'newProject.chooser';
    this.show.backButton = false;
    this.show.flexHelp = false;
    this.show.cloning = true;
    this.show.step3 = true;
    this.nextButtonLabel = 'Next';
    this.progressIndicatorStep1Label = 'Name';
    this.progressIndicatorStep2Label = 'Initial Data';
    this.progressIndicatorStep3Label = 'Verify';
    this.resetValidateProjectForm();

    this.breadcrumbService.set('top', [{
      href: '/app/projects',
      label: 'My Projects'
    }, {
      label: 'New Project'
    }]);
    this.applicationHeaderService.setPageName('Start or join a Web Dictionary Project');

    // ----- Step 1: Project name -----

    this.$scope.$watch(() => this.projectCodeState, (newVal: string, oldVal: string) => {
      if (!newVal || newVal === oldVal) {
        return;
      }

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

    this.$scope.$watch(() => this.newProject.editProjectCode, (newVal: boolean, oldVal: boolean) => {
      if (oldVal && !newVal) {
        // When user unchecks the "edit project code" box, go back to setting it from project name
        this.newProject.projectCode = LexiconNewProjectController.projectNameToCode(this.newProject.projectName);
        this.checkProjectCode();
      }
    });

    this.$scope.$watch(() => this.newProject.projectName, (newVal: string, oldVal: string) => {
      if (!this.isSRProject) {
        if (newVal == null) {
          this.newProject.projectCode = '';
        } else if (newVal !== oldVal) {
          this.newProject.projectCode = newVal.toLowerCase().replace(/ /g, '_');
        }
      }
    });

    // ----- Step 2: Send Receive Clone -----

    this.sendReceive.clearState();
    this.sendReceive.setCloneProjectStatusSuccessCallback(this.gotoEditor);
    this.$scope.$on('$locationChangeStart', this.sendReceive.cancelCloneStatusTimer);

    // ----- Step 3: Verify initial data -OR- select primary language -----

    this.$scope.$watch(() => this.newProject.languageCode, (newVal: string) => {
      if (newVal != null) {
        this.validateForm();
      }
    });

  }

  // ----- Step 2: Send Receive Clone -----
  $onDestroy(): void {
    this.sendReceive.cancelCloneStatusTimer();
  }

  private makeFormValid(msg: string = '') {
    this.formValidated = true;
    this.formStatus = msg;
    this.formStatusClass = 'alert alert-info';
    if (!msg) {
      this.formStatusClass = '';
    }
    this.forwardBtnClass = 'btn-primary';
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
    if (!msg) {
      this.formStatusClass = '';
    }
    this.forwardBtnClass = '';
    this.formValidationDefer.resolve(false);
    return this.formValidationDefer.promise;
  }

  resetValidateProjectForm = () => {
    this.makeFormNeutral();
    this.projectCodeState = 'unchecked';
    this.projectCodeStateDefer = this.$q.defer();
    this.projectCodeStateDefer.resolve('unchecked');
    this.project.sendReceive.isUnchecked = true;
    this.project.sendReceive.credentialsStatus = 'unchecked';
  }

  getProjectFromInternet() {
    this.$state.go('newProject.sendReceiveCredentials');
    this.isSRProject = true;
    this.show.nextButton = true;
    this.show.backButton = true;
    this.show.step3 = false;
    this.nextButtonLabel = 'Get Started';
    this.progressIndicatorStep1Label = 'Connect';
    this.progressIndicatorStep2Label = 'Verify';
    this.resetValidateProjectForm();
    this.sessionService.getSession().then(session => {
      if (!this.project.sendReceive.username) {
        this.project.sendReceive.username = session.username();
      }

      this.validateForm();
    });
  }

  createNew() {
    this.$state.go('newProject.name');
    this.isSRProject = false;
    this.show.nextButton = true;
    this.show.backButton = true;
    this.show.step3 = true;
    this.nextButtonLabel = 'Next';
    this.progressIndicatorStep1Label = 'Name';
    this.progressIndicatorStep2Label = 'Initial Data';
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
    this.show.backButton = false;
    this.resetValidateProjectForm();
    switch (this.$state.current.name) {
      case 'newProject.sendReceiveCredentials':
        this.$state.go('newProject.chooser');
        this.show.nextButton = false;
        break;
      case 'newProject.name':
        this.$state.go('newProject.chooser');
        this.show.nextButton = false;
        break;
      case 'newProject.initialData':
      case 'newProject.verifyData':
        break;
      case 'newProject.selectPrimaryLanguage':
        this.$state.go('newProject.initialData');
        this.nextButtonLabel = 'Skip';
        this.newProject.emptyProjectDesired = false;
        this.progressIndicatorStep3Label = 'Verify';
        break;
    }
  }

  nextStep() {
    if (this.$state.current.name === 'newProject.initialData') {
      this.newProject.emptyProjectDesired = true;
      this.progressIndicatorStep3Label = 'Language';
    }

    this.validateForm().then(isValid => {
      if (isValid) {
        this.gotoNextState();
      }
    });
  }

  // Form validation requires API calls, so it return a promise rather than a value.
  validateForm = () => {
    this.formValidationDefer = this.$q.defer();

    switch (this.$state.current.name) {
      case 'newProject.chooser':
        return this.error();
      case 'newProject.sendReceiveCredentials':
        return this.validateSendReceiveCredentialsForm();
      case 'newProject.sendReceiveClone':
        if (this.sendReceive.isInProgress()) {
          return this.error();
        }

        break;
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

      case 'newProject.initialData':
        return this.neutral();
      case 'newProject.verifyData':
        return this.neutral();
      case 'newProject.selectPrimaryLanguage':
        if (!this.newProject.languageCode) {
          return this.error('Please select a primary language for the project.');
        }

        break;
    }
    return this.ok();
  }

  private gotoNextState() {
    switch (this.$state.current.name) {
      case 'newProject.sendReceiveCredentials':

        // For now, this is the point of no return.  We can't cancel an LfMerge clone, and we
        // don't want the user to go to the project and start editing before the clone has
        // completed.
        this.show.backButton = false;
        this.show.cloning = true;
        this.show.nextButton = false;
        this.resetValidateProjectForm();
        if (this.project.sendReceive.project.isLinked) {
          let role = 'contributor';
          if (this.project.sendReceive.project.role === 'manager') {
            role = 'project_manager';
          }

          this.projectService.joinSwitchSession(this.project.sendReceive.project.identifier, role).then(result => {
            if (result.ok) {
              this.newProject.id = result.data;
              this.sessionService.getSession(true).then(this.gotoEditor);
            } else {
              this.notice.push(this.notice.ERROR, 'Well this is embarrassing. ' +
                'We couldn\'t join you to the project. Sorry about that.');
            }
          });
        } else {
          this.newProject.projectName = this.project.sendReceive.project.name;
          this.newProject.projectCode = this.project.sendReceive.project.identifier;
          this.projectService.projectCodeExists(this.newProject.projectCode).then(result => {
            if (result.ok && result.data) {
              this.newProject.projectCode += '_lf';
            }

            this.createProject().then(this.getProject);
            this.makeFormNeutral();
          });
        }

        break;
      case 'newProject.sendReceiveClone':
        if (!this.sendReceive.isInProgress()) {
          this.gotoEditor();
        }

        break;
      case 'newProject.name':
        this.createProject();
        this.$state.go('newProject.initialData');
        this.nextButtonLabel = 'Skip';
        this.show.backButton = false;
        this.projectCodeState = 'empty';
        this.projectCodeStateDefer = this.$q.defer();
        this.projectCodeStateDefer.resolve('empty');
        this.makeFormNeutral();
        break;
      case 'newProject.initialData':
        this.nextButtonLabel = 'Dictionary';
        if (this.newProject.emptyProjectDesired) {
          this.$state.go('newProject.selectPrimaryLanguage');
          this.show.backButton = true;
          this.makeFormNeutral();
        } else {
          this.$state.go('newProject.verifyData');
          this.makeFormValid();
        }

        break;
      case 'newProject.verifyData':
        this.gotoEditor();
        break;
      case 'newProject.selectPrimaryLanguage':
        this.savePrimaryLanguage(this.gotoEditor);
        break;
    }
  }

  private gotoEditor = () => {
    let url;
    this.makeFormValid();
    url = this.linkService.project(this.newProject.id, this.newProject.appName);
    this.$window.location.href = url;
  }

  // ----- Step 1: Project name -----

  private static projectNameToCode(name: string): string {
    if (name == null) {
      return undefined;
    }
    return name.toLowerCase().replace(/ /g, '_');
  }

  checkProjectCode() {
    this.projectCodeStateDefer = this.$q.defer();
    if (!LexiconProjectService.isValidProjectCode(this.newProject.projectCode)) {
      this.projectCodeState = 'invalid';
      this.projectCodeStateDefer.resolve('invalid');
    } else {
      this.projectCodeState = 'loading';
      this.projectCodeStateDefer.notify('loading');
      this.projectService.projectCodeExists(this.newProject.projectCode, result => {
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

  private createProject(): angular.IPromise < void > {
    if (!this.newProject.projectName || !this.newProject.projectCode || !this.newProject.appName) {
      // This function sometimes gets called during setup, when this.newProject is still empty.
      return this.$q.resolve();
    }

    return this.projectService.createSwitchSession(this.newProject.projectName, this.newProject.projectCode,
      this.newProject.appName, this.project.sendReceive.project
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

  // ----- Step 2: Initial data upload -----

  uploadFile(file: UploadFile) {
    if (!file || file.$error) {
      return;
    }

    this.sessionService.getSession().then(session => {
      if (file.size > session.fileSizeMax()) {
        this.notice.push(this.notice.ERROR, '<b>' + file.name + '</b> (' +
          this.$filter<BytesFilterFunction>('bytes')(file.size) + ') is too large. It must be smaller than ' +
          this.$filter<BytesFilterFunction>('bytes')(session.fileSizeMax()) + '.');
        return;
      }

      this.notice.setLoading('Importing ' + file.name + '...');
      this.Upload.upload({
        url: '/upload/lf-lexicon/import-zip',
        data: { file }
      }).then((response: UploadResponse) => {
          this.notice.cancelLoading();
          const isUploadSuccess = response.data.result;
          if (isUploadSuccess) {
            this.notice.push(this.notice.SUCCESS, 'Successfully imported ' +
              file.name);
            this.newProject.entriesImported = response.data.data.stats.importEntries;
            this.newProject.importErrors = response.data.data.importErrors;
            this.gotoNextState();
          } else {
            this.newProject.entriesImported = 0;
            this.notice.push(this.notice.ERROR, response.data.data.errorMessage);
          }
        },

        (response: UploadResponse) => {
          this.notice.cancelLoading();
          let errorMessage = 'Import failed.';
          if (response.status > 0) {
            errorMessage += ' Status: ' + response.status;
            if (response.statusText) {
              errorMessage += ' ' + response.statusText;
            }

            if (response.data) {
              errorMessage += '- ' + response.data;
            }
          }

          this.notice.push(this.notice.ERROR, errorMessage);
        },

        (evt: ProgressEvent) => {
          this.notice.setPercentComplete(Math.floor(100.0 * evt.loaded / evt.total));
        });
    });
  }

  hasImportErrors() {
    return (this.newProject.importErrors !== '');
  }

  showImportErrorsButtonLabel() {
    if (this.show.importErrors) {
      return 'Hide non-critical import errors';
    }

    return 'Show non-critical import errors';
  }

  // ----- Step 1: Send Receive Credentials -----

  private validateSendReceiveCredentialsForm() {
    if (this.project.sendReceive.project != null && this.project.sendReceive.project.isLinked) {
      this.nextButtonLabel = 'Join Project';
    } else {
      this.nextButtonLabel = 'Get Started';
    }

    this.project.sendReceive.projectStatus = 'unchecked';
    if (!this.project.sendReceive.username) {
      return this.error('Login cannot be empty. Please enter your LanguageDepot.org login username.');
    }

    if (!this.project.sendReceive.password) {
      return this.error('Password cannot be empty. Please enter your LanguageDepot.org password.');
    }

    if (this.project.sendReceive.isUnchecked) {
      return this.neutral();
    }

    if (this.project.sendReceive.credentialsStatus === 'invalid') {
      return this.error('The username or password isn\'t valid on LanguageDepot.org.');
    }

    this.project.sendReceive.projectStatus = 'no_access';
    if (!this.project.sendReceive.project) {
      return this.error('Please select a Project.');
    }

    if (!this.project.sendReceive.project.isLinked &&
      this.project.sendReceive.project.role !== 'manager') {
      return this.error('Please select a Project that you are the Manager of on LanguageDepot.org.');
    }

    this.project.sendReceive.projectStatus = 'ok';
    return this.ok();
  }

  private getProject = () => {
    this.sendReceiveApi.receiveProject(result => {
      if (result.ok) {
        this.$state.go('newProject.sendReceiveClone');
        this.sendReceive.startCloneStatusTimer();
      } else {
        this.notice.push(this.notice.ERROR, 'The project could not be synchronized with' +
          ' LanguageDepot.org. Please try again.');
        this.gotoEditor();
      }
    });
  }

  // ----- Step 3: Verify initial data -OR- select primary language -----

  primaryLanguage() {
    if (this.newProject.languageCode) {
      return this.newProject.language.name + ' (' + this.newProject.languageCode + ')';
    }

    return '';
  }

  openNewLanguageModal() {
    const modalInstance = this.$modal.open({
      templateUrl: '/angular-app/languageforge/lexicon/shared/select-new-language.modal.html',
      controller: ['$scope', '$uibModalInstance',
        ($scope: any, $modalInstance: angular.ui.bootstrap.IModalInstanceService) => {
          $scope.selected = {
            code: '',
            language: {}
          };
          $scope.add = () => {
            $modalInstance.close($scope.selected);
          };

          $scope.close = $modalInstance.dismiss;
        }
      ],
      windowTopClass: 'modal-select-language'
    });
    modalInstance.result.then(selected => {
      this.newProject.languageCode = selected.code;
      this.newProject.language = selected.language;
    }, () => {});
  }

  private savePrimaryLanguage(callback?: () => void) {
    let config: LexiconConfig = new LexiconConfig();
    let optionlist: LexOptionList[] = [];
    const inputSystem: InputSystem = new InputSystem();
    this.notice.setLoading('Configuring project for first use...');
    this.sessionService.getSession().then(session => {
      const projectSettings = session.projectSettings<LexiconProjectSettings>();
      if (projectSettings != null) {
        config = projectSettings.config;
        optionlist = projectSettings.optionlists;
      }

      inputSystem.abbreviation = this.newProject.languageCode;
      inputSystem.tag = this.newProject.languageCode;
      inputSystem.languageName = this.newProject.language.name;
      config.inputSystems[this.newProject.languageCode] = inputSystem;
      if (this.newProject.languageCode !== 'th' && 'th' in config.inputSystems) {
        delete config.inputSystems.th;
        this.replaceFieldInputSystem(config.entry, 'th', this.newProject.languageCode);
      }

      this.lexProjectService.updateConfiguration(config, optionlist, result => {
        this.notice.cancelLoading();
        if (result.ok) {
          if (callback) {
            callback();
          }
        } else {
          this.makeFormInvalid('Could not add ' + this.newProject.language.name + ' to project.');
        }
      });
    });
  }

  private replaceFieldInputSystem(config: LexConfigField, existingTag: string, replacementTag: string) {
    if (config.type === 'fields') {
      const configFieldList = config as LexConfigFieldList;
      for (const fieldName in configFieldList.fields) {
        if (configFieldList.fields.hasOwnProperty(fieldName)) {
          this.replaceFieldInputSystem(configFieldList.fields[fieldName], existingTag, replacementTag);
        }
      }
    } else {
      const configMultiText = config as LexConfigMultiText;
      if (configMultiText.inputSystems != null) {
        for (const index in configMultiText.inputSystems) {
          if (configMultiText.inputSystems.hasOwnProperty(index)) {
            if (configMultiText.inputSystems[index] === existingTag) {
              configMultiText.inputSystems[index] = replacementTag;
            }
          }
        }
      }
    }
  }

}
