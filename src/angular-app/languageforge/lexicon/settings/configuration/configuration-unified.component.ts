import * as angular from 'angular';

import {ModalService} from '../../../../bellows/core/modal/modal.service';
import {User} from '../../../../bellows/shared/model/user.model';
import {LexiconConfigService} from '../../core/lexicon-config.service';
import {
  LexConfig,
  LexConfigField,
  LexConfigFieldList,
  LexConfigMultiText,
  LexConfigOptionList,
  LexiconConfig,
  LexViewFieldConfig,
  LexViewMultiTextFieldConfig
} from '../../shared/model/lexicon-config.model';
import {LexOptionList} from '../../shared/model/option-list.model';
import {Field} from './configuration-fields.component';
import {ConfigurationUnifiedViewModel} from './configuration-unified-view.model';
import {ConfigurationInputSystemsViewModel} from './input-system-view.model';

export class UnifiedConfigurationController implements angular.IController {
  uccCurrentField: Field;
  uccFieldConfig: { [fieldName: string]: LexConfigField };
  uccConfigDirty: LexiconConfig;
  uccInputSystemViewModels: { [inputSystemId: string]: ConfigurationInputSystemsViewModel };
  uccInputSystemsList: ConfigurationInputSystemsViewModel[];
  uccUsers: { [userId: string]: User };
  readonly uccConfigPristine: LexiconConfig;
  readonly uccOptionLists: LexOptionList[];
  uccSelectField: (params: { fieldName: string }) => void;
  uccAddInputSystem: (params: {}) => void;
  uccOnUpdate: (params: { $event: { unifiedViewModel?: ConfigurationUnifiedViewModel,
    configDirty?: LexiconConfig } }) => void;

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

  selectAllRow = ConfigurationUnifiedViewModel.selectAllRow;

  checkIfAllRowSelected = ConfigurationUnifiedViewModel.checkIfAllRowSelected;

  selectField(fieldName: string) {
    this.uccSelectField({ fieldName });
  }

