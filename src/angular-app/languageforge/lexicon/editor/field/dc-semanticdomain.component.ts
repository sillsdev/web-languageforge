import * as angular from 'angular';

import {FieldMultiOptionListController} from './dc-multioptionlist.component';

interface WindowService extends angular.IWindowService {
  semanticDomains_en?: any;
}

export class FieldSemanticDomainController extends FieldMultiOptionListController implements angular.IController {
  options: any[] = [];

  static $inject = ['$state', '$window'];
  constructor(protected $state: angular.ui.IStateService, private $window: WindowService) {
    super($state);
  }

  $onInit(): void {
    this.contextGuid = this.parentContextGuid;
    this.createOptions();
  }

  getDisplayName(key: string): string {
    let displayName = key;
    if (this.$window.semanticDomains_en != null && key in this.$window.semanticDomains_en) {
      displayName = this.$window.semanticDomains_en[key].value;
    }

    return displayName;
  }

  showDeleteButton(valueToBeDeleted: string, value: string): boolean {
    if (this.$window.semanticDomains_en != null && this.isAtEditorEntry() && this.control.rights.canEditEntry()) {
      return valueToBeDeleted === value;
    }

    return false;
  }

  orderItemsByListOrder = (key: string): string => {
    return key;
  }

  showAddButton(): boolean {
    return this.control.rights.canEditEntry() && this.isAtEditorEntry() && !this.isAdding && this.model != null &&
      this.$window.semanticDomains_en != null &&
      this.model.values.length < Object.keys(this.$window.semanticDomains_en).length;
  }

  private createOptions(): void {
    this.options = [];
    for (const key in this.$window.semanticDomains_en) {
      if (this.$window.semanticDomains_en.hasOwnProperty(key)) {
        this.options.push(this.$window.semanticDomains_en[key]);
      }
    }
  }

}

export const FieldSemanticDomainComponent: angular.IComponentOptions = {
  bindings: {
    model: '=',
    config: '<',
    control: '<',
    fieldName: '<',
    parentContextGuid: '<',
    selectField: '&?'
  },
  controller: FieldSemanticDomainController,
  templateUrl: '/angular-app/languageforge/lexicon/editor/field/dc-semanticdomain.component.html'
};
