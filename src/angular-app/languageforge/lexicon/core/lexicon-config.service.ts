import * as angular from 'angular';

import { SessionService } from '../../../bellows/core/session.service';
import { LexConfigFieldList, LexConfigMultiText, LexiconConfig } from '../shared/model/lexicon-config.model';
import { LexiconProjectSettings } from '../shared/model/lexicon-project-settings.model';

export class LexiconConfigService {
  static $inject: string[] = ['sessionService'];
  constructor(private sessionService: SessionService) { }

  refresh = (): any => {
    return this.sessionService.getSession().then((session => {
      const config = angular.copy(session.projectSettings<LexiconProjectSettings>().config);
      const userId = session.userId();
      const role = session.projectSettings<LexiconProjectSettings>().currentUserRole;
      let fieldsConfig;

      // copy option lists to config object
      config.optionlists = {};
      angular.forEach(session.projectSettings<LexiconProjectSettings>().optionlists, optionlist => {
        config.optionlists[optionlist.code] = optionlist;
      });

      // use an user-based field config if defined
      if (angular.isDefined(config.userViews[userId])) {
        fieldsConfig = config.userViews[userId];
      } else {

        // fallback to role-based field config
        fieldsConfig = config.roleViews[role];
      }

      this.removeDisabledConfigFields(config.entry, fieldsConfig);
      this.removeDisabledConfigFields((config.entry.fields.senses as LexConfigFieldList), fieldsConfig);
      this.removeDisabledConfigFields(((config.entry.fields.senses as LexConfigFieldList).fields.examples as
        LexConfigFieldList), fieldsConfig);

      return config;
    }));
  }

  isTaskEnabled(taskName: string): angular.IPromise<boolean> {
    return this.sessionService.getSession().then(session => {
      const config = session.projectSettings<LexiconProjectSettings>().config;
      const role = session.projectSettings<LexiconProjectSettings>().currentUserRole;
      const userId = session.userId();

      if (angular.isDefined(config.userViews[userId])) {
        return config.userViews[userId].showTasks[taskName];
      } else {
        // fallback to role-based field config
        return config.roleViews[role].showTasks[taskName];
      }
    });
  }

  fieldContainsData(type: string, model: any): boolean {
    let containsData = false;
    if (angular.isUndefined(model)) {
      return false;
    }

    if (type === 'fields') {
      return true;
    }

    switch (type) {
      case 'multitext':
        angular.forEach(model, field => {
          if (field.value && field.value !== '') {
            containsData = true;
          }
        });

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

  getFieldConfig(fieldName: string): angular.IPromise<any> {
    return this.sessionService.getSession().then(session => {
      const config = session.projectSettings<LexiconProjectSettings>().config;
      let search = config.entry.fields;

      if (angular.isDefined(search[fieldName])) {
        return search[fieldName];
      }

      search = (config.entry.fields.senses as LexConfigFieldList).fields;
      if (angular.isDefined(search[fieldName])) {
        return search[fieldName];
      }

      search = ((config.entry.fields.senses as LexConfigFieldList).fields.examples as LexConfigFieldList).fields;
      if (angular.isDefined(search[fieldName])) {
        return search[fieldName];
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
