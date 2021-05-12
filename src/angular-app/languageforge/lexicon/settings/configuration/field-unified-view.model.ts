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
    const [settings, overrides] = ConfigurationFieldUnifiedViewModel.setInputSystemsViewModel(config);
    this.inputSystems.settings = settings;
    this.inputSystems.hasCustomInputSystemsOverride = overrides;
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
      this.inputSystems.hasCustomInputSystemsOverride.groups.push(new Group());
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
    ConfigurationFieldUnifiedViewModel.inputSystemsToConfig(this.inputSystems.settings,
      this.inputSystems.hasCustomInputSystemsOverride, config, this.groupLists);

    // Config updates for fields
    const entryConfig = config.entry;
    ConfigurationFieldUnifiedViewModel.fieldsToConfig(this.entryFields.settings, config, entryConfig, this.groupLists);
    if ('senses' in entryConfig.fields) {
      entryConfig.fieldOrder.push('senses');
      const sensesConfig = entryConfig.fields.senses as LexConfigFieldList;
      ConfigurationFieldUnifiedViewModel
        .fieldsToConfig(this.senseFields.settings, config, sensesConfig, this.groupLists);
      if ('examples' in sensesConfig.fields) {
        sensesConfig.fieldOrder.push('examples');
        const examplesConfig = sensesConfig.fields.examples as LexConfigFieldList;
        ConfigurationFieldUnifiedViewModel.fieldsToConfig(this.exampleFields.settings, config, examplesConfig,
          this.groupLists);
      }
    }
  }

  static ensureRequiredFields(fieldSettings: FieldSettings): boolean {
    return RequiredFields.requiredFieldList().includes(fieldSettings.fieldName);
  }

  static selectAllRow(fieldSettings: FieldSettings, settings: SettingsBase[], selectAll: SettingsBase): void {
    const roles = RoleType.roles();
    const disableFieldList = DisableFields.disableFieldList();
    for (const role of roles) {
      fieldSettings[role] = fieldSettings.isAllRowSelected;
      ConfigurationFieldUnifiedViewModel.checkIfAllRoleColumnSelected(settings, selectAll, role);
    }
    for (const group of fieldSettings.groups) {
      if (requiredFieldList.includes(fieldSettings.fieldName)) {
        group.show = true;
      } else {
        group.show = fieldSettings.isAllRowSelected;
      }
      ConfigurationFieldUnifiedViewModel
        .checkIfAllGroupColumnSelected(settings, selectAll, fieldSettings.groups.indexOf(group));
    }
  }

  static checkIfAllEntryFieldsRowSelected(fieldSettings: FieldSettings): void {
    const roles = RoleType.roles();
    const requiredFieldList = RequiredFields.requiredFieldList();
    fieldSettings.isAllRowSelected = true;
    for (const role of roles) {
      if (!fieldSettings[role]) {
        fieldSettings.isAllRowSelected = false;
        break;
      }
    }
    if (fieldSettings.isAllRowSelected) {
      for (const group of fieldSettings.groups) {
        if (!group.show) {
          if (requiredFieldList.includes(fieldSettings.fieldName)) {
            group.show = fieldSettings.isAllRowSelected;
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

  static selectAllGroupColumn(settings: FieldSettings[], selectAll: SettingsBase, groupIndex: number): void {
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

  static overrideRoleInputSystem(setting: SettingsBase, settings: SettingsBase[], overrides: InputSystemSettings,
                                 selectAll: SettingsBase, role: string): void {
    overrides[role] = true;
    ConfigurationFieldUnifiedViewModel.checkIfAllRoleSelected(setting, settings, selectAll, role);
  }

  static overrideGroupInputSystem(setting: SettingsBase, settings: SettingsBase[], overrides: InputSystemSettings,
                                  selectAll: SettingsBase, groupIndex: number): void {
    overrides.groups[groupIndex].show = true;
    ConfigurationFieldUnifiedViewModel.checkIfAllGroupSelected(setting, settings, selectAll, groupIndex);
  }

  static overrideRoleColumn(overrides: InputSystemSettings, role: string): void {
    overrides[role] = true;
  }

  static overrideGroupColumn(overrides: InputSystemSettings, groupIndex: number): void {
    overrides.groups[groupIndex].show = true;
  }

  static overrideAll(setting: SettingsBase, settings: SettingsBase[], overrides: InputSystemSettings,
                     selectAll: SettingsBase): void {
    const roles = RoleType.roles();
    for (const role of roles) {
      ConfigurationFieldUnifiedViewModel.overrideRoleInputSystem(
        setting, settings, overrides, selectAll, role);
    }
    for (const group of setting.groups) {
      ConfigurationFieldUnifiedViewModel.overrideGroupInputSystem(
        setting, settings, overrides, selectAll, setting.groups.indexOf(group));
    }
  }

  static resetInputSystemsForRole(settings: InputSystemSettings[], overrides: InputSystemSettings,
                                  selectAll: SettingsBase, config: LexiconConfig, role: string): void {
    for (const inputSystem of settings) {
      const tag = inputSystem.tag;
      ConfigurationFieldUnifiedViewModel.setInputSystemRoleSettingsFromFields(
        tag, config, role, inputSystem);
      ConfigurationFieldUnifiedViewModel.checkIfAllRoleSelected(
        inputSystem, settings, selectAll, role);
    }
    overrides[role] = false;
  }

  static resetInputSystemsForGroup(settings: InputSystemSettings[], overrides: InputSystemSettings,
                                   selectAll: SettingsBase, config: LexiconConfig, groupIndex: number): void {
    for (const inputSystem of settings) {
      const tag = inputSystem.tag;
      ConfigurationFieldUnifiedViewModel.setInputSystemGroupSettingsFromFields(
        tag, config, groupIndex, inputSystem);
      ConfigurationFieldUnifiedViewModel.checkIfAllGroupSelected(
        inputSystem, settings, selectAll, groupIndex);
    }
    overrides.groups[groupIndex].show = false;
  }

  private static isMultitextFieldType(fieldType: string) {
    // Picture fields are also multitext fields and have lists of input systems
    return (fieldType === 'multitext' || fieldType === 'pictures');
  }

  private static inputSystemsToConfig(inputSystems: InputSystemSettings[],
                                      overrides: InputSystemSettings,
                                      config: LexiconConfig, groupLists: GroupList[]): void {
    // iterate over every role type
    const roleType = new RoleType();
    for (const role of RoleType.roles()) {
      const roleView: LexRoleViewConfig = config.roleViews[roleType[role]];
      const overrideInputSystems: boolean = overrides[role];
      if (roleView != null && roleView.fields != null) {
        // add any Input Systems to the array for this role
        const tags: string[] = [];
        let tagsIndex = 0;
        for (const inputSystem of inputSystems) {
          if (inputSystem[role]) {
            tags[tagsIndex++] = inputSystem.tag;
          }
        }

        for (const fieldName in roleView.fields) {
          if (roleView.fields.hasOwnProperty(fieldName) &&
            ConfigurationFieldUnifiedViewModel.isMultitextFieldType(roleView.fields[fieldName].type)) {
            const multiTextFieldConfig = roleView.fields[fieldName] as LexViewMultiTextFieldConfig;
            if (overrideInputSystems) {
              multiTextFieldConfig.overrideInputSystems = true;
              multiTextFieldConfig.inputSystems = tags;
            } else {
              multiTextFieldConfig.overrideInputSystems = false;
              multiTextFieldConfig.inputSystems = [];
            }
          }
        }
      }
    }

    // iterate over groups
    for (let i = 0; i < groupLists.length; i++) {
      const userView: LexUserViewConfig = config.userViews[groupLists[i].userId];
      const overrideInputSystems: boolean = overrides.groups[i].show;
      if (userView != null && userView.fields != null) {
        // add any Input Systems to the array for this group
        const tags: string[] = [];
        let tagsIndex = 0;
        for (const inputSystem of inputSystems) {
          if (inputSystem.groups[i].show) {
            tags[tagsIndex++] = inputSystem.tag;
          }
        }

        for (const fieldName in userView.fields) {
          if (userView.fields.hasOwnProperty(fieldName) &&
            ConfigurationFieldUnifiedViewModel.isMultitextFieldType(userView.fields[fieldName].type)) {
            const multiTextFieldConfig = userView.fields[fieldName] as LexViewMultiTextFieldConfig;
            if (overrideInputSystems) {
              multiTextFieldConfig.overrideInputSystems = true;
              multiTextFieldConfig.inputSystems = tags;
            } else {
              multiTextFieldConfig.overrideInputSystems = false;
              multiTextFieldConfig.inputSystems = [];
            }
          }
        }
      }
    }

  }

  private static fieldsToConfig(fields: FieldSettings[], config: LexiconConfig, levelConfig: LexConfigFieldList,
                                groupLists: GroupList[]): void {
    levelConfig.fieldOrder = [];
    for (const field of fields) {
      // from setLevelViewModel
      const levelConfigField = levelConfig.fields[field.fieldName];
      levelConfigField.label = field.label;
      levelConfigField.hideIfEmpty = field.hiddenIfEmpty;
      if (levelConfigField.type === 'pictures') {
        (levelConfigField as LexConfigPictures).captionHideIfEmpty = field.captionHiddenIfEmpty;
      }
      if (ConfigurationFieldUnifiedViewModel.isMultitextFieldType(levelConfigField.type)) {
        const multiTextLevelConfigField = levelConfigField as LexConfigMultiText;
        multiTextLevelConfigField.inputSystems = [];
        for (const inputSystemSettings of field.inputSystems) {
          if (inputSystemSettings != null && inputSystemSettings.isAllRowSelected) {
            multiTextLevelConfigField.inputSystems.push(inputSystemSettings.tag);
          }
        }
      }

      // from setLevelRoleSettings
      const roleType = new RoleType();
      for (const role of RoleType.roles()) {
        const roleView: LexRoleViewConfig = config.roleViews[roleType[role]];
        if (roleView != null && roleView.fields != null) {
          roleView.fields[field.fieldName].show = field[role];
        }
      }

      // from setLevelGroupSettings
      for (let i = 0; i < groupLists.length; i++) {
        const userView = config.userViews[groupLists[i].userId];
        userView.fields[field.fieldName].show = field.groups[i].show;
      }

      levelConfig.fieldOrder.push(field.fieldName);
    }
  }

  private static setInputSystemsViewModel(config: LexiconConfig): [InputSystemSettings[], InputSystemSettings] {
    const inputSystems: InputSystemSettings[] = [];
    const overrides: InputSystemSettings = new InputSystemSettings();
    const selectedManagerTags = ConfigurationFieldUnifiedViewModel.getSelectedInputSystemsManagerTags(config);
    let i = 0;
    for (const tag of selectedManagerTags) {
      ConfigurationFieldUnifiedViewModel.setInputSystemViewModel(config, inputSystems, overrides, tag, i);
      i++;
    }
    for (const tag in config.inputSystems) {
      if (config.inputSystems.hasOwnProperty(tag) && !selectedManagerTags.includes(tag)) {
        ConfigurationFieldUnifiedViewModel.setInputSystemViewModel(config, inputSystems, overrides, tag, i);
        i++;
      }
    }

    return [inputSystems, overrides];
  }

  private static setInputSystemViewModel(config: LexiconConfig, inputSystems: InputSystemSettings[],
                                         overrides: InputSystemSettings, tag: string, index: number): void {
    const inputSystemSettings = new InputSystemSettings();
    inputSystemSettings.tag = tag;
    const roles = RoleType.roles();
    const roleType = new RoleType();
    for (const role of roles) {
      ConfigurationFieldUnifiedViewModel.setInputSystemRoleSettings(
        tag, config, role, roleType[role], inputSystemSettings, overrides);
    }
    let groupIndex = 0;
    for (const userId in config.userViews) {
      if (config.userViews.hasOwnProperty(userId) && config.userViews[userId] != null &&
        config.userViews[userId].fields != null
      ) {
        ConfigurationFieldUnifiedViewModel.setInputSystemGroupSettings(
          tag, config, userId, groupIndex, inputSystemSettings, overrides);
        groupIndex++;
      }
    }
    inputSystems[index] = inputSystemSettings;
    ConfigurationFieldUnifiedViewModel.checkIfAllRowSelected(inputSystemSettings);
  }

  private static getSelectedInputSystemsManagerTags(config: LexiconConfig): string[] {
    const roleType = new RoleType();
    const roleView: LexRoleViewConfig = config.roleViews[roleType.manager];
    let tags: string[] = [];
    if (roleView != null && roleView.fields != null) {
      for (const fieldName in roleView.fields) {
        if (roleView.fields.hasOwnProperty(fieldName) &&
          ConfigurationFieldUnifiedViewModel.isMultitextFieldType(roleView.fields[fieldName].type)) {
          const multiTextField = roleView.fields[fieldName] as LexViewMultiTextFieldConfig;
          if (multiTextField.overrideInputSystems) {
            tags = multiTextField.inputSystems;
            break;
          }
        }
      }
    }

    return tags;
  }

  private static setInputSystemRoleSettings(tag: string, config: LexiconConfig, role: string, roleType: string,
                                            inputSystemSettings: InputSystemSettings,
                                            overrides: InputSystemSettings): void {
    let hasOverride = false;
    const roleView: LexRoleViewConfig = config.roleViews[roleType];
    if (roleView != null && roleView.fields != null) {
      for (const fieldName in roleView.fields) {
        if (roleView.fields.hasOwnProperty(fieldName) &&
          ConfigurationFieldUnifiedViewModel.isMultitextFieldType(roleView.fields[fieldName].type)) {
          const multiTextField = roleView.fields[fieldName] as LexViewMultiTextFieldConfig;
          if (multiTextField.overrideInputSystems) {
            hasOverride = true;
            inputSystemSettings[role] = multiTextField.inputSystems.includes(tag);
            break;
          }
        }
      }
    }
    if (hasOverride) {
      overrides[role] = true;
    } else {
      ConfigurationFieldUnifiedViewModel.setInputSystemRoleSettingsFromFields(
        tag, config, role, inputSystemSettings);
      overrides[role] = false;
    }
  }

  static setInputSystemRoleSettingsFromFields(tag: string, config: LexiconConfig, role: string,
                                              inputSystemSettings: InputSystemSettings): void {
    inputSystemSettings[role] = ConfigurationFieldUnifiedViewModel.isInputSystemUsed(tag, config);
  }

  private static setInputSystemGroupSettings(tag: string, config: LexiconConfig, userId: string, groupIndex: number,
                                             inputSystemSettings: InputSystemSettings,
                                             overrides: InputSystemSettings): void {
    let hasOverride = false;
    for (const fieldName in config.userViews[userId].fields) {
      if (config.userViews[userId].fields.hasOwnProperty(fieldName) &&
        ConfigurationFieldUnifiedViewModel.isMultitextFieldType(config.userViews[userId].fields[fieldName].type)
      ) {
        const multiTextField = config.userViews[userId].fields[fieldName] as LexViewMultiTextFieldConfig;
        inputSystemSettings.groups[groupIndex] = new Group();
        if (multiTextField.overrideInputSystems) {
          hasOverride = true;
          inputSystemSettings.groups[groupIndex].show = multiTextField.inputSystems.includes(tag);
          break;
        }
      }
    }
    if (hasOverride) {
      overrides.groups[groupIndex] = new Group();
      overrides.groups[groupIndex].show = true;
    } else {
      ConfigurationFieldUnifiedViewModel.setInputSystemGroupSettingsFromFields(
        tag, config, groupIndex, inputSystemSettings);
      overrides.groups[groupIndex] = new Group();
      overrides.groups[groupIndex].show = false;
    }
  }

  static setInputSystemGroupSettingsFromFields(tag: string, config: LexiconConfig, groupIndex: number,
                                               inputSystemSettings: InputSystemSettings): void {
    inputSystemSettings.groups[groupIndex].show = ConfigurationFieldUnifiedViewModel.isInputSystemUsed(tag, config);
  }

  private static isInputSystemUsed(tag: string, config: LexiconConfig): boolean {
    if (!config) {
      return false;
    }
    const entryConfig = config.entry;
    if (!entryConfig || !entryConfig.fields) {
      return false;
    }
    for (const fieldName in entryConfig.fields) {
      if (ConfigurationFieldUnifiedViewModel.isInputSystemUsedInFieldList(tag, fieldName, entryConfig)) {
        return true;
      }
    }
    const sensesConfig = entryConfig.fields.senses as LexConfigFieldList;
    if (!sensesConfig || !sensesConfig.fields) {
      return false;
    }
    for (const fieldName in sensesConfig.fields) {
      if (ConfigurationFieldUnifiedViewModel.isInputSystemUsedInFieldList(tag, fieldName, sensesConfig)) {
        return true;
      }
    }
    const examplesConfig = sensesConfig.fields.examples as LexConfigFieldList;
    if (!examplesConfig || !examplesConfig.fields) {
      return false;
    }
    for (const fieldName in examplesConfig.fields) {
      if (ConfigurationFieldUnifiedViewModel.isInputSystemUsedInFieldList(tag, fieldName, examplesConfig)) {
        return true;
      }
    }
    return false;
  }

  private static isInputSystemUsedInFieldList(tag: string, fieldName: string, fieldList: LexConfigFieldList): boolean {
    if (fieldList.fields.hasOwnProperty(fieldName)) {
      if (ConfigurationFieldUnifiedViewModel.isMultitextFieldType(fieldList.fields[fieldName].type)) {
        const fieldConfig = fieldList.fields[fieldName] as LexConfigMultiText;
        if (fieldConfig.inputSystems.includes(tag)) {
          return true;
        }
      }
    }
    return false;
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

        const roleType = new RoleType();
        const managerRoleViewField = config.roleViews[roleType.manager].fields[fieldName];
        if (ConfigurationFieldUnifiedViewModel.isMultitextFieldType(levelConfig.fields[fieldName].type)) {
          const multiTextLevelConfigField = levelConfig.fields[fieldName] as LexConfigMultiText;
          // const multiTextFieldConfig = managerRoleViewField as LexViewMultiTextFieldConfig;
          // fieldSettings.hasCustomInputSystemsOverride = !multiTextFieldConfig.overrideInputSystems;
          for (const tag of multiTextLevelConfigField.inputSystems) {
            const inputSystemSettings = new InputSystemSettings();
            inputSystemSettings.tag = tag;
            inputSystemSettings.isAllRowSelected = true;
            fieldSettings.inputSystems.push(inputSystemSettings);
          }
          for (const tag in config.inputSystems) {
            if (config.inputSystems.hasOwnProperty(tag) && !multiTextLevelConfigField.inputSystems.includes(tag)) {
              const inputSystemSettings = new InputSystemSettings();
              inputSystemSettings.tag = tag;
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
}

export class InputSystemSettings extends SettingsBase {
  tag: string;
}

export class FieldSettings extends SettingsBase {
  fieldName: string;
  label: string;
  hiddenIfEmpty: boolean;
  captionHiddenIfEmpty?: boolean;
  isCustomInputSystemsCollapsed: boolean = true;
  inputSystems: InputSystemSettings[] = [];
}

export class InputSystemSettingsList {
  settings: InputSystemSettings[] = [];
  hasCustomInputSystemsOverride: InputSystemSettings = new InputSystemSettings();
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
  static requiredFieldList(): string[] {
    return ['lexeme'];
  }
}
