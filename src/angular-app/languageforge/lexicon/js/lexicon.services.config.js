'use strict';

angular.module('lexicon.services')

// Lexicon Configuration Service
.service('lexConfigService', ['sessionService', function (sessionService) {

  this.refresh = function () {
    return sessionService.getSession().then(function (session) {
      var config = angular.copy(session.projectSettings().config);
      var userId = session.userId();
      var role = session.projectSettings().currentUserRole;
      var fieldsConfig;

      // copy option lists to config object
      config.optionlists = {};
      angular.forEach(session.projectSettings().optionlists, function (optionlist) {
        config.optionlists[optionlist.code] = optionlist;
      });

      // use an user-based field config if defined
      if (angular.isDefined(config.userViews[userId])) {
        fieldsConfig = config.userViews[userId];
      } else {

        // fallback to role-based field config
        fieldsConfig = config.roleViews[role];
      }

      removeDisabledConfigFields(config.entry, fieldsConfig);
      removeDisabledConfigFields(config.entry.fields.senses, fieldsConfig);
      removeDisabledConfigFields(config.entry.fields.senses.fields.examples, fieldsConfig);

      return config;
    }.bind(this));
  }.bind(this);

  this.isTaskEnabled = function isTaskEnabled(taskName) {
    sessionService.getSession().then(function (session) {
      var config = session.projectSettings().config;
      var role = session.projectSettings().currentUserRole;
      var userId = session.userId();

      if (angular.isDefined(config.userViews[userId])) {
        return config.userViews[userId].showTasks[taskName];
      } else {

        // fallback to role-based field config
        return config.roleViews[role].showTasks[taskName];
      }
    });
  };

  this.fieldContainsData = function fieldContainsData(type, model) {
    var containsData = false;

    if (angular.isUndefined(model))
      return false;
    if (type === 'fields')
      return true;
    switch (type) {
      case 'multitext':
        angular.forEach(model, function (field) {
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
  };

  function removeDisabledConfigFields(config, fieldsConfig) {
    angular.forEach(config.fieldOrder, function (fieldName) {
      if (fieldName !== 'senses' && fieldName !== 'examples') {
        var fieldConfig = fieldsConfig.fields[fieldName];

        if (fieldConfig && fieldConfig.show) {
          // field is enabled

          // override input systems if specified
          if (fieldConfig.overrideInputSystems) {
            config.fields[fieldName].inputSystems = angular.copy(fieldConfig.inputSystems);
          }
        } else {
          // remove config field
          delete config.fields[fieldName];

          // remove field from fieldOrder array
          config.fieldOrder.splice(config.fieldOrder.indexOf(fieldName), 1);
        }
      }
    });
  }

  this.isCustomField = function isCustomField(fieldName) {
    return fieldName.search('customField_') === 0;
  };

  this.getFieldConfig = function getFieldConfig(fieldName) {
    return sessionService.getSession().then(function (session) {
      var config = session.projectSettings().config;
      var search = config.entry.fields;

      if (angular.isDefined(search[fieldName])) {
        return search[fieldName];
      }

      search = config.entry.fields.senses.fields;
      if (angular.isDefined(search[fieldName])) {
        return search[fieldName];
      }

      search = config.entry.fields.senses.fields.examples.fields;
      if (angular.isDefined(search[fieldName])) {
        return search[fieldName];
      }

      return undefined;
    });
  };
}])

;
