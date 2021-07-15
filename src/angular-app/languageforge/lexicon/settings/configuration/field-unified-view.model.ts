import * as angular from 'angular';
import {User} from '../../../../bellows/shared/model/user.model';
import {
  LexConfigFieldList, LexConfigMultiText, LexConfigPictures, LexiconConfig, LexRoleViewConfig, LexUserViewConfig,
  LexViewMultiTextFieldConfig
} from '../../shared/model/lexicon-config.model';
import {ConfigurationInputSystemsViewModel} from './input-system-view.model';
import {OptionSelects} from './option-selects.model';

export class ConfigurationFieldUnifiedViewModel {
  groupLists: GroupList[];
  inputSystems: InputSystemSettingsList;
  inputSystemsPristine: InputSystemSettingsList;
  entryFields: FieldSettingsList;
  senseFields: FieldSettingsList;
  exampleFields: FieldSettingsList;

  constructor(config: LexiconConfig, users: { [userId: string]: User }) {
    this.groupLists = ConfigurationFieldUnifiedViewModel.setGroupLists(config, users);
    this.inputSystems = new InputSystemSettingsList();
    const settings = ConfigurationFieldUnifiedViewModel.setInputSystemsViewModel(config);
    this.inputSystems.settings = settings;
    this.inputSystemsPristine = angular.copy(this.inputSystems);
    const optionSelects = new OptionSelects();
    for (const tag in config.inputSystems) {
      if (config.inputSystems.hasOwnProperty(tag)) {
        const inputSystemViewModel =
          new ConfigurationInputSystemsViewModel(optionSelects, config.inputSystems[tag]);
        this.inputSystems.labels[tag] = inputSystemViewModel.languageDisplayName();
      }
    }

    const entryConfig = config.entry;
    this.entryFields = new FieldSettingsList();
    this.entryFields.settings = ConfigurationFieldUnifiedViewModel.setLevelViewModel(entryConfig, config);
    if ('senses' in entryConfig.fields) {
      const sensesConfig = entryConfig.fields.senses as LexConfigFieldList;
      this.senseFields = new FieldSettingsList();
      this.senseFields.settings = ConfigurationFieldUnifiedViewModel.setLevelViewModel(sensesConfig, config);
      if ('examples' in sensesConfig.fields) {
        const examplesConfig = sensesConfig.fields.examples as LexConfigFieldList;
        this.exampleFields = new FieldSettingsList();
        this.exampleFields.settings = ConfigurationFieldUnifiedViewModel.setLevelViewModel(examplesConfig, config);
      }
    }

    for (const role of RoleType.roles()) {
      ConfigurationFieldUnifiedViewModel.checkIfAllRoleColumnSelected(this.inputSystems.settings,
        this.inputSystems.selectAllColumns, role);
      ConfigurationFieldUnifiedViewModel.checkIfAllRoleColumnSelected(this.entryFields.settings,
        this.entryFields.selectAllColumns, role);
      ConfigurationFieldUnifiedViewModel.checkIfAllRoleColumnSelected(this.senseFields.settings,
        this.senseFields.selectAllColumns, role);
      ConfigurationFieldUnifiedViewModel.checkIfAllRoleColumnSelected(this.exampleFields.settings,
        this.exampleFields.selectAllColumns, role);
    }

    for (let i = 0; i < this.inputSystems.settings[0].groups.length; i++) {
      this.inputSystems.selectAllColumns.groups.push(new Group());
      this.entryFields.selectAllColumns.groups.push(new Group());
      this.senseFields.selectAllColumns.groups.push(new Group());
      this.exampleFields.selectAllColumns.groups.push(new Group());
      ConfigurationFieldUnifiedViewModel.checkIfAllGroupColumnSelected(this.inputSystems.settings,
        this.inputSystems.selectAllColumns, i);
      ConfigurationFieldUnifiedViewModel.checkIfAllGroupColumnSelected(this.entryFields.settings,
        this.entryFields.selectAllColumns, i);
      ConfigurationFieldUnifiedViewModel.checkIfAllGroupColumnSelected(this.senseFields.settings,
        this.senseFields.selectAllColumns, i);
      ConfigurationFieldUnifiedViewModel.checkIfAllGroupColumnSelected(this.exampleFields.settings,
        this.exampleFields.selectAllColumns, i);
    }
  }

