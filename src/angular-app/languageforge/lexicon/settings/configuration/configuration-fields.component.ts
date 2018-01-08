import * as angular from 'angular';

import {ModalService} from '../../../../bellows/core/modal/modal.service';
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
import {ConfigurationInputSystemsViewModel} from './input-system-view.model';

class FieldInputSystems {
  fieldOrder: string[];
  selecteds: any;
}

export class Field {
  name: string;
  inputSystems: FieldInputSystems;
}

export class FieldConfigurationController implements angular.IController {
  fccCurrentField: Field;
  fccFieldConfig: { [fieldName: string]: LexConfigField };
  fccConfigDirty: LexiconConfig;
  // noinspection JSUnusedGlobalSymbols
  fccInputSystemViewModels: { [inputSystemId: string]: ConfigurationInputSystemsViewModel };
  // noinspection JSUnusedGlobalSymbols
  fccInputSystemsList: ConfigurationInputSystemsViewModel[];
  readonly fccConfigPristine: LexiconConfig;
  readonly fccOptionLists: LexOptionList[];
  fccSelectField: (params: { fieldName: string }) => void;
  fccOnUpdate: (params: { $event: { configDirty: LexiconConfig } }) => void;

  isCustomField = LexiconConfigService.isCustomField;

  editInputSystems = {
    collapsed: true,
    done() {
      this.collapsed = true;
    }
  };
  showAllFields = false;

  static $inject: string[] = ['$scope', '$uibModal'];
  constructor(private $scope: angular.IScope, private $modal: ModalService) {
    $scope.$watchCollection(() => this.fccCurrentField.inputSystems.selecteds,
      (newValue: { [languageTag: string]: boolean }) => {
        if (newValue != null && this.fccFieldConfig != null && this.fccCurrentField != null) {
          const currentFieldConfigMultiText = this.fccFieldConfig[this.fccCurrentField.name] as LexConfigMultiText;
          if (angular.isDefined(currentFieldConfigMultiText.inputSystems)) {
            currentFieldConfigMultiText.inputSystems = [];
            angular.forEach(this.fccCurrentField.inputSystems.fieldOrder, tag => {
              if (this.fccCurrentField.inputSystems.selecteds[tag]) {
                currentFieldConfigMultiText.inputSystems.push(tag);
              }
            });
          }
        }
      }
    );
  }

  selectField(fieldName: string) {
    this.fccSelectField({ fieldName });
  }

  moveUp(currentTag: string): void {
    const currentTagIndex = this.fccCurrentField.inputSystems.fieldOrder.indexOf(currentTag);
    this.fccCurrentField.inputSystems.fieldOrder[currentTagIndex] =
      this.fccCurrentField.inputSystems.fieldOrder[currentTagIndex - 1];
    this.fccCurrentField.inputSystems.fieldOrder[currentTagIndex - 1] = currentTag;
    const currentFieldConfigMultiText = this.fccFieldConfig[this.fccCurrentField.name] as LexConfigMultiText;
    currentFieldConfigMultiText.inputSystems = [];
    angular.forEach(this.fccCurrentField.inputSystems.fieldOrder, tag => {
      if (this.fccCurrentField.inputSystems.selecteds[tag]) {
        currentFieldConfigMultiText.inputSystems.push(tag);
      }
    });

    this.fccOnUpdate({ $event: { configDirty: this.fccConfigDirty } });
  }

  moveDown(currentTag: string): void {
    const currentTagIndex = this.fccCurrentField.inputSystems.fieldOrder.indexOf(currentTag);
    this.fccCurrentField.inputSystems.fieldOrder[currentTagIndex] =
      this.fccCurrentField.inputSystems.fieldOrder[currentTagIndex + 1];
    this.fccCurrentField.inputSystems.fieldOrder[currentTagIndex + 1] = currentTag;
    const currentFieldConfigMultiText = this.fccFieldConfig[this.fccCurrentField.name] as LexConfigMultiText;
    currentFieldConfigMultiText.inputSystems = [];
    angular.forEach(this.fccCurrentField.inputSystems.fieldOrder, tag => {
      if (this.fccCurrentField.inputSystems.selecteds[tag]) {
        currentFieldConfigMultiText.inputSystems.push(tag);
      }
    });

    this.fccOnUpdate({ $event: { configDirty: this.fccConfigDirty } });
  }

  fieldIsHidden(fieldName: string): boolean {
    if (angular.isUndefined(this.fccFieldConfig[fieldName]) ||
      !('hideIfEmpty' in this.fccFieldConfig[fieldName])) {
      return true;
    }

    return !this.showAllFields && this.fccFieldConfig[fieldName].hideIfEmpty;
  }

