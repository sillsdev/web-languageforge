import * as angular from 'angular';

import {SemanticDomain, SemanticDomainsService} from '../../../core/semantic-domains/semantic-domains.service';
import {FieldMultiOptionListController} from './dc-multioptionlist.component';

export class FieldSemanticDomainController extends FieldMultiOptionListController implements angular.IController {
  options: SemanticDomain[] = [];

  static $inject = ['$scope', '$state', 'semanticDomainsService'];
  constructor(private readonly $scope: angular.IScope, protected $state: angular.ui.IStateService,
              private readonly semanticDomains: SemanticDomainsService) {
    super($state);
  }

  $onInit(): void {
    this.contextGuid = this.parentContextGuid;
    this.semanticDomains.setLanguageCode(this.control.interfaceConfig.languageCode).then(this.createOptions);

    this.$scope.$watch(() => this.control.interfaceConfig.languageCode, (newVal: string) => {
      if (newVal != null) {
        this.semanticDomains.setLanguageCode(this.control.interfaceConfig.languageCode).then(this.createOptions);
      }
    });
  }

  getDisplayName(key: string): string {
    let displayName = key;
    if (this.semanticDomains.data != null && key in this.semanticDomains.data) {
      displayName = this.semanticDomains.data[key].value;
    }

    return displayName;
  }

  showDeleteButton(valueToBeDeleted: string, value: string): boolean {
    if (this.semanticDomains.data != null && this.isAtEditorEntry() &&
      this.control.rights.canEditEntry()
    ) {
      return valueToBeDeleted === value;
    }

    return false;
  }

  orderItemsByListOrder = (key: string): string => {
    return key;
  }

  showAddButton(): boolean {
    return this.control.rights.canEditEntry() && this.isAtEditorEntry() && !this.isAdding && this.model != null &&
      this.semanticDomains.data != null &&
      this.model.values.length < Object.keys(this.semanticDomains.data).length;
  }

  private createOptions = (): void => {
    this.options = [];
    for (const key in this.semanticDomains.data) {
      if (this.semanticDomains.data.hasOwnProperty(key)) {
        this.options.push(this.semanticDomains.data[key]);
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
