import * as angular from 'angular';

import {ProjectService} from '../../../bellows/core/api/project.service';
import {ApplicationHeaderService} from '../../../bellows/core/application-header.service';
import {BreadcrumbService} from '../../../bellows/core/breadcrumbs/breadcrumb.service';
import {BrowserCheckService} from '../../../bellows/core/browser-check.service';
import {LinkService} from '../../../bellows/core/link.service';
import {NoticeService} from '../../../bellows/core/notice/notice.service';
import {SessionService} from '../../../bellows/core/session.service';
import {InputSystem} from '../../../bellows/shared/model/input-system.model';
import {InterfaceConfig} from '../../../bellows/shared/model/interface-config.model';
import {SendReceiveErrorCodes} from '../../../bellows/shared/model/send-receive-errorcodes.model';
import {SendReceiveState} from '../../../bellows/shared/model/send-receive-state.model';
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
import {SendReceiveStatus} from '../shared/model/send-receive-status.model';
import {NewProjectChooserState} from './new-project-chooser.component';
import {NewProjectInitialDataState} from './non-send-receive/new-project-initial-data.component';
import {NewProjectSendReceiveCloneState} from './send-receive/new-project-clone.component';
import {NewProjectSendReceiveCredentialsState} from './send-receive/new-project-credentials.component';
import {HelpHeroService} from '../../../bellows/core/helphero.service';

export interface NewProject extends LexiconProject {
  editProjectCode?: boolean;
  emptyProjectDesired?: boolean;
  entriesImported: number;
  importErrors: string;
  language: {
    name: string;
  };
}

export class LexiconNewProjectController implements angular.IController {
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

  // Shorthand to make things look a touch nicer
  readonly ok = this.makeFormValid;
  readonly neutral = this.makeFormNeutral;
  readonly error = this.makeFormInvalid;

  static $inject = ['$scope', '$q',
    '$state', '$window',
    'applicationHeaderService',
    'breadcrumbService', 'sessionService',
    'browserCheckService',
    'silNoticeService', 'linkService',
    'projectService',
    'lexProjectService',
    'lexSendReceiveApi',
    'lexSendReceive',
    'helpHeroService'];
  constructor(private readonly $scope: angular.IScope, readonly $q: angular.IQService,
              readonly $state: angular.ui.IStateService, private readonly $window: angular.IWindowService,
              private readonly applicationHeaderService: ApplicationHeaderService,
              private readonly breadcrumbService: BreadcrumbService, readonly sessionService: SessionService,
              private readonly browserCheckService: BrowserCheckService,
              readonly notice: NoticeService, private readonly linkService: LinkService,
              readonly projectService: ProjectService,
              private readonly lexProjectService: LexiconProjectService,
              private readonly sendReceiveApi: LexiconSendReceiveApiService,
              readonly sendReceive: LexiconSendReceiveService,
              private readonly helpHeroService: HelpHeroService) { }

  $onInit(): void {
    this.sessionService.getSession().then(session => {
      const projectSettings = session.projectSettings<LexiconProjectSettings>();
      if (projectSettings != null && projectSettings.interfaceConfig != null) {
        this.interfaceConfig = projectSettings.interfaceConfig;
      }
      // Inform HelpHero of user identity
      const userId = session.userId();
      if (userId) {
        this.helpHeroService.setIdentity(userId);
      } else {
        this.helpHeroService.anonymous();
      }
    });

    this.project.sendReceive  = new SendReceive();
    this.newProject.config = new LexiconConfig();
    this.newProject.appName = 'lexicon';

    this.resetValidateProjectForm();

    this.breadcrumbService.set('top', [{
      href: '/app/projects',
      label: 'My Projects'
    }, {
      label: 'New Project'
    }]);
    this.applicationHeaderService.setPageName('Start or join a Web Dictionary Project');
    this.browserCheckService.warnIfIE();

    // ----- Step 2: Send Receive Clone -----

    this.sendReceive.clearState();
    this.sendReceive.setCloneProjectStatusSuccessCallback(this.gotoEditor);
    this.sendReceive.setCloneProjectStatusFailedCallback(this.cloneFailed);
    this.$scope.$on('$locationChangeStart', this.sendReceive.cancelCloneStatusTimer);
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
    this.$state.go(NewProjectSendReceiveCredentialsState.name);
    this.resetValidateProjectForm();
    this.sessionService.getSession().then(session => {
      if (!this.project.sendReceive.username) {
        this.project.sendReceive.username = session.username();
      }

      this.validateForm();
    });
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
    if (this.$state.current.name === NewProjectInitialDataState.name) {
      this.newProject.emptyProjectDesired = true;
    }

    this.validateForm().then(isValid => {
      if (isValid) {
        this.gotoNextState();
      }
    });
  }

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

  private cloneFailed = (status: SendReceiveStatus): void => {
    switch (status.SRState) {
      case SendReceiveState.Error:
        switch (status.ErrorCode) {
          case SendReceiveErrorCodes.EmptyProject:
          case SendReceiveErrorCodes.NoFlexProject:
          case SendReceiveErrorCodes.Unauthorized:
          case SendReceiveErrorCodes.ProjectTooNew:
          case SendReceiveErrorCodes.ProjectTooOld:
            this.projectService.deleteProject([this.newProject.id]);
            break;
        }
        this.$state.go(NewProjectChooserState.name);
        break;
      case SendReceiveState.Hold:
        this.gotoEditor();
        break;
    }
    this.sendReceive.showProjectStatusNotice(status);
  }

  // ----- Step 1: Project name -----

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

  // ----- Step 1: Send Receive Credentials -----

  getProject = (): void => {
    this.sendReceiveApi.receiveProject(result => {
      if (result.ok) {
        this.$state.go(NewProjectSendReceiveCloneState.name);
        this.sendReceive.startCloneStatusTimer();
      } else {
        this.notice.push(this.notice.ERROR, 'The project could not be synchronized with LanguageDepot.org. ' +
          'Please try again.');
        this.gotoEditor();
      }
    });
  }

  // ----- Step 3: Select primary language -----

  savePrimaryLanguage(callback?: () => void): void {
    let config: LexiconConfig = new LexiconConfig();
    let optionLists: LexOptionList[] = [];
    const inputSystem: InputSystem = new InputSystem();
    this.notice.setLoading('Configuring project for first use...');
    this.sessionService.getSession().then(session => {
      const projectSettings = session.projectSettings<LexiconProjectSettings>();
      if (projectSettings != null) {
        config = projectSettings.config;
        optionLists = projectSettings.optionlists;
      }

      inputSystem.abbreviation = this.newProject.languageCode;
      inputSystem.tag = this.newProject.languageCode;
      inputSystem.languageName = this.newProject.language.name;
      config.inputSystems[this.newProject.languageCode] = inputSystem;
      if (this.newProject.languageCode !== 'th' && 'th' in config.inputSystems) {
        delete config.inputSystems.th;
        this.replaceFieldInputSystem(config.entry, 'th', this.newProject.languageCode);
      }

      this.lexProjectService.updateConfiguration(config, optionLists, result => {
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

export const LexiconNewProjectComponent: angular.IComponentOptions = {
  bindings: {
  },
  controller: LexiconNewProjectController,
  templateUrl: '/angular-app/languageforge/lexicon/new-project/lexicon-new-project.component.html'
};

export const NewProjectAbstractState = {
  name: 'newProject',
  abstract: true,
  template: `<lexicon-new-project></lexicon-new-project>`
} as angular.ui.IState;
