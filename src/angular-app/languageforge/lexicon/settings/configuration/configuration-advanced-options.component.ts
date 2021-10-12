import * as angular from 'angular';

export class AdvancedOptionsConfigurationController implements angular.IController {

  static $inject: string[] = ['$scope'];
  constructor(private $scope: angular.IScope) {
  }
}

export const AdvancedOptionsConfigurationComponent: angular.IComponentOptions = {
  bindings: {
  },
  controller: AdvancedOptionsConfigurationController,
  templateUrl: '/angular-app/languageforge/lexicon/settings/configuration/configuration-advanced-options.component.html'
};
