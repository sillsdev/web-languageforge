import * as angular from 'angular';

import {SessionService} from '../../../bellows/core/session.service';
import {ProjectRoles} from '../../../bellows/shared/model/project.model';
import {LexMultiText} from '../shared/model/lex-multi-text.model';
import {LexValue} from '../shared/model/lex-value.model';
import {
  LexConfigField,
  LexConfigFieldList,
  LexConfigMultiText,
  LexiconConfig
} from '../shared/model/lexicon-config.model';
import {LexiconProjectSettings} from '../shared/model/lexicon-project-settings.model';
import {LexOptionList} from '../shared/model/option-list.model';

export class LexiconConfigService {
  static $inject: string[] = ['sessionService'];
  constructor(private sessionService: SessionService) { }

  getEditorConfig(updatedConfig?: LexiconConfig, updatedOptionLists?: LexOptionList[]
  ): angular.IPromise<LexiconConfig> {
    return this.sessionService.getSession().then((session => {
      if (updatedConfig != null) {
        session.projectSettings<LexiconProjectSettings>().config = updatedConfig;
      }

      if (updatedOptionLists != null) {
        session.projectSettings<LexiconProjectSettings>().optionlists = updatedOptionLists;
      }

      const config = angular.copy(session.projectSettings<LexiconProjectSettings>().config);
      const userId = session.userId();
      const role = session.projectSettings<LexiconProjectSettings>().currentUserRole;
      let fieldsConfig;

      // copy option lists to config object
      config.optionlists = {};
      for (const optionList of session.projectSettings<LexiconProjectSettings>().optionlists) {
        config.optionlists[optionList.code] = optionList;
      }

      // use a user-based field config if defined
      if (config.userViews[userId] != null) {
        fieldsConfig = config.userViews[userId];
      } else {
        // fallback to role-based field config
        fieldsConfig = config.roleViews[role];
        // further fallback for projects that don't have anything configured for the Tech Support role
        if (fieldsConfig == null && role === ProjectRoles.TECH_SUPPORT.key) {
          fieldsConfig = config.roleViews[ProjectRoles.MANAGER.key];
        }
      }

      if (fieldsConfig != null) {
        this.removeDisabledConfigFields(config.entry, fieldsConfig);
        this.removeDisabledConfigFields((config.entry.fields.senses as LexConfigFieldList), fieldsConfig);
        this.removeDisabledConfigFields(((config.entry.fields.senses as LexConfigFieldList).fields.examples as
          LexConfigFieldList), fieldsConfig);
      }
      return config;
    }));
  }

  isTaskEnabled(taskName: string): angular.IPromise<boolean> {
    return this.sessionService.getSession().then(session => {
      const config = session.projectSettings<LexiconProjectSettings>().config;
      const role = session.projectSettings<LexiconProjectSettings>().currentUserRole;
      const userId = session.userId();

      if (config.userViews[userId] != null) {
        return config.userViews[userId].showTasks[taskName];
      } else {
        // fallback to role-based field config
        return config.roleViews[role].showTasks[taskName];
      }
    });
  }

  static fieldContainsData(type: string, model: any): boolean {
    let containsData = false;
    if (model == null) {
      return false;
    }

    if (type === 'fields') {
      return true;
    }

    switch (type) {
      case 'multitext':
        for (const inputSystemTag in model as LexMultiText) {
          if (model.hasOwnProperty(inputSystemTag)) {
            const field: LexValue = model[inputSystemTag];
            if (field.value && field.value !== '') {
              containsData = true;
            }
          }
        }

        break;
      case 'optionlist':
        if (model.value && model.value !== '') {
          containsData = true;
        }

        break;
      case 'multioptionlist':
        if (model.values.length > 0) {
          containsData = true;
        }

        break;
      case 'pictures':
        if (model.length > 0) {
          containsData = true;
        }

        break;
    }
    return containsData;
  }

  getFieldConfig(fieldName: string): angular.IPromise<LexConfigField> {
    return this.sessionService.getSession().then(session => {
      const config = session.projectSettings<LexiconProjectSettings>().config;
      let search = config.entry.fields;

      if (search[fieldName] != null) {
        return search[fieldName];
      }

      search = (config.entry.fields.senses as LexConfigFieldList).fields;
      if (search[fieldName] != null) {
        return search[fieldName];
      }

      search = ((config.entry.fields.senses as LexConfigFieldList).fields.examples as LexConfigFieldList).fields;
      if (search[fieldName] != null) {
        return search[fieldName];
      }

      // Check if this is the main entry and setup some basic configuration
      if (fieldName === 'entry') {
        const entryConfig = new LexConfigMultiText();
        entryConfig.type = 'multitext';
        entryConfig.label = 'Entry';
        return entryConfig;
      }

      return undefined;
    });
  }

  static isCustomField(fieldName: string): boolean {
    return fieldName.search('customField_') === 0;
  }

  private removeDisabledConfigFields(config: LexConfigFieldList, fieldsConfig: any): void {
    // noinspection UnnecessaryLocalVariableJS
    const visibleFields = config.fieldOrder.filter((fieldName: string) => {
      if (fieldName === 'senses' || fieldName === 'examples') {
        return true;  // Never remove the senses or examples config!
      }

      const fieldConfig = fieldsConfig.fields[fieldName];
      if (fieldConfig && fieldConfig.show) {
        // Also override input systems if specified
        if (fieldConfig.overrideInputSystems) {
          (config.fields[fieldName] as LexConfigMultiText).inputSystems = angular.copy(fieldConfig.inputSystems);
        }

        return true;
      } else {
        // Also remove field config
        delete config.fields[fieldName];
        return false;
      }
    });

    // Now set fieldOrder array *after* we're done iterating over it
    config.fieldOrder = visibleFields;
  }
}
