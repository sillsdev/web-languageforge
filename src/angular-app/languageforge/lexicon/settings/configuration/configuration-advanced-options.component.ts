import * as angular from 'angular';
import {LexiconConfig} from '../../shared/model/lexicon-config.model';

export class AdvancedOptionsConfigurationController implements angular.IController {
  accPollUpdateTimerSecondsDirty: number;
  accOnUpdate: (params: { $event: { pollUpdateTimerSecondsDirty: number } }) => void;

  static $inject: string[] = ['$scope'];
  constructor(private $scope: angular.IScope) {
    $scope.$watch(
      () => this.accPollUpdateTimerSecondsDirty,
      (newVal: number, oldVal: number) => {
        if (newVal != null && newVal !== oldVal) {
          this.accOnUpdate({ $event: { pollUpdateTimerSecondsDirty: this.accPollUpdateTimerSecondsDirty } });
        }
      },
      true
    );
  }

  $onChanges(changes: any) {
    const configChange = changes.accConfigPristine as angular.IChangesObject<LexiconConfig>;
    if (configChange != null && configChange.currentValue != null) {
      const ms = configChange.currentValue.pollUpdateIntervalMs;
      if (ms != null) {
        this.accPollUpdateTimerSecondsDirty = ms / 1000;
      }
    }
  }
}

export const AdvancedOptionsConfigurationComponent: angular.IComponentOptions = {
  bindings: {
    accPollUpdateTimerSecondsDirty: '<',
    accConfigPristine: '<',
    accOnUpdate: '&'
  },
  controller: AdvancedOptionsConfigurationController,
  templateUrl: '/angular-app/languageforge/lexicon/settings/configuration/configuration-advanced-options.component.html'
};
