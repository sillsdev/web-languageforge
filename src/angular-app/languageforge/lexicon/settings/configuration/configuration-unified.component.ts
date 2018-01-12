import * as angular from 'angular';

import {ModalService} from '../../../../bellows/core/modal/modal.service';
import {User} from '../../../../bellows/shared/model/user.model';
import {LexiconConfigService} from '../../core/lexicon-config.service';
import {LexConfigField, LexiconConfig} from '../../shared/model/lexicon-config.model';
import {LexOptionList} from '../../shared/model/option-list.model';
import {Field} from './configuration-fields.component';
import {ConfigurationUnifiedViewModel, InputSystemSettings, RoleType} from './configuration-unified-view.model';
import {ConfigurationInputSystemsViewModel} from './input-system-view.model';

export class UnifiedConfigurationController implements angular.IController {
  uccCurrentField: Field;
  uccFieldConfig: { [fieldName: string]: LexConfigField };
  uccConfigDirty: LexiconConfig;
  uccInputSystemViewModels: { [inputSystemId: string]: ConfigurationInputSystemsViewModel };
  uccInputSystemsList: ConfigurationInputSystemsViewModel[];
  uccUsers: { [userId: string]: User };readonly uccConfigPristine: LexiconConfig;
  readonly uccOptionLists: LexOptionList[];
  uccSelectField: (params: { fieldName: string }) => void;
  uccOnUpdate: (params: { $event: { unifiedViewModel: ConfigurationUnifiedViewModel } }) => void;

  unifiedViewModel: ConfigurationUnifiedViewModel;

  isCustomField = LexiconConfigService.isCustomField;

  static $inject: string[] = ['$scope', '$uibModal'];
  constructor(private $scope: angular.IScope, private $modal: ModalService) {
  }

  $onInit() {
    this.$scope.$watch(() => this.unifiedViewModel, () => {
      this.uccOnUpdate({ $event: { unifiedViewModel: this.unifiedViewModel } });
    }, true);
  }

  $onChanges(changes: any) {
    const configChange = changes.uccConfigDirty as angular.IChangesObject<LexiconConfig>;
    if (configChange != null && configChange.previousValue !== configChange.currentValue &&
      configChange.currentValue != null
    ) {
      this.unifiedViewModel = new ConfigurationUnifiedViewModel(this.uccConfigDirty, this.uccUsers);
    }
  }

  selectAllRow(settings: InputSystemSettings): void {
    const roles = RoleType.roles();
    for (const role of roles) {
      settings[role] = settings.isAllRowSelected;
    }
    for (const group of settings.groups) {
      group.show = settings.isAllRowSelected;
    }
  }

  checkIfAllRowSelected(settings: InputSystemSettings): void {
    const roles = RoleType.roles();

    settings.isAllRowSelected = true;
    for (const role of roles) {
      if (!settings[role]) {
        settings.isAllRowSelected = false;
        break;
      }
    }
    if (settings.isAllRowSelected) {
      for (const group of settings.groups) {
        if (!group.show) {
          settings.isAllRowSelected = false;
          break;
        }
      }
    }
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
    uccUsers: '<',
    uccSelectField: '&',
    uccOnUpdate: '&'
  },
  controller: UnifiedConfigurationController,
  templateUrl: '/angular-app/languageforge/lexicon/settings/configuration/configuration-unified.component.html'
};