  toConfig(config: LexiconConfig): void {
    // Config updates for Input Systems
    ConfigurationFieldUnifiedViewModel.inputSystemsToConfig(this.inputSystems, config, this.groupLists);

    // Config updates for fields
    const entryConfig = config.entry;
    ConfigurationFieldUnifiedViewModel
      .fieldsToConfig(this.entryFields.settings, this.inputSystems, config, entryConfig, this.groupLists);
    if ('senses' in entryConfig.fields) {
      entryConfig.fieldOrder.push('senses');
      const sensesConfig = entryConfig.fields.senses as LexConfigFieldList;
      ConfigurationFieldUnifiedViewModel
        .fieldsToConfig(this.senseFields.settings, this.inputSystems, config, sensesConfig, this.groupLists);
      if ('examples' in sensesConfig.fields) {
        sensesConfig.fieldOrder.push('examples');
        const examplesConfig = sensesConfig.fields.examples as LexConfigFieldList;
        ConfigurationFieldUnifiedViewModel
          .fieldsToConfig(this.exampleFields.settings, this.inputSystems, config, examplesConfig, this.groupLists);
      }
    }
  }

  static ensureRequiredFields(setting: SettingsBase): boolean {
    return RequiredFields.requiredFieldList.includes(setting.fieldName);
  }

  static selectAllRow(setting: SettingsBase, settings: SettingsBase[], selectAll: SettingsBase): void {
    const roles = RoleType.roles();
    const requiredFieldList = RequiredFields.requiredFieldList;
    for (const role of roles) {
      setting[role] = setting.isAllRowSelected;
      ConfigurationFieldUnifiedViewModel.checkIfAllRoleColumnSelected(settings, selectAll, role);
    }
    for (const group of setting.groups) {
      if (requiredFieldList.includes(setting.fieldName)) {
        group.show = true;
      } else {
        group.show = setting.isAllRowSelected;
      }
      ConfigurationFieldUnifiedViewModel
        .checkIfAllGroupColumnSelected(settings, selectAll, setting.groups.indexOf(group));
    }
  }

  static checkIfAllEntryFieldsRowSelected(setting: SettingsBase): void {
    const roles = RoleType.roles();
    const requiredFieldList = RequiredFields.requiredFieldList;
    setting.isAllRowSelected = true;
    for (const role of roles) {
      if (!setting[role]) {
        setting.isAllRowSelected = false;
        break;
      }
    }
    if (setting.isAllRowSelected) {
      for (const group of setting.groups) {
        if (!group.show) {
          if (requiredFieldList.includes(setting.fieldName)) {
            group.show = setting.isAllRowSelected;
            break;
          }
        }
      }
    }
  }

