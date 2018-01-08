import {LexConfigFieldList, LexiconConfig, LexRoleViewConfig} from '../../shared/model/lexicon-config.model';

export class ConfigurationUnifiedViewModel {

  // Settings objects for Entry Fields
  entryFields: FieldSettings[];

  // Settings objects for Sense Fields
  senseFields: FieldSettings[];

  // Settings objects for Example Fields
  exampleFields: FieldSettings[];

  // Settings objects for Input System
  inputSystem: InputSystemSettings[];

  constructor(config: LexiconConfig, numInputSystem: number) {
    this.inputSystem = [];
    this.entryFields = [];
    this.senseFields = [];
    this.exampleFields = [];

    const entryConfig = config.entry;
    ConfigurationUnifiedViewModel.setLevelViewModel(entryConfig, config, this.entryFields);
    if ('senses' in entryConfig.fields) {
      const sensesConfig = entryConfig.fields.senses as LexConfigFieldList;
      ConfigurationUnifiedViewModel.setLevelViewModel(sensesConfig, config, this.senseFields);
      if ('examples' in sensesConfig.fields) {
        const examplesConfig = sensesConfig.fields.examples as LexConfigFieldList;
        ConfigurationUnifiedViewModel.setLevelViewModel(examplesConfig, config, this.exampleFields);
      }
    }

    for (let i = 0; i < numInputSystem; i++) {
      this.inputSystem[i] = new InputSystemSettings();
    }

    console.log(this.inputSystem, this.entryFields, this.senseFields, this.exampleFields);
  }

  private static setLevelViewModel(levelConfig: LexConfigFieldList, config: LexiconConfig, fields: FieldSettings[]) {
    let fieldIndex = 0;
    for (const fieldName of levelConfig.fieldOrder) {
      if (levelConfig.fields[fieldName].type !== 'fields') {
        const fieldSettings = new FieldSettings();
        fieldSettings.name = levelConfig.fields[fieldName].label;
        fieldSettings.hiddenIfEmpty = levelConfig.fields[fieldName].hideIfEmpty;
        ConfigurationUnifiedViewModel.setRoleSettings(fieldName, config, fieldSettings);
        ConfigurationUnifiedViewModel.setGroupSettings(fieldName, config, fieldSettings);
        fields[fieldIndex++] = fieldSettings;
      }
    }
  }

  private static setRoleSettings(fieldName: string, config: LexiconConfig, fieldSettings: FieldSettings) {
    const roles = RoleType.roles();
    const roleType = new RoleType();

    for (const role of roles) {
      const roleView: LexRoleViewConfig = config.roleViews[roleType[role]];
      if (roleView != null && roleView.fields != null) {
        fieldSettings[role] = roleView.fields[fieldName].show;
      }
    }
  }

  private static setGroupSettings(fieldName: string, config: LexiconConfig, fieldSettings: FieldSettings) {
    let groupIndex = 0;
    for (const userId in config.userViews) {
      if (config.userViews.hasOwnProperty(userId) && config.userViews[userId] != null &&
        config.userViews[userId].fields != null
      ) {
        fieldSettings.groups[groupIndex++] = config.userViews[userId].fields[fieldName].show;
      }
    }
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
