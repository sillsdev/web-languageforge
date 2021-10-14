import * as angular from 'angular';

export class AdvancedOptionsConfigurationController implements angular.IController {
  accPollUpdateTimerSecondsDirty: number;
  accOnUpdate: (params: { $event: { pollUpdateTimerSecondsDirty: number } }) => void;

  static $inject: string[] = ['$scope'];
  constructor(private $scope: angular.IScope) {
  }
}

export const AdvancedOptionsConfigurationComponent: angular.IComponentOptions = {
  bindings: {
    accPollUpdateTimerSecondsDirty: '<',
    accOnUpdate: '&'
  },
  controller: AdvancedOptionsConfigurationController,
  templateUrl: '/angular-app/languageforge/lexicon/settings/configuration/configuration-advanced-options.component.html'
};
