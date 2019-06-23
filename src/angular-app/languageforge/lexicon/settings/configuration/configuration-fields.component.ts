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
  LexUserViewConfig,
  LexViewFieldConfig,
  LexViewMultiTextFieldConfig
} from '../../shared/model/lexicon-config.model';
import {LexOptionList} from '../../shared/model/option-list.model';
import {ConfigurationFieldUnifiedViewModel, FieldSettings, Group, GroupList} from './field-unified-view.model';
import {ConfigurationInputSystemsViewModel} from './input-system-view.model';

export class FieldsConfigurationController implements angular.IController {
  fccFieldConfig: { [fieldName: string]: LexConfigField };
  fccConfigDirty: LexiconConfig;
  fccInputSystemsList: ConfigurationInputSystemsViewModel[];
  fccUsers: { [userId: string]: User };
  readonly fccOptionLists: LexOptionList[];
  fccAddInputSystem: (params: {}) => void;
  fccOnUpdate: (params: { $event: {
    unifiedViewModel?: ConfigurationFieldUnifiedViewModel,
    configDirty?: LexiconConfig,
    isInitialLoad?: boolean
  } }) => void;

  unifiedViewModel: ConfigurationFieldUnifiedViewModel;
  typeahead: Typeahead;

  static $inject: string[] = ['$scope', '$filter', '$uibModal'];
  constructor(private $scope: angular.IScope, private $filter: angular.IFilterService, private $modal: ModalService) { }

  $onInit() {
    this.$scope.$watch(() => this.unifiedViewModel, (newVal, oldVal) => {
      this.fccOnUpdate({ $event: { unifiedViewModel: this.unifiedViewModel, isInitialLoad: (oldVal == null) } });
    }, true);
  }

  $onChanges(changes: any) {
    const configChange = changes.fccConfigDirty as angular.IChangesObject<LexiconConfig>;
    if (configChange != null && configChange.previousValue !== configChange.currentValue &&
      configChange.currentValue != null
    ) {
      this.unifiedViewModel = new ConfigurationFieldUnifiedViewModel(this.fccConfigDirty, this.fccUsers);
      this.typeahead = new Typeahead(this.$filter);
      for (const userId of Object.keys(this.fccUsers)) {
        this.typeahead.usersWithoutSettings.push(this.fccUsers[userId]);
      }
      for (const groupList of this.unifiedViewModel.groupLists) {
        this.removeFromUsersWithoutSettings(groupList.userId);
      }
    }
  }

  isCustomField = LexiconConfigService.isCustomField;
  selectAllRow = ConfigurationFieldUnifiedViewModel.selectAllRow;
  selectAllRoleColumn = ConfigurationFieldUnifiedViewModel.selectAllRoleColumn;
  selectAllGroupColumn = ConfigurationFieldUnifiedViewModel.selectAllGroupColumn;
  checkIfAllRoleSelected = ConfigurationFieldUnifiedViewModel.checkIfAllRoleSelected;
  checkIfAllGroupSelected = ConfigurationFieldUnifiedViewModel.checkIfAllGroupSelected;
  overrideRoleInputSystem = ConfigurationFieldUnifiedViewModel.overrideRoleInputSystem;
  overrideGroupInputSystem = ConfigurationFieldUnifiedViewModel.overrideGroupInputSystem;
  overrideRoleColumn = ConfigurationFieldUnifiedViewModel.overrideRoleColumn;
  overrideGroupColumn = ConfigurationFieldUnifiedViewModel.overrideGroupColumn;
  overrideAll = ConfigurationFieldUnifiedViewModel.overrideAll;
  resetInputSystemsForRole = ConfigurationFieldUnifiedViewModel.resetInputSystemsForRole;
  resetInputSystemsForGroup = ConfigurationFieldUnifiedViewModel.resetInputSystemsForGroup;