  openNewCustomFieldModal(): void {
    class NewCustomData {
      code: string;
      level: string;
      listCode?: string;
      name: string;
      type: string;
    }

    const modalInstance = this.$modal.open({
      scope: this.$scope,
      templateUrl: '/angular-app/languageforge/lexicon/settings/configuration/new-custom-field.html',
      controller: ['$scope', '$uibModalInstance',
        (scope: any, $modalInstance: angular.ui.bootstrap.IModalInstanceService) => {
          scope.fieldConfig = this.uccFieldConfig;
          scope.selects = {};
          scope.selects.level = {
            optionsOrder: ['entry', 'senses', 'examples'],
            options: {
              entry: 'Entry Level',
              senses: 'Meaning Level',
              examples: 'Example Level'
            }
          };
          scope.selects.type = {
            optionsOrder: ['multitext', 'optionlist', 'multioptionlist'],
            options: {
              multitext: 'Multi-input-system Text',
              optionlist: 'Option List',
              multioptionlist: 'Multi-option List',
              reference: 'Entry Reference',
              picture: 'Picture',
              date: 'Date',
              number: 'Number'
            }
          };
          scope.selects.listCode = {
            optionsOrder: [],
            options: {}
          };
          angular.forEach(this.uccOptionLists, optionList => {
            scope.selects.listCode.optionsOrder.push(optionList.code);
            scope.selects.listCode.options[optionList.code] = optionList.name;
          });

          scope.newCustomData = new NewCustomData();
          scope.newCustomData.name = '';
          scope.customFieldNameExists = function customFieldNameExists(level: string, code: string) {
            const customFieldName = 'customField_' + level + '_' + code;
            return customFieldName in scope.fieldConfig;
          };

          scope.add = function add() {
            $modalInstance.close(scope.newCustomData);
          };

          scope.$watch('newCustomData.name', (newValue: string, oldValue: string) => {
            if (angular.isDefined(newValue) && newValue !== oldValue) {

              // replace spaces with underscore
              scope.newCustomData.code = newValue.replace(/ /g, '_');
            }
          });

        }
      ]
    });

    modalInstance.result.then((newCustomData: NewCustomData) => {
      const customFieldName = 'customField_' + newCustomData.level + '_' + newCustomData.code;
      const customField: LexConfigField = new LexConfig();
      const customViewField: LexViewFieldConfig = new LexViewFieldConfig();
      customField.label = newCustomData.name;
      customField.type = newCustomData.type;
      customField.hideIfEmpty = false;
      customViewField.type = 'basic';
      customViewField.show = false;
      switch (newCustomData.type) {
        case 'multitext':
          const customMutliTextField = customField as LexConfigMultiText;
          const customMultiTextViewField = (customViewField as LexViewMultiTextFieldConfig);
          customMutliTextField.displayMultiline = false;
          customMutliTextField.width = 20;
          customMutliTextField.inputSystems = [this.uccInputSystemsList[0].inputSystem.tag];
          customMultiTextViewField.type = 'multitext';
          customMultiTextViewField.overrideInputSystems = false;
          customMultiTextViewField.inputSystems = [];
          break;
        case 'optionlist':
        case 'multioptionlist':
          const customOptionlistField = customField as LexConfigOptionList;
          customOptionlistField.listCode = newCustomData.listCode;
          break;
      }

      switch (newCustomData.level) {
        case 'examples':
          ((this.uccConfigDirty.entry.fields.senses as LexConfigFieldList).fields.examples as LexConfigFieldList)
            .fields[customFieldName] = customField;
          this.uccFieldConfig[customFieldName] = ((this.uccConfigDirty.entry.fields.senses as LexConfigFieldList).fields
            .examples as LexConfigFieldList).fields[customFieldName];
          if (!(customFieldName in ((this.uccConfigDirty.entry.fields.senses as LexConfigFieldList).fields
              .examples as LexConfigFieldList).fieldOrder)
          ) {
            ((this.uccConfigDirty.entry.fields.senses as LexConfigFieldList).fields.examples as LexConfigFieldList)
              .fieldOrder.push(customFieldName);
          }

          break;
        case 'senses':
          (this.uccConfigDirty.entry.fields.senses as LexConfigFieldList).fields[customFieldName] = customField;
          this.uccFieldConfig[customFieldName] = (this.uccConfigDirty.entry.fields.senses as LexConfigFieldList)
            .fields[customFieldName];
          if (!(customFieldName in (this.uccConfigDirty.entry.fields.senses as LexConfigFieldList).fieldOrder)) {
            (this.uccConfigDirty.entry.fields.senses as LexConfigFieldList).fieldOrder.push(customFieldName);
          }

          break;
        case 'entry':
        default:
          this.uccConfigDirty.entry.fields[customFieldName] = customField;
          this.uccFieldConfig[customFieldName] = this.uccConfigDirty.entry.fields[customFieldName];
          if (!(customFieldName in this.uccConfigDirty.entry.fieldOrder)) {
            this.uccConfigDirty.entry.fieldOrder.push(customFieldName);
          }
      }

      angular.forEach(this.uccConfigDirty.roleViews, roleView => {
        roleView.fields[customFieldName] = angular.copy(customViewField);
      });

      const role = 'project_manager';
      this.uccConfigDirty.roleViews[role].fields[customFieldName].show = true;
      angular.forEach(this.uccConfigDirty.userViews, userView => {
        userView.fields[customFieldName] = angular.copy(customViewField);
      });

      this.uccOnUpdate({ $event: { configDirty: this.uccConfigDirty } });
      this.selectField(customFieldName);
    }, angular.noop);

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
    uccAddInputSystem: '&',
    uccOnUpdate: '&'
  },
  controller: UnifiedConfigurationController,
  templateUrl: '/angular-app/languageforge/lexicon/settings/configuration/configuration-unified.component.html'
};
