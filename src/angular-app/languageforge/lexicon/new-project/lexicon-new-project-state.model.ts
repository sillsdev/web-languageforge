import * as angular from 'angular';

import {LexiconNewProjectController} from './lexicon-new-project.component';

export interface LexiconNewProjectState extends angular.ui.IState {
  data: LexiconNewProjectStateData;
}

export interface LexiconNewProjectStateData {
  step: number;
  isSRProject: boolean;
  show: LexiconNewProjectStateDataShow;
  nextButtonLabel: string;
  progressIndicatorStep1Label: string;
  progressIndicatorStep2Label: string;
  progressIndicatorStep3Label: string;
  isFormValid: (controller?: LexiconNewProjectController) => angular.IPromise<boolean>;
  goNextState: (controller?: LexiconNewProjectController) => void;
  goPreviousState: (controller?: LexiconNewProjectController) => void;
}

export interface LexiconNewProjectStateDataShow {
  backButton: boolean;
  nextButton: boolean;
  step3: boolean;
}