  openNewCustomFieldModal(fieldLevel: string): void {
    interface NewCustomData {
      code: string;
      level: string;
      listCode?: string;
      name: string;
      type: string;
    }

    const modalInstance = this.$modal.open({
      scope: this.$scope,
      templateUrl: '/angular-app/languageforge/lexicon/settings/configuration/new-custom-field.modal.html',
      controller: ['$scope', '$uibModalInstance',
        (scope: any, $modalInstance: angular.ui.bootstrap.IModalInstanceService) => {
          scope.fieldConfig = this.fccFieldConfig;
          scope.selects = {};
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
          for (const optionList of this.fccOptionLists) {
            scope.selects.listCode.optionsOrder.push(optionList.code);
            scope.selects.listCode.options[optionList.code] = optionList.name;
          }

          scope.newCustomData = {
            name: '',
            level: fieldLevel
          } as NewCustomData;
          scope.customFieldNameExists = function customFieldNameExists(level: string, code: string) {
            const customFieldName = 'customField_' + level + '_' + code;
            return customFieldName in scope.fieldConfig;
          };

          scope.add = function add() {
            $modalInstance.close(scope.newCustomData);
          };

          scope.$watch('newCustomData.name', (newValue: string, oldValue: string) => {
            if (newValue != null && newValue !== oldValue) {
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

      for (const role of Object.keys(this.fccConfigDirty.roleViews)) {
        this.fccConfigDirty.roleViews[role].fields[customFieldName] = angular.copy(customViewField);
      }

      const managerRole = 'project_manager';
      this.fccConfigDirty.roleViews[managerRole].fields[customFieldName].show = true;
      for (const userId of Object.keys(this.fccConfigDirty.userViews)) {
        this.fccConfigDirty.userViews[userId].fields[customFieldName] = angular.copy(customViewField);
      }

      this.fccOnUpdate({ $event: { configDirty: this.fccConfigDirty } });
    }, () => { });
  }

  openAddUserGroupModal(): void {
    const modalInstance = this.$modal.open({
      scope: this.$scope,
      templateUrl: '/angular-app/languageforge/lexicon/settings/configuration/new-user-group.modal.html',
      controller: ['$scope', '$uibModalInstance',
        (scope: any, $modalInstance: angular.ui.bootstrap.IModalInstanceService) => {
          scope.addGroup = function addGroup(typeahead: Typeahead): void {
            $modalInstance.close(typeahead);
          };
        }
      ]
    });

    modalInstance.result.then((typeahead: Typeahead) => {
      const user = typeahead.user;
      if (typeahead.usersWithoutSettings.indexOf(user) < 0) {
        return;
      }

      typeahead.userName = '';
      this.removeFromUsersWithoutSettings(user.id);
      this.unifiedViewModel.groupLists.push({ label: user.username, userId: user.id } as GroupList);
      this.unifiedViewModel.inputSystems.hasCustomInputSystemsOverride.groups.push(new Group());
      this.unifiedViewModel.inputSystems.selectAllColumns.groups.push(new Group());
      this.unifiedViewModel.entryFields.selectAllColumns.groups.push(new Group());
      this.unifiedViewModel.senseFields.selectAllColumns.groups.push(new Group());
      this.unifiedViewModel.exampleFields.selectAllColumns.groups.push(new Group());

      for (const inputSystemSetting of this.unifiedViewModel.inputSystems.settings) {
        inputSystemSetting.groups.push(new Group());
        ConfigurationFieldUnifiedViewModel.checkIfAllRowSelected(inputSystemSetting);
      }

      for (const fieldSetting of this.unifiedViewModel.entryFields.settings) {
        fieldSetting.groups.push(new Group());
        ConfigurationFieldUnifiedViewModel.checkIfAllRowSelected(fieldSetting);
      }

      for (const fieldSetting of this.unifiedViewModel.senseFields.settings) {
        fieldSetting.groups.push(new Group());
        ConfigurationFieldUnifiedViewModel.checkIfAllRowSelected(fieldSetting);
      }

      for (const fieldSetting of this.unifiedViewModel.exampleFields.settings) {
        fieldSetting.groups.push(new Group());
        ConfigurationFieldUnifiedViewModel.checkIfAllRowSelected(fieldSetting);
      }

      this.fccConfigDirty.userViews[user.id] =
        angular.copy(this.fccConfigDirty.roleViews[user.role]) as LexUserViewConfig;
    }, () => { });
  }

  removeGroup(index: number): void {
    const userId = this.unifiedViewModel.groupLists[index].userId;
    this.typeahead.usersWithoutSettings.push(this.fccUsers[userId]);
    this.unifiedViewModel.groupLists.splice(index, 1);
    this.unifiedViewModel.inputSystems.hasCustomInputSystemsOverride.groups.splice(index, 1);
    this.unifiedViewModel.inputSystems.selectAllColumns.groups.splice(index, 1);
    this.unifiedViewModel.entryFields.selectAllColumns.groups.splice(index, 1);
    this.unifiedViewModel.senseFields.selectAllColumns.groups.splice(index, 1);
    this.unifiedViewModel.exampleFields.selectAllColumns.groups.splice(index, 1);

    for (const inputSystemSetting of this.unifiedViewModel.inputSystems.settings) {
      inputSystemSetting.groups.splice(index, 1);
      ConfigurationFieldUnifiedViewModel.checkIfAllRowSelected(inputSystemSetting);
    }

    for (const fieldSetting of this.unifiedViewModel.entryFields.settings) {
      fieldSetting.groups.splice(index, 1);
      ConfigurationFieldUnifiedViewModel.checkIfAllRowSelected(fieldSetting);
    }

    for (const fieldSetting of this.unifiedViewModel.senseFields.settings) {
      fieldSetting.groups.splice(index, 1);
      ConfigurationFieldUnifiedViewModel.checkIfAllRowSelected(fieldSetting);
    }

    for (const fieldSetting of this.unifiedViewModel.exampleFields.settings) {
      fieldSetting.groups.splice(index, 1);
      ConfigurationFieldUnifiedViewModel.checkIfAllRowSelected(fieldSetting);
    }

    delete this.fccConfigDirty.userViews[userId];
  }

  // noinspection JSMethodCanBeStatic
  collapseIconClass(fieldSetting: FieldSettings): string {
    if (fieldSetting.isCustomInputSystemsCollapsed) {
      return 'fa fa-chevron-down';
    } else {
      return 'fa fa-chevron-up';
    }
  }

  // noinspection JSMethodCanBeStatic
  collapseTitle(fieldSetting: FieldSettings): string {
    return fieldSetting.isCustomInputSystemsCollapsed ?
      'Show field-specific Input Systems' :
      'Hide field-specific Input Systems';
  }

  // noinspection JSMethodCanBeStatic
  propertyExists(property: string, object: any): boolean {
    return property in object;
  }

  private removeFromUsersWithoutSettings(userId: string): void {
    const user: User = this.fccUsers[userId];
    const removeIndex: number = this.typeahead.usersWithoutSettings.indexOf(user);
    if (removeIndex !== -1) {
      this.typeahead.usersWithoutSettings.splice(removeIndex, 1);
    }
  }
}

class Typeahead {
  user: User;
  userName: string;
  users: User[] = [];
  usersWithoutSettings: User[] = [];
  filter: angular.IFilterService;

  constructor(filter: angular.IFilterService) {
    this.filter = filter;
  }

  // noinspection JSUnusedGlobalSymbols
  searchUsers = (user: User): void => {
    if (user == null) {
      return;
    }

    this.users = this.filter('filter')(this.usersWithoutSettings, user);
  }

  selectUser = (user: User): void => {
    if (user == null) {
      return;
    }

    this.user = user;
    this.userName = user.name;
  }

  // noinspection JSMethodCanBeStatic
  imageSource(avatarRef: string): string {
    return avatarRef ? '/Site/views/shared/image/avatar/' + avatarRef :
      '/Site/views/shared/image/avatar/anonymous02.png';
  }
}

export const FieldsConfigurationComponent: angular.IComponentOptions = {
  bindings: {
    fccFieldConfig: '<',
    fccConfigDirty: '<',
    fccInputSystemsList: '<',
    fccUsers: '<',
    fccOptionLists: '<',
    fccAddInputSystem: '&',
    fccResetInputSystems: '&',
    fccOnUpdate: '&'
  },
  controller: FieldsConfigurationController,
  templateUrl: '/angular-app/languageforge/lexicon/settings/configuration/configuration-fields.component.html'
};