  fieldConfigItemExists(itemName: string): boolean {
    if (this.fccCurrentField != null && this.fccCurrentField != null) {
      return false;
    }
    return itemName in this.fccFieldConfig[this.fccCurrentField.name];
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
          scope.fieldConfig = this.fccFieldConfig;
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
          angular.forEach(this.fccOptionLists, optionList => {
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
          customMutliTextField.inputSystems = [this.fccInputSystemsList[0].inputSystem.tag];
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
          ((this.fccConfigDirty.entry.fields.senses as LexConfigFieldList).fields.examples as LexConfigFieldList)
            .fields[customFieldName] = customField;
          this.fccFieldConfig[customFieldName] = ((this.fccConfigDirty.entry.fields.senses as LexConfigFieldList).fields
            .examples as LexConfigFieldList).fields[customFieldName];
          if (!(customFieldName in ((this.fccConfigDirty.entry.fields.senses as LexConfigFieldList).fields
              .examples as LexConfigFieldList).fieldOrder)
          ) {
            ((this.fccConfigDirty.entry.fields.senses as LexConfigFieldList).fields.examples as LexConfigFieldList)
              .fieldOrder.push(customFieldName);
          }

          break;
        case 'senses':
          (this.fccConfigDirty.entry.fields.senses as LexConfigFieldList).fields[customFieldName] = customField;
          this.fccFieldConfig[customFieldName] = (this.fccConfigDirty.entry.fields.senses as LexConfigFieldList)
            .fields[customFieldName];
          if (!(customFieldName in (this.fccConfigDirty.entry.fields.senses as LexConfigFieldList).fieldOrder)) {
            (this.fccConfigDirty.entry.fields.senses as LexConfigFieldList).fieldOrder.push(customFieldName);
          }

          break;
        case 'entry':
        default:
          this.fccConfigDirty.entry.fields[customFieldName] = customField;
          this.fccFieldConfig[customFieldName] = this.fccConfigDirty.entry.fields[customFieldName];
          if (!(customFieldName in this.fccConfigDirty.entry.fieldOrder)) {
            this.fccConfigDirty.entry.fieldOrder.push(customFieldName);
          }
      }

      angular.forEach(this.fccConfigDirty.roleViews, roleView => {
        roleView.fields[customFieldName] = angular.copy(customViewField);
      });

      const role = 'project_manager';
      this.fccConfigDirty.roleViews[role].fields[customFieldName].show = true;
      angular.forEach(this.fccConfigDirty.userViews, userView => {
        userView.fields[customFieldName] = angular.copy(customViewField);
      });

      this.fccOnUpdate({ $event: { configDirty: this.fccConfigDirty } });
      this.selectField(customFieldName);
    }, angular.noop);
  }

  showRemoveCustomField(fieldName: string): boolean {
    return LexiconConfigService.isCustomField(fieldName) &&
      !(fieldName in this.fccConfigPristine.entry.fields) &&
      !(fieldName in (this.fccConfigPristine.entry.fields.senses as LexConfigFieldList).fields) &&
      !(fieldName in ((this.fccConfigPristine.entry.fields.senses as LexConfigFieldList).fields
        .examples as LexConfigFieldList).fields);
  }

  removeSelectedCustomField(): void {
    const fieldName = this.fccCurrentField.name;
    let i: number;
    if (LexiconConfigService.isCustomField(fieldName)) {
      delete this.fccFieldConfig[fieldName];

      // remove field name from fieldOrder
      i = ((this.fccConfigDirty.entry.fields.senses as LexConfigFieldList).fields.examples as LexConfigFieldList)
        .fieldOrder.indexOf(fieldName);
      if (i > -1) {
        ((this.fccConfigDirty.entry.fields.senses as LexConfigFieldList).fields.examples as LexConfigFieldList)
          .fieldOrder.splice(i, 1);
      }

      i = (this.fccConfigDirty.entry.fields.senses as LexConfigFieldList).fieldOrder.indexOf(fieldName);
      if (i > -1) {
        (this.fccConfigDirty.entry.fields.senses as LexConfigFieldList).fieldOrder.splice(i, 1);
      }

      i = this.fccConfigDirty.entry.fieldOrder.indexOf(fieldName);
      if (i > -1) {
        this.fccConfigDirty.entry.fieldOrder.splice(i, 1);
      }

      this.fccOnUpdate({ $event: { configDirty: this.fccConfigDirty } });
      this.selectField('lexeme');
    }
  }

}

export const FieldConfigurationComponent: angular.IComponentOptions = {
  bindings: {
    fccCurrentField: '<',
    fccFieldConfig: '<',
    fccConfigDirty: '<',
    fccConfigPristine: '<',
    fccInputSystemViewModels: '<',
    fccInputSystemsList: '<',
    fccOptionLists: '<',
    fccSelectField: '&',
    fccOnUpdate: '&'
  },
  controller: FieldConfigurationController,
  templateUrl: '/angular-app/languageforge/lexicon/settings/configuration/configuration-fields.component.html'
};
