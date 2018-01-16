import {User} from '../../../../bellows/shared/model/user.model';
import {
  LexConfigFieldList, LexiconConfig, LexRoleViewConfig, LexUserViewConfig,
  LexViewMultiTextFieldConfig
} from '../../shared/model/lexicon-config.model';
import {ConfigurationInputSystemsViewModel} from './input-system-view.model';
import {OptionSelects} from './option-selects.model';

export class ConfigurationUnifiedViewModel {
  // Group labels
  groupLists: GroupList[];

  // Settings objects for Input System
  inputSystems: InputSystemSettings[];

  // Settings objects for Entry Fields
  entryFields: FieldSettings[];

  // Settings objects for Sense Fields
  senseFields: FieldSettings[];

  // Settings objects for Example Fields
  exampleFields: FieldSettings[];

  selectAllColumns: SelectAllColumns;

  constructor(config: LexiconConfig, users: { [userId: string]: User }) {
    this.inputSystems = ConfigurationUnifiedViewModel.setInputSystemViewModel(config);

    const entryConfig = config.entry;
    this.entryFields = ConfigurationUnifiedViewModel.setLevelViewModel(entryConfig, config);
    if ('senses' in entryConfig.fields) {
      const sensesConfig = entryConfig.fields.senses as LexConfigFieldList;
      this.senseFields = ConfigurationUnifiedViewModel.setLevelViewModel(sensesConfig, config);
      if ('examples' in sensesConfig.fields) {
        const examplesConfig = sensesConfig.fields.examples as LexConfigFieldList;
        this.exampleFields = ConfigurationUnifiedViewModel.setLevelViewModel(examplesConfig, config);
      }
    }

    this.groupLists = ConfigurationUnifiedViewModel.setGroupLists(config, users);

    console.log('inputSystems', this.inputSystems);
    console.log('entryFields', this.entryFields, 'senseFields', this.senseFields, 'exampleFields', this.exampleFields);

    this.selectAllColumns = new SelectAllColumns();
    const roles = RoleType.roles();
    for (const role of roles) {
      this.selectAllColumns.inputSystems[role] = false;
      this.selectAllColumns.entryFields[role] = false;
      this.selectAllColumns.senseFields[role] = false;
      this.selectAllColumns.exampleFields[role] = false;
      ConfigurationUnifiedViewModel.checkIfAllRoleColumnSelected(this.inputSystems,
        this.selectAllColumns.inputSystems, role);
      ConfigurationUnifiedViewModel.checkIfAllRoleColumnSelected(this.entryFields,
        this.selectAllColumns.entryFields, role);
      ConfigurationUnifiedViewModel.checkIfAllRoleColumnSelected(this.senseFields,
        this.selectAllColumns.senseFields, role);
      ConfigurationUnifiedViewModel.checkIfAllRoleColumnSelected(this.exampleFields,
        this.selectAllColumns.exampleFields, role);
    }
    for (let i = 0; i < this.inputSystems[0].groups.length; i++) {
      this.selectAllColumns.inputSystems.groups.push(new Group());
      this.selectAllColumns.entryFields.groups.push(new Group());
      this.selectAllColumns.senseFields.groups.push(new Group());
      this.selectAllColumns.exampleFields.groups.push(new Group());
      ConfigurationUnifiedViewModel.checkIfAllGroupColumnSelected(this.inputSystems,
        this.selectAllColumns.inputSystems, i);
      ConfigurationUnifiedViewModel.checkIfAllGroupColumnSelected(this.entryFields,
        this.selectAllColumns.entryFields, i);
      ConfigurationUnifiedViewModel.checkIfAllGroupColumnSelected(this.senseFields,
        this.selectAllColumns.senseFields, i);
      ConfigurationUnifiedViewModel.checkIfAllGroupColumnSelected(this.exampleFields,
        this.selectAllColumns.exampleFields, i);
    }
  }

  updateConfig(config: LexiconConfig) {
    // Config updates for Input Systems
    ConfigurationUnifiedViewModel.inputSystemsToConfig(this.inputSystems, config, this.groupLists);

    // Config updates for fields
    const entryConfig = config.entry;
    ConfigurationUnifiedViewModel.fieldsToConfig(this.entryFields, config, entryConfig, this.groupLists);
    if ('senses' in entryConfig.fields) {
      const sensesConfig = entryConfig.fields.senses as LexConfigFieldList;
      ConfigurationUnifiedViewModel.fieldsToConfig(this.senseFields, config, sensesConfig, this.groupLists);
      if ('examples' in sensesConfig.fields) {
        const examplesConfig = sensesConfig.fields.examples as LexConfigFieldList;
        ConfigurationUnifiedViewModel.fieldsToConfig(this.exampleFields, config, examplesConfig, this.groupLists);
      }
    }
  }

