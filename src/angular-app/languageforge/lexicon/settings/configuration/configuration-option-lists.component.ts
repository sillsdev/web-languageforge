import * as angular from 'angular';

import {LexOptionList, LexOptionListItem} from '../../shared/model/option-list.model';

export class OptionListConfigurationController implements angular.IController {
  olcOptionListsDirty: LexOptionList[];
  olcOnUpdate: (params: { $event: { optionListsDirty: LexOptionList[] } }) => void;

  currentListIndex = 0;

  private oldListIndex = 0;

  static $inject: string[] = ['$scope'];
  constructor(private $scope: angular.IScope) {
    $scope.$watch(
      () => {
        if (this.olcOptionListsDirty == null) {
          return null;
        }

        return this.olcOptionListsDirty[this.currentListIndex]?.items;
      },
      (newVal: LexOptionListItem[], oldVal: LexOptionListItem[]) => {
        if (newVal != null && newVal !== oldVal) {
          if (this.currentListIndex === this.oldListIndex) {
            this.olcOnUpdate({ $event: { optionListsDirty: this.olcOptionListsDirty } });
          }

          this.oldListIndex = this.currentListIndex;
        }
      },
      true
    );
  }

  selectList($index: number): void {
    this.currentListIndex = $index;
  }

}

export const OptionListConfigurationComponent: angular.IComponentOptions = {
  bindings: {
    olcOptionListsDirty: '<',
    olcOnUpdate: '&'
  },
  controller: OptionListConfigurationController,
  templateUrl: '/angular-app/languageforge/lexicon/settings/configuration/configuration-option-lists.component.html'
};
