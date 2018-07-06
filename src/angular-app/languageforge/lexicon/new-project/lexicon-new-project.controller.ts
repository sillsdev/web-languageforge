import * as angular from 'angular';

import {ProjectService} from '../../../bellows/core/api/project.service';
import {ApplicationHeaderService} from '../../../bellows/core/application-header.service';
import {BreadcrumbService} from '../../../bellows/core/breadcrumbs/breadcrumb.service';
import {BytesFilterFunction} from '../../../bellows/core/filters';
import {LinkService} from '../../../bellows/core/link.service';
import {ModalService} from '../../../bellows/core/modal/modal.service';
import {NoticeService} from '../../../bellows/core/notice/notice.service';
import {SessionService} from '../../../bellows/core/session.service';
import {InputSystem} from '../../../bellows/shared/model/input-system.model';
import {InterfaceConfig} from '../../../bellows/shared/model/interface-config.model';
import {UploadFile, UploadResponse} from '../../../bellows/shared/model/upload.model';
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
import {
  LexiconNewProjectInitialDataState,
  LexiconNewProjectNameState, LexiconNewProjectSendReceiveCloneState, LexiconNewProjectSendReceiveCredentialsState
} from './lexicon-new-project-state.model';

interface NewProject extends LexiconProject {
  editProjectCode?: boolean;
  emptyProjectDesired?: boolean;
  entriesImported: number;
  importErrors: string;
  language: {
    name: string;
  };
}

interface Show {
  importErrors: boolean;
  cloning: boolean;
  flexHelp: boolean;
}

export class LexiconNewProjectController implements angular.IController {
  cloneNotice = this.sendReceive.cloneNotice;
  interfaceConfig: InterfaceConfig = {} as InterfaceConfig;
  newProject: NewProject = {} as NewProject;
  project: LexiconProject = {} as LexiconProject;
  formStatus: string;
  formStatusClass: string;
  formValidated: boolean;
  formValidationDefer: angular.IDeferred<boolean>;
  forwardBtnClass: string;
  projectCodeState: string;
  projectCodeStateDefer: angular.IDeferred<string>;
  show: Show;

  // Shorthand to make things look a touch nicer
  readonly ok = this.makeFormValid;
  readonly neutral = this.makeFormNeutral;
  readonly error = this.makeFormInvalid;

  static $inject = ['$scope', '$q',
    '$filter', '$window',
    '$state', '$uibModal',
    'Upload', 'applicationHeaderService',
    'breadcrumbService', 'sessionService',
    'silNoticeService', 'linkService',
    'projectService',
    'lexProjectService',
    'lexSendReceiveApi',
    'lexSendReceive'];
  constructor(private readonly $scope: angular.IScope, readonly $q: angular.IQService,
              private readonly $filter: angular.IFilterService, private readonly $window: angular.IWindowService,
              readonly $state: angular.ui.IStateService, private readonly $modal: ModalService,
              private readonly Upload: any, private readonly applicationHeaderService: ApplicationHeaderService,
              private readonly breadcrumbService: BreadcrumbService, readonly sessionService: SessionService,
              readonly notice: NoticeService, private readonly linkService: LinkService,
              readonly projectService: ProjectService,
              private readonly lexProjectService: LexiconProjectService,
              private readonly sendReceiveApi: LexiconSendReceiveApiService,
              readonly sendReceive: LexiconSendReceiveService) { }

  $onInit(): void {
    this.sessionService.getSession().then(session => {
      const projectSettings = session.projectSettings<LexiconProjectSettings>();
      if (projectSettings != null && projectSettings.interfaceConfig != null) {
        this.interfaceConfig = projectSettings.interfaceConfig;
      }
    });

    this.project.sendReceive  = new SendReceive();
    this.newProject.config = new LexiconConfig();
    this.newProject.appName = 'lexicon';

    this.show = {
      importErrors: false,
      flexHelp: false,
      cloning: true
    } as Show;
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
      if (newVal == null) {
        this.newProject.projectCode = '';
      } else if (newVal !== oldVal) {
        this.newProject.projectCode = newVal.toLowerCase().replace(/ /g, '_');
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

  private makeFormValid(msg: string = ''): angular.IPromise<boolean> {
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

  private makeFormNeutral(msg: string = ''): angular.IPromise<boolean> {
    this.formValidated = false;
    this.formStatus = msg;
    this.formStatusClass = '';
    this.forwardBtnClass = 'btn-std';
    this.formValidationDefer = this.$q.defer();
    this.formValidationDefer.resolve(true);
    return this.formValidationDefer.promise;
  }

  private makeFormInvalid(msg: string = ''): angular.IPromise<boolean> {
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

  resetValidateProjectForm = (): void => {
    this.makeFormNeutral();
    this.projectCodeState = 'unchecked';
    this.projectCodeStateDefer = this.$q.defer();
    this.projectCodeStateDefer.resolve('unchecked');
    this.project.sendReceive.isUnchecked = true;
    this.project.sendReceive.credentialsStatus = 'unchecked';
  }

  getProjectFromInternet(): void {
    this.$state.go(LexiconNewProjectSendReceiveCredentialsState.name);
    this.resetValidateProjectForm();
    this.sessionService.getSession().then(session => {
      if (!this.project.sendReceive.username) {
        this.project.sendReceive.username = session.username();
      }

      this.validateForm();
    });
  }

  createNew(): void {
    this.$state.go(LexiconNewProjectNameState.name);
  }

  iconForStep(step: number): string[] {
    const classes: string[] = [];
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

  previousStep(): void {
    this.resetValidateProjectForm();
    this.$state.current.data.goPreviousState(this);
  }

  nextStep(): void {
    if (this.$state.current.name === LexiconNewProjectInitialDataState.name) {
      this.newProject.emptyProjectDesired = true;
    }

    this.validateForm().then(isValid => {
      if (isValid) {
        this.gotoNextState();
      }
    });
  }

  // Form validation requires API calls, so it return a promise rather than a value.
  validateForm = (): angular.IPromise<boolean> => {
    this.formValidationDefer = this.$q.defer();
    return this.$state.current.data.isFormValid(this);
  }

  private gotoNextState(): void {
    this.$state.current.data.goNextState(this);
  }

  gotoEditor = (): void => {
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

  checkProjectCode(): angular.IPromise<string> {
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

  createProject(): angular.IPromise<void> {
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

  uploadFile(file: UploadFile): void {
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

  hasImportErrors(): boolean {
    return this.newProject.importErrors !== '';
  }

  showImportErrorsButtonLabel(): string {
    if (this.show.importErrors) {
      return 'Hide non-critical import errors';
    }

    return 'Show non-critical import errors';
  }

  // ----- Step 1: Send Receive Credentials -----

  getProject = (): void => {
    this.sendReceiveApi.receiveProject(result => {
      if (result.ok) {
        this.$state.go(LexiconNewProjectSendReceiveCloneState.name);
        this.sendReceive.startCloneStatusTimer();
      } else {
        this.notice.push(this.notice.ERROR, 'The project could not be synchronized with' +
          ' LanguageDepot.org. Please try again.');
        this.gotoEditor();
      }
    });
  }

  // ----- Step 3: Verify initial data -OR- select primary language -----

  primaryLanguage(): string {
    if (this.newProject.languageCode) {
      return this.newProject.language.name + ' (' + this.newProject.languageCode + ')';
    }

    return '';
  }

  openNewLanguageModal(): void {
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

  savePrimaryLanguage(callback?: () => void): void {
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

  private replaceFieldInputSystem(config: LexConfigField, existingTag: string, replacementTag: string): void {
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
