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
import {ConfigurationUnifiedViewModel, FieldSettings, Group, GroupList} from './configuration-unified-view.model';
import {ConfigurationInputSystemsViewModel} from './input-system-view.model';

export class UnifiedConfigurationController implements angular.IController {
  uccFieldConfig: { [fieldName: string]: LexConfigField };
  uccConfigDirty: LexiconConfig;
  uccInputSystemsList: ConfigurationInputSystemsViewModel[];
  uccUsers: { [userId: string]: User };
  readonly uccOptionLists: LexOptionList[];
  uccAddInputSystem: (params: {}) => void;
  uccOnUpdate: (params: { $event: {
    unifiedViewModel?: ConfigurationUnifiedViewModel,
    configDirty?: LexiconConfig,
    isInitialLoad?: boolean
  } }) => void;

  unifiedViewModel: ConfigurationUnifiedViewModel;
  typeahead: Typeahead;

  static $inject: string[] = ['$scope', '$filter', '$uibModal'];
  constructor(private $scope: angular.IScope, private $filter: angular.IFilterService, private $modal: ModalService) { }

  $onInit() {
    this.$scope.$watch(() => this.unifiedViewModel, (newVal, oldVal) => {
      this.uccOnUpdate({ $event: { unifiedViewModel: this.unifiedViewModel, isInitialLoad: (oldVal == null) } });
    }, true);
  }

  $onChanges(changes: any) {
    const configChange = changes.uccConfigDirty as angular.IChangesObject<LexiconConfig>;
    if (configChange != null && configChange.previousValue !== configChange.currentValue &&
      configChange.currentValue != null
    ) {
      this.unifiedViewModel = new ConfigurationUnifiedViewModel(this.uccConfigDirty, this.uccUsers);
      this.typeahead = new Typeahead(this.$filter);
      for (const userId in this.uccUsers) {
        if (this.uccUsers.hasOwnProperty(userId)) {
          this.typeahead.usersWithoutSettings.push(this.uccUsers[userId]);
        }
      }
      for (const groupList of this.unifiedViewModel.groupLists) {
        this.removeFromUsersWithoutSettings(groupList.userId);
      }
    }
  }

  isCustomField = LexiconConfigService.isCustomField;
  selectAllRow = ConfigurationUnifiedViewModel.selectAllRow;
  selectAllRoleColumn = ConfigurationUnifiedViewModel.selectAllRoleColumn;
  selectAllGroupColumn = ConfigurationUnifiedViewModel.selectAllGroupColumn;
  checkIfAllRoleSelected = ConfigurationUnifiedViewModel.checkIfAllRoleSelected;
  checkIfAllGroupSelected = ConfigurationUnifiedViewModel.checkIfAllGroupSelected;

  openNewCustomFieldModal(fieldLevel: string): void {
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
          scope.newCustomData.level = fieldLevel;
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
    }, angular.noop);
  }

  openAddUserGroupModal(): void {
    const modalInstance = this.$modal.open({
      scope: this.$scope,
      templateUrl: '/angular-app/languageforge/lexicon/settings/configuration/new-user-group.html',
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
      this.unifiedViewModel.groupLists.push(new GroupList(user.username, user.id));
      this.unifiedViewModel.inputSystems.selectAllColumns.groups.push(new Group());
      this.unifiedViewModel.entryFields.selectAllColumns.groups.push(new Group());
      this.unifiedViewModel.senseFields.selectAllColumns.groups.push(new Group());
      this.unifiedViewModel.exampleFields.selectAllColumns.groups.push(new Group());

      for (const inputSystemSetting of this.unifiedViewModel.inputSystems.settings) {
        inputSystemSetting.groups.push(new Group());
        ConfigurationUnifiedViewModel.checkIfAllRowSelected(inputSystemSetting);
      }

      for (const fieldSetting of this.unifiedViewModel.entryFields.settings) {
        fieldSetting.groups.push(new Group());
        ConfigurationUnifiedViewModel.checkIfAllRowSelected(fieldSetting);
      }

      for (const fieldSetting of this.unifiedViewModel.senseFields.settings) {
        fieldSetting.groups.push(new Group());
        ConfigurationUnifiedViewModel.checkIfAllRowSelected(fieldSetting);
      }

      for (const fieldSetting of this.unifiedViewModel.exampleFields.settings) {
        fieldSetting.groups.push(new Group());
        ConfigurationUnifiedViewModel.checkIfAllRowSelected(fieldSetting);
      }

      this.uccConfigDirty.userViews[user.id] =
        angular.copy(this.uccConfigDirty.roleViews[user.role]) as LexUserViewConfig;
    }, angular.noop);
  }

  removeGroup(index: number): void {
    const userId = this.unifiedViewModel.groupLists[index].userId;
    this.typeahead.usersWithoutSettings.push(this.uccUsers[userId]);
    this.unifiedViewModel.groupLists.splice(index, 1);
    this.unifiedViewModel.inputSystems.selectAllColumns.groups.splice(index, 1);
    this.unifiedViewModel.entryFields.selectAllColumns.groups.splice(index, 1);
    this.unifiedViewModel.senseFields.selectAllColumns.groups.splice(index, 1);
    this.unifiedViewModel.exampleFields.selectAllColumns.groups.splice(index, 1);

    for (const inputSystemSetting of this.unifiedViewModel.inputSystems.settings) {
      inputSystemSetting.groups.splice(index, 1);
      ConfigurationUnifiedViewModel.checkIfAllRowSelected(inputSystemSetting);
    }

    for (const fieldSetting of this.unifiedViewModel.entryFields.settings) {
      fieldSetting.groups.splice(index, 1);
      ConfigurationUnifiedViewModel.checkIfAllRowSelected(fieldSetting);
    }

    for (const fieldSetting of this.unifiedViewModel.senseFields.settings) {
      fieldSetting.groups.splice(index, 1);
      ConfigurationUnifiedViewModel.checkIfAllRowSelected(fieldSetting);
    }

    for (const fieldSetting of this.unifiedViewModel.exampleFields.settings) {
      fieldSetting.groups.splice(index, 1);
      ConfigurationUnifiedViewModel.checkIfAllRowSelected(fieldSetting);
    }

    delete this.uccConfigDirty.userViews[userId];
  }

  // noinspection JSMethodCanBeStatic
  collapseIconClass(fieldSetting: FieldSettings): string {
    if (fieldSetting.isCustomInputSystemsCollapsed) {
      if (fieldSetting.hasCustomInputSystemsOverride) {
        return 'fa fa-check-square-o';
      } else {
        return 'fa fa-chevron-down';
      }
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

  private removeFromUsersWithoutSettings(userId: string): void {
    const user: User = this.uccUsers[userId];
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
    this.users = this.filter('filter')(this.usersWithoutSettings, user);
  }

  selectUser = (user: User): void => {
    this.user = user;
    this.userName = user.name;
  }

  // noinspection JSMethodCanBeStatic
  imageSource(avatarRef: string): string {
    return avatarRef ? '/Site/views/shared/image/avatar/' + avatarRef :
      '/Site/views/shared/image/avatar/anonymous02.png';
  }
}

export const UnifiedConfigurationComponent: angular.IComponentOptions = {
  bindings: {
    uccFieldConfig: '<',
    uccConfigDirty: '<',
    uccInputSystemsList: '<',
    uccUsers: '<',
    uccOptionLists: '<',
    uccAddInputSystem: '&',
    uccOnUpdate: '&'
  },
  controller: UnifiedConfigurationController,
  templateUrl: '/angular-app/languageforge/lexicon/settings/configuration/configuration-unified.component.html'
};
