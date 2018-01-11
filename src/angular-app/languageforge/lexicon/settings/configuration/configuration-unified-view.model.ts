import {User} from '../../../../bellows/shared/model/user.model';
import {
  LexConfigFieldList, LexiconConfig, LexRoleViewConfig,
  LexViewMultiTextFieldConfig
} from '../../shared/model/lexicon-config.model';
import {ConfigurationInputSystemsViewModel} from './input-system-view.model';
import {OptionSelects} from './option-selects.model';

export class ConfigurationUnifiedViewModel {
  // Group labels
  groupLabels: string[];

  // Settings objects for Input System
  inputSystems: InputSystemSettings[];

  // Settings objects for Entry Fields
  entryFields: FieldSettings[];

  // Settings objects for Sense Fields
  senseFields: FieldSettings[];

  // Settings objects for Example Fields
  exampleFields: FieldSettings[];

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

    this.groupLabels = ConfigurationUnifiedViewModel.setGroupLabels(config, users);

    console.log('inputSystems', this.inputSystems);
    console.log('entryFields', this.entryFields, 'senseFields', this.senseFields, 'exampleFields', this.exampleFields);
  }

  private static setInputSystemViewModel(config: LexiconConfig): InputSystemSettings[] {
    const inputSystems: InputSystemSettings[] = [];
    let i = 0;
    for (const tag in config.inputSystems) {
      if (config.inputSystems.hasOwnProperty(tag)) {
        const inputSystemSettings = new InputSystemSettings();
        const inputSystemViewModel =
          new ConfigurationInputSystemsViewModel(new OptionSelects(), config.inputSystems[tag]);
        inputSystemSettings.name = inputSystemViewModel.languageDisplayName();
        ConfigurationUnifiedViewModel.setInputSystemRoleSettings(tag, config, inputSystemSettings);
        ConfigurationUnifiedViewModel.setInputSystemGroupSettings(tag, config, inputSystemSettings);
        inputSystems[i++] = inputSystemSettings;
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
          if (roleView.fields.hasOwnProperty(fieldName)) {
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
          if (config.userViews[userId].fields.hasOwnProperty(fieldName)) {
            const multiTextField = config.userViews[userId].fields[fieldName] as LexViewMultiTextFieldConfig;
            if (multiTextField.overrideInputSystems) {
              inputSystemSettings.groups[groupIndex++] = multiTextField.inputSystems.includes(tag);
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
        fieldSettings.groups[groupIndex++] = config.userViews[userId].fields[fieldName].show;
      }
    }
  }

  private static setGroupLabels(config: LexiconConfig, users: { [userId: string]: User }): string[] {
    const groupLabels: string[] = [];
    let groupIndex = 0;
    for (const userId in config.userViews) {
      if (config.userViews.hasOwnProperty(userId) && config.userViews[userId] != null
        && (userId in users)
      ) {
        groupLabels[groupIndex++] = users[userId].username;
      }
    }

    return groupLabels;
  }

}

export class InputSystemSettings {
  name: string;
  observer: boolean;
  commenter: boolean;
  contributor: boolean;
  manager: boolean;
  groups: boolean[] = [];
}

export class FieldSettings extends InputSystemSettings {
  hiddenIfEmpty: boolean;
  fieldName: string;
}

class RoleType {
  observer: string = 'observer';
  commenter: string = 'observer_with_comment';
  contributor: string = 'contributor';
  manager: string = 'project_manager';

  static roles(): string[] {
    return ['observer', 'commenter', 'contributor', 'manager'];
  }
}