  static checkIfAllRowSelected(settings: SettingsBase): void {
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

  static selectAllRoleColumn(settings: SettingsBase[], selectAll: SettingsBase, role: string): void {
    for (const setting of settings) {
      setting[role] = selectAll[role];
      ConfigurationFieldUnifiedViewModel.checkIfAllRowSelected(setting);
    }
  }

  static selectAllGroupColumn(settings: SettingsBase[], selectAll: SettingsBase, groupIndex: number): void {
    for (const setting of settings) {
      setting.groups[groupIndex].show = selectAll.groups[groupIndex].show;
      ConfigurationFieldUnifiedViewModel.checkIfAllEntryFieldsRowSelected(setting);
    }
  }

  static checkIfAllRoleColumnSelected(settings: SettingsBase[], selectAll: SettingsBase, role: string): void {
    selectAll[role] = true;
    for (const setting of settings) {
      if (!setting[role]) {
        selectAll[role] = false;
        break;
      }
    }
  }

  static checkIfAllGroupColumnSelected(settings: SettingsBase[], selectAll: SettingsBase,
                                       groupIndex: number): void {
    selectAll.groups[groupIndex].show = true;
    for (const setting of settings) {
      if (!setting.groups[groupIndex].show) {
        selectAll.groups[groupIndex].show = false;
        break;
      }
    }
  }

  static checkIfAllRoleSelected(setting: SettingsBase, settings: SettingsBase[], selectAll: SettingsBase,
                                role: string): void {
    ConfigurationFieldUnifiedViewModel.checkIfAllRowSelected(setting);
    ConfigurationFieldUnifiedViewModel.checkIfAllRoleColumnSelected(settings, selectAll, role);
  }

  static checkIfAllGroupSelected(setting: SettingsBase, settings: SettingsBase[], selectAll: SettingsBase,
                                 groupIndex: number): void {
    ConfigurationFieldUnifiedViewModel.checkIfAllRowSelected(setting);
    ConfigurationFieldUnifiedViewModel.checkIfAllGroupColumnSelected(settings, selectAll, groupIndex);
  }

  private static isMultitextFieldType(fieldType: string) {
    // Picture fields are also multitext fields and have lists of input systems
    return (fieldType === 'multitext' || fieldType === 'pictures');
  }

  private static inputSystemsToConfig(inputSystemSettings: InputSystemSettingsList,
                                      config: LexiconConfig, groupLists: GroupList[]): void {
    // iterate over every role type
    const roleType = new RoleType();
    for (const role of RoleType.roles()) {
      const roleView: LexRoleViewConfig = config.roleViews[roleType[role]];
      // Was: if (roleView != null && roleView.fields != null) {
      if (roleView != null) {
        let allSelected = inputSystemSettings.selectAllColumns[role];
        const tags: string[] = [];
        if (!allSelected) {
          // add any Input Systems to the array for this role
          let tagsIndex = 0;
          for (const inputSystem of inputSystemSettings.settings) {
            if (inputSystem[role]) {
              tags[tagsIndex++] = inputSystem.tag;
            }
          }
          if (tags.length === inputSystemSettings.settings.length) {
            allSelected = true;
          }
        }

        if (allSelected) {
          roleView.inputSystems = [];
        } else {
          roleView.inputSystems = tags;
        }
      }
    }

    // iterate over groups
    for (let i = 0; i < groupLists.length; i++) {
      const userView: LexUserViewConfig = config.userViews[groupLists[i].userId];
      // Was: if (userView != null && userView.fields != null) {
      if (userView != null) {
        let allSelected = inputSystemSettings.selectAllColumns.groups[i].show;
        const tags: string[] = [];
        if (!allSelected) {
          // add any Input Systems to the array for this role
          let tagsIndex = 0;
          for (const inputSystem of inputSystemSettings.settings) {
            if (inputSystem.groups[i].show) {
              tags[tagsIndex++] = inputSystem.tag;
            }
          }
          if (tags.length === inputSystemSettings.settings.length) {
            allSelected = true;
          }

          if (allSelected) {
            userView.inputSystems = [];
          } else {
            userView.inputSystems = tags;
          }
        }
      }
    }

  }

  private static listIntersection(a: string[], b: string[]): string[] {
    const result = [];
    for (const item of a) {
      if (b.indexOf(item) !== -1) {
        result.push(item);
      }
    }
    return result;
  }

  private static fieldsToConfig(fields: FieldSettings[], inputSystemSettings: InputSystemSettingsList,
                                config: LexiconConfig, levelConfig: LexConfigFieldList, groupLists: GroupList[]): void {
    levelConfig.fieldOrder = [];
    for (const field of fields) {
      // from setLevelViewModel
      const levelConfigField = levelConfig.fields[field.fieldName];
      levelConfigField.label = field.label;
      levelConfigField.hideIfEmpty = field.hiddenIfEmpty;
      if (levelConfigField.type === 'pictures') {
        (levelConfigField as LexConfigPictures).captionHideIfEmpty = field.captionHiddenIfEmpty;
      }
      // Create this array outside the if() because we'll use it in for loops lower down
      const fieldInputSystems = [];
      if (ConfigurationFieldUnifiedViewModel.isMultitextFieldType(levelConfigField.type)) {
        const multiTextLevelConfigField = levelConfigField as LexConfigMultiText;
        multiTextLevelConfigField.inputSystems = [];
        for (const fieldInputSystemSettings of field.inputSystems) {
          if (fieldInputSystemSettings != null && fieldInputSystemSettings.isAllRowSelected) {
            fieldInputSystems.push(fieldInputSystemSettings.tag);
          }
        }
        multiTextLevelConfigField.inputSystems = fieldInputSystems;
      }

      // from setLevelRoleSettings
      const roleType = new RoleType();
      for (const role of RoleType.roles()) {
        const roleView: LexRoleViewConfig = config.roleViews[roleType[role]];
        if (roleView != null && roleView.fields != null) {
          roleView.fields[field.fieldName].show = field[role];
          // Set overridden input systems if (and only if) this role doesn't see all input systems
          if (roleView.fields.hasOwnProperty(field.fieldName) &&
              ConfigurationFieldUnifiedViewModel.isMultitextFieldType(levelConfigField.type)) {
            const roleFieldConfig = roleView.fields[field.fieldName] as LexViewMultiTextFieldConfig;
            if (roleView.inputSystems && roleView.inputSystems.length) {
              const combinedTags = this.listIntersection(fieldInputSystems, roleView.inputSystems);
              roleFieldConfig.overrideInputSystems = true;
              roleFieldConfig.inputSystems = combinedTags;
            } else {
              roleFieldConfig.overrideInputSystems = false;
              roleFieldConfig.inputSystems = [];
            }
          }
        }
      }

      // from setLevelGroupSettings
      for (let i = 0; i < groupLists.length; i++) {
        const userView = config.userViews[groupLists[i].userId];
        userView.fields[field.fieldName].show = field.groups[i].show;
        // Set overridden input systems if (and only if) this user doesn't see all input systems
        if (userView.fields.hasOwnProperty(field.fieldName) &&
            ConfigurationFieldUnifiedViewModel.isMultitextFieldType(levelConfigField.type)) {
          const userFieldConfig = userView.fields[field.fieldName] as LexViewMultiTextFieldConfig;
          if (userView.inputSystems && userView.inputSystems.length) {
            const combinedTags = this.listIntersection(fieldInputSystems, userView.inputSystems);
            userFieldConfig.overrideInputSystems = true;
            userFieldConfig.inputSystems = combinedTags;
          } else {
            userFieldConfig.overrideInputSystems = false;
            userFieldConfig.inputSystems = [];
          }
        }
      }

      levelConfig.fieldOrder.push(field.fieldName);
    }
  }

  private static setInputSystemsViewModel(config: LexiconConfig): InputSystemSettings[] {
    const inputSystems: InputSystemSettings[] = [];
    const selectedManagerTags = ConfigurationFieldUnifiedViewModel.getSelectedInputSystemsManagerTags(config);
    let i = 0;
    for (const tag of selectedManagerTags) {
      ConfigurationFieldUnifiedViewModel.setInputSystemViewModel(config, inputSystems, tag, i);
      i++;
    }
    for (const tag in config.inputSystems) {
      if (config.inputSystems.hasOwnProperty(tag) && !selectedManagerTags.includes(tag)) {
        ConfigurationFieldUnifiedViewModel.setInputSystemViewModel(config, inputSystems, tag, i);
        i++;
      }
    }

    return inputSystems;
  }

  private static setInputSystemViewModel(config: LexiconConfig, inputSystems: InputSystemSettings[],
                                         tag: string, index: number): void {
    const inputSystemSettings = new InputSystemSettings();
    inputSystemSettings.tag = tag;
    const roles = RoleType.roles();
    const roleType = new RoleType();
    for (const role of roles) {
      ConfigurationFieldUnifiedViewModel.setInputSystemRoleSettings(
        tag, config, role, roleType[role], inputSystemSettings);
    }
    let groupIndex = 0;
    for (const userId in config.userViews) {
      if (config.userViews.hasOwnProperty(userId) && config.userViews[userId] != null &&
        config.userViews[userId].fields != null
      ) {
        ConfigurationFieldUnifiedViewModel.setInputSystemGroupSettings(
          tag, config, userId, groupIndex, inputSystemSettings);
        groupIndex++;
      }
    }
    inputSystems[index] = inputSystemSettings;
    ConfigurationFieldUnifiedViewModel.checkIfAllRowSelected(inputSystemSettings);
  }

  private static addWithoutDuplicates(orig: string[], newItems: string[]): void {
    for (const item of newItems) {
      if (orig.indexOf(item) !== -1) {
        orig.push(item);
      }
    }
  }

  private static getSelectedInputSystemsManagerTags(config: LexiconConfig): string[] {
    const roleType = new RoleType();
    const roleView: LexRoleViewConfig = config.roleViews[roleType.manager];
    const tags: string[] = [];
    if (roleView != null && roleView.fields != null) {
      for (const fieldName in roleView.fields) {
        if (roleView.fields.hasOwnProperty(fieldName) &&
          ConfigurationFieldUnifiedViewModel.isMultitextFieldType(roleView.fields[fieldName].type)) {
          const multiTextField = roleView.fields[fieldName] as LexViewMultiTextFieldConfig;
          if (multiTextField.overrideInputSystems) {
            ConfigurationFieldUnifiedViewModel.addWithoutDuplicates(tags, multiTextField.inputSystems);
          }
        }
      }
    }

    return tags;
  }

  private static setInputSystemRoleSettings(tag: string, config: LexiconConfig, role: string, roleType: string,
                                            inputSystemSettings: InputSystemSettings): void {
    const roleView: LexRoleViewConfig = config.roleViews[roleType];
    if (roleView != null) {
      if (roleView.inputSystems && roleView.inputSystems.length) {
        inputSystemSettings[role] = roleView.inputSystems.includes(tag);
      } else {
        inputSystemSettings[role] = true;
      }
    }
  }

  private static setInputSystemGroupSettings(tag: string, config: LexiconConfig, userId: string, groupIndex: number,
                                             inputSystemSettings: InputSystemSettings): void {
    const userView: LexUserViewConfig = config.userViews[userId];
    if (userView != null) {
      if (userView.inputSystems && userView.inputSystems.length) {
        inputSystemSettings.groups[groupIndex].show = userView.inputSystems.includes(tag);
      } else {
        inputSystemSettings.groups[groupIndex].show = true;
      }
    }
  }

  private static setLevelViewModel(levelConfig: LexConfigFieldList, config: LexiconConfig): FieldSettings[] {
    const fields: FieldSettings[] = [];
    let fieldIndex = 0;
    for (const fieldName of levelConfig.fieldOrder) {
      if (fieldName in levelConfig.fields && levelConfig.fields[fieldName].type !== 'fields') {
        const fieldSettings = new FieldSettings();
        fieldSettings.fieldName = fieldName;
        fieldSettings.label = levelConfig.fields[fieldName].label;
        fieldSettings.hiddenIfEmpty = levelConfig.fields[fieldName].hideIfEmpty;
        if (levelConfig.fields[fieldName].type === 'pictures') {
          fieldSettings.captionHiddenIfEmpty = (levelConfig.fields[fieldName] as LexConfigPictures).captionHideIfEmpty;
        }
        ConfigurationFieldUnifiedViewModel.setLevelRoleSettings(fieldName, config, fieldSettings);
        ConfigurationFieldUnifiedViewModel.setLevelGroupSettings(fieldName, config, fieldSettings);

        if (ConfigurationFieldUnifiedViewModel.isMultitextFieldType(levelConfig.fields[fieldName].type)) {
          const multiTextLevelConfigField = levelConfig.fields[fieldName] as LexConfigMultiText;
          for (const tag of multiTextLevelConfigField.inputSystems) {
            const inputSystemSettings = new InputSystemSettings();
            inputSystemSettings.tag = tag;
            inputSystemSettings.fieldName = fieldName;
            inputSystemSettings.isAllRowSelected = true;
            fieldSettings.inputSystems.push(inputSystemSettings);
          }
          for (const tag in config.inputSystems) {
            if (config.inputSystems.hasOwnProperty(tag) && !multiTextLevelConfigField.inputSystems.includes(tag)) {
              const inputSystemSettings = new InputSystemSettings();
              inputSystemSettings.tag = tag;
              inputSystemSettings.fieldName = fieldName;
              inputSystemSettings.isAllRowSelected = false;
              fieldSettings.inputSystems.push(inputSystemSettings);
            }
          }
        }

        ConfigurationFieldUnifiedViewModel.checkIfAllRowSelected(fieldSettings);
        fields[fieldIndex++] = fieldSettings;
      }
    }

    return fields;
  }

  private static setLevelRoleSettings(fieldName: string, config: LexiconConfig, fieldSettings: FieldSettings): void {
    const roles = RoleType.roles();
    const roleType = new RoleType();
    for (const role of roles) {
      const roleView: LexRoleViewConfig = config.roleViews[roleType[role]];
      if (roleView != null && roleView.fields != null) {
        fieldSettings[role] = roleView.fields[fieldName].show;
      }
    }
  }

  private static setLevelGroupSettings(fieldName: string, config: LexiconConfig, fieldSettings: FieldSettings): void {
    let groupIndex = 0;
    for (const userId in config.userViews) {
      if (config.userViews.hasOwnProperty(userId) && config.userViews[userId] != null &&
        config.userViews[userId].fields != null
      ) {
        fieldSettings.groups[groupIndex] = new Group();
        fieldSettings.groups[groupIndex++].show = config.userViews[userId].fields[fieldName].show;
      }
    }
  }

  private static setGroupLists(config: LexiconConfig, users: { [userId: string]: User }): GroupList[] {
    const groupLists: GroupList[] = [];
    let groupIndex = 0;
    for (const userId in config.userViews) {
      if (config.userViews.hasOwnProperty(userId) && config.userViews[userId] != null && (userId in users)) {
        groupLists[groupIndex++] = {label: users[userId].username, userId} as GroupList;
      }
    }

    return groupLists;
  }

}

export class Group {
  show: boolean = true;
}

export abstract class SettingsBase {
  isAllRowSelected: boolean = false;
  observer: boolean = false;
  commenter: boolean = false;
  contributor: boolean = false;
  manager: boolean = false;
  groups: Group[] = [];
  fieldName: string;
}

export class InputSystemSettings extends SettingsBase {
  tag: string;
}

export class FieldSettings extends SettingsBase {
  label: string;
  hiddenIfEmpty: boolean;
  captionHiddenIfEmpty?: boolean;
  isCustomInputSystemsCollapsed: boolean = true;
  inputSystems: InputSystemSettings[] = [];
}

export class InputSystemSettingsList {
  settings: InputSystemSettings[] = [];
  selectAllColumns: InputSystemSettings = new InputSystemSettings();
  labels: { [tag: string]: string } = {};
}

export class FieldSettingsList {
  settings: FieldSettings[] = [];
  selectAllColumns: FieldSettings = new FieldSettings();
}

export class RoleType {
  observer: string = 'observer';
  commenter: string = 'observer_with_comment';
  contributor: string = 'contributor';
  manager: string = 'project_manager';

  static roles(): string[] {
    return ['observer', 'commenter', 'contributor', 'manager'];
  }
}

export interface GroupList {
  label: string;
  userId: string;
}

/* disable all fields that should not be available for changes by the user */
export class RequiredFields {
  static requiredFieldList: string[] = ['lexeme'];
}
