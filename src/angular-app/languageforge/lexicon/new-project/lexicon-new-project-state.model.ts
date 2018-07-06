import * as angular from 'angular';

export interface LexiconNewProjectStateData {
  step: number;
}

export interface LexiconNewProjectState extends angular.ui.IState {
  data: LexiconNewProjectStateData;
}

export const LexiconNewProjectAbstractState = {
  name: 'newProject',
  abstract: true,
  templateUrl: '/angular-app/languageforge/lexicon/new-project/views/new-project-abstract.html',
  controller: 'NewLexiconProjectCtrl',
  controllerAs: '$ctrl'
} as angular.ui.IState;

export const LexiconNewProjectChooserState = {
  name: 'newProject.chooser',
  templateUrl: '/angular-app/languageforge/lexicon/new-project/views/new-project-chooser.html',
  data: {
    step: 0
  }
} as LexiconNewProjectState;

export const LexiconNewProjectNameState = {
  name: 'newProject.name',
  templateUrl: '/angular-app/languageforge/lexicon/new-project/views/new-project-name.html',
  data: {
    step: 1
  }
} as LexiconNewProjectState;

export const LexiconNewProjectSendReceiveCredentialsState = {
  name: 'newProject.sendReceiveCredentials',
  templateUrl: '/angular-app/languageforge/lexicon/new-project/views/new-project-sr-credentials.html',
  data: {
    step: 1
  }
} as LexiconNewProjectState;

export const LexiconNewProjectInitialDataState = {
  name: 'newProject.initialData',
  templateUrl: '/angular-app/languageforge/lexicon/new-project/views/new-project-initial-data.html',
  data: {
    step: 2
  }
} as LexiconNewProjectState;

export const LexiconNewProjectSendReceiveCloneState = {
  name: 'newProject.sendReceiveClone',
  templateUrl: '/angular-app/languageforge/lexicon/new-project/views/new-project-sr-clone.html',
  data: {
    step: 2
  }
} as LexiconNewProjectState;

export const LexiconNewProjectVerifyDataState = {
  name: 'newProject.verifyData',
  templateUrl: '/angular-app/languageforge/lexicon/new-project/views/new-project-verify-data.html',
  data: {
    step: 3
  }
} as LexiconNewProjectState;

export const LexiconNewProjectSelectPrimaryLanguageState = {
  name: 'newProject.selectPrimaryLanguage',
  templateUrl: '/angular-app/languageforge/lexicon/new-project/views/new-project-select-primary-language.html',
  data: {
    step: 3
  }
} as LexiconNewProjectState;
