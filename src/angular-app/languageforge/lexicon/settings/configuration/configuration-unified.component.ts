import * as angular from 'angular';

import {ModalService} from '../../../../bellows/core/modal/modal.service';
import {LexiconConfigService} from '../../core/lexicon-config.service';
import {LexConfigField, LexiconConfig} from '../../shared/model/lexicon-config.model';
import {LexOptionList} from '../../shared/model/option-list.model';
import {Field} from './configuration-fields.component';
import {ConfigurationInputSystemsViewModel} from './input-system-view.model';

export class UnifiedConfigurationController implements angular.IController {
  uccCurrentField: Field;
  uccFieldConfig: { [fieldName: string]: LexConfigField };
  uccConfigDirty: LexiconConfig;
  uccInputSystemViewModels: { [inputSystemId: string]: ConfigurationInputSystemsViewModel };
  uccInputSystemsList: ConfigurationInputSystemsViewModel[];
  readonly uccConfigPristine: LexiconConfig;
  readonly uccOptionLists: LexOptionList[];
  uccSelectField: (params: { fieldName: string }) => void;
  uccOnUpdate: (params: { $event: { configDirty: LexiconConfig } }) => void;

  static $inject: string[] = ['$scope', '$uibModal'];
  constructor(private $scope: angular.IScope, private $modal: ModalService) {
  }

}

export const UnifiedConfigurationComponent: angular.IComponentOptions = {
  bindings: {
    uccCurrentField: '<',
    uccFieldConfig: '<',
    uccConfigDirty: '<',
    uccConfigPristine: '<',
    uccInputSystemViewModels: '<',
    uccInputSystemsList: '<',
    uccOptionLists: '<',
    uccSelectField: '&',
    uccOnUpdate: '&'
  },
  controller: UnifiedConfigurationController,
  templateUrl: '/angular-app/languageforge/lexicon/settings/configuration/configuration-unified.component.html'
};