  private static inputSystemsToConfig(inputSystems: InputSystemSettings[], config: LexiconConfig, groups: GroupList[]) {

    // iterate over every role type
    const roleType = new RoleType();
    for (const role of RoleType.roles()) {
      const roleView: LexRoleViewConfig = config.roleViews[roleType[role]];

      if (roleView != null && roleView.fields != null) {
        const tags: string[] = []; // array of Input System tags for this role
        let tagsIndex = 0;

        // add any Input Systems to the array for this role
        for (const inputSystem of inputSystems) {
          if (inputSystem[role]) {
            tags[tagsIndex++] = inputSystem.tag;
          }
        }

        for (const fieldName in roleView.fields) {
          if (roleView.fields.hasOwnProperty(fieldName) && roleView.fields[fieldName].type === 'multitext') {
            const multiTextField = roleView.fields[fieldName] as LexViewMultiTextFieldConfig;

            // overrideInputSystems if there are tag in the array, if no tags override = false
            multiTextField.overrideInputSystems = (tagsIndex !== 0);
            multiTextField.inputSystems = tags;
          }
        }
      }
    }

    // iterate over groups
    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      const userView: LexUserViewConfig = config.userViews[group.userId];

      if (userView != null && userView.fields != null) {
        const tags: string[] = []; // array of Input System tags for this group
        let tagsIndex = 0;

        // add any Input Systems to the array for this group
        for (const inputSystem of inputSystems) {
          if (inputSystem.groups[i].show) {
            tags[tagsIndex++] = inputSystem.tag;
          }
        }

        for (const fieldName in userView.fields) {
          if (userView.fields.hasOwnProperty(fieldName) && userView.fields[fieldName].type === 'multitext') {
            const multiTextField = userView.fields[fieldName] as LexViewMultiTextFieldConfig;

            // overrideInputSystems if there are tag in the array, if no tags override = false
            multiTextField.overrideInputSystems = (tagsIndex !== 0);
            multiTextField.inputSystems = tags;
          }
        }
      }
    }
  }

  static selectAllRow(setting: SettingsBase, settings: SettingsBase[], selectAll: SettingsBase): void {
    const roles = RoleType.roles();
    for (const role of roles) {
      setting[role] = setting.isAllRowSelected;
      ConfigurationUnifiedViewModel.checkIfAllRoleColumnSelected(settings, selectAll, role);
    }
    for (const group of setting.groups) {
      group.show = setting.isAllRowSelected;
      ConfigurationUnifiedViewModel.checkIfAllGroupColumnSelected(settings, selectAll, setting.groups.indexOf(group));
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
      ConfigurationUnifiedViewModel.checkIfAllRowSelected(setting);
    }
  }

  static selectAllGroupColumn(settings: SettingsBase[], selectAll: SettingsBase, groupIndex: number): void {
    for (const setting of settings) {
      setting.groups[groupIndex].show = selectAll.groups[groupIndex].show;
      ConfigurationUnifiedViewModel.checkIfAllRowSelected(setting);
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
    ConfigurationUnifiedViewModel.checkIfAllRowSelected(setting);
    ConfigurationUnifiedViewModel.checkIfAllRoleColumnSelected(settings, selectAll, role);
  }

  static checkIfAllGroupSelected(setting: SettingsBase, settings: SettingsBase[], selectAll: SettingsBase,
                                 groupIndex: number): void {
    ConfigurationUnifiedViewModel.checkIfAllRowSelected(setting);
    ConfigurationUnifiedViewModel.checkIfAllGroupColumnSelected(settings, selectAll, groupIndex);
  }

  private static fieldsToConfig(fields: FieldSettings[], config: LexiconConfig, configFields: LexConfigFieldList,
                                groupLists: GroupList[]) {

    for (const field of fields) {
      const configField = configFields.fields[field.fieldName];

      // from setLevelViewModel
      configField.label = field.name;
      configField.hideIfEmpty = field.hiddenIfEmpty;

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
        const groupList = groupLists[i];
        config.userViews[groupList.userId].fields[field.fieldName].show = field.groups[i].show;
      }

    }
  }

  private static setInputSystemViewModel(config: LexiconConfig): InputSystemSettings[] {
    const inputSystems: InputSystemSettings[] = [];
    let i = 0;
    for (const tag in config.inputSystems) {
      if (config.inputSystems.hasOwnProperty(tag)) {
        const inputSystemSettings = new InputSystemSettings();
        const inputSystemViewModel =
          new ConfigurationInputSystemsViewModel(new OptionSelects(), config.inputSystems[tag]);
        inputSystemSettings.tag = tag;
        inputSystemSettings.name = inputSystemViewModel.languageDisplayName();
        ConfigurationUnifiedViewModel.setInputSystemRoleSettings(tag, config, inputSystemSettings);
        ConfigurationUnifiedViewModel.setInputSystemGroupSettings(tag, config, inputSystemSettings);
        inputSystems[i++] = inputSystemSettings;

        ConfigurationUnifiedViewModel.checkIfAllRowSelected(inputSystemSettings);
      }
    }

    return inputSystems;
  }

  private static setInputSystemRoleSettings(tag: string, config: LexiconConfig,
                                            inputSystemSettings: InputSystemSettings) {
    const roles = RoleType.roles();
    const roleType = new RoleType();

    for (const role of roles) {
      inputSystemSettings[role] = false;
      const roleView: LexRoleViewConfig = config.roleViews[roleType[role]];
      if (roleView != null && roleView.fields != null) {
        for (const fieldName in roleView.fields) {
          if (roleView.fields.hasOwnProperty(fieldName) && roleView.fields[fieldName].type === 'multitext') {
            const multiTextField = roleView.fields[fieldName] as LexViewMultiTextFieldConfig;
            if (multiTextField.overrideInputSystems) {
              inputSystemSettings[role] = multiTextField.inputSystems.includes(tag);
              break;
            }
          }
        }
      }
    }
  }

  private static setInputSystemGroupSettings(tag: string, config: LexiconConfig,
                                             inputSystemSettings: InputSystemSettings) {
    let groupIndex = 0;
    for (const userId in config.userViews) {
      if (config.userViews.hasOwnProperty(userId) && config.userViews[userId] != null &&
        config.userViews[userId].fields != null
      ) {
        for (const fieldName in config.userViews[userId].fields) {
          if (config.userViews[userId].fields.hasOwnProperty(fieldName) &&
            config.userViews[userId].fields[fieldName].type === 'multitext'
          ) {
            const multiTextField = config.userViews[userId].fields[fieldName] as LexViewMultiTextFieldConfig;
            if (multiTextField.overrideInputSystems) {
              inputSystemSettings.groups[groupIndex] = new Group();
              inputSystemSettings.groups[groupIndex++].show = multiTextField.inputSystems.includes(tag);
              break;
            }
          }
        }
      }
    }
  }

  private static setLevelViewModel(levelConfig: LexConfigFieldList, config: LexiconConfig): FieldSettings[] {
    const fields: FieldSettings[] = [];
    let fieldIndex = 0;
    for (const fieldName of levelConfig.fieldOrder) {
      if (levelConfig.fields[fieldName].type !== 'fields') {
        const fieldSettings = new FieldSettings();
        fieldSettings.fieldName = fieldName;
        fieldSettings.name = levelConfig.fields[fieldName].label;
        fieldSettings.hiddenIfEmpty = levelConfig.fields[fieldName].hideIfEmpty;
        ConfigurationUnifiedViewModel.setLevelRoleSettings(fieldName, config, fieldSettings);
        ConfigurationUnifiedViewModel.setLevelGroupSettings(fieldName, config, fieldSettings);
        fields[fieldIndex++] = fieldSettings;

        ConfigurationUnifiedViewModel.checkIfAllRowSelected(fieldSettings);
      }
    }

    return fields;
  }

  private static setLevelRoleSettings(fieldName: string, config: LexiconConfig, fieldSettings: FieldSettings) {
    const roles = RoleType.roles();
    const roleType = new RoleType();

    for (const role of roles) {
      const roleView: LexRoleViewConfig = config.roleViews[roleType[role]];
      if (roleView != null && roleView.fields != null) {
        fieldSettings[role] = roleView.fields[fieldName].show;
      }
    }
  }

  private static setLevelGroupSettings(fieldName: string, config: LexiconConfig, fieldSettings: FieldSettings) {
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
        groupLists[groupIndex++] = new GroupList(users[userId].username, userId);
      }
    }

    return groupLists;
  }

}

class SelectAllColumns {
  inputSystems: InputSystemSettings = new InputSystemSettings();
  entryFields: FieldSettings = new FieldSettings();
  senseFields: FieldSettings = new FieldSettings();
  exampleFields: FieldSettings = new FieldSettings();
}

export class Group {
  show: boolean;
}

export class SettingsBase {
  name: string;
  observer: boolean;
  commenter: boolean;
  contributor: boolean;
  manager: boolean;
  groups: Group[] = [];
  isAllRowSelected: boolean;
}

export class InputSystemSettings extends SettingsBase {
  tag: string;
}

export class FieldSettings extends SettingsBase {
  fieldName: string;
  hiddenIfEmpty: boolean;
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

export class GroupList {
  label: string;
  userId: string;

  constructor(label: string, userId: string) {
    this.label = label;
    this.userId = userId;
  }
}
