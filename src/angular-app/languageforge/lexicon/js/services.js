'use strict';

angular.module('lexicon.services', ['jsonRpc', 'bellows.services', 'sgw.ui.breadcrumb'])

// Lexicon Link Service
.service('lexLinkService', ['$location', 'sessionService', function($location, ss) {
  this.project = function project() {
    return '/app/lexicon/' + this.getProjectId();
  };

  this.projectView = function projectView(view) {
    return this.project() + '/' + view;
  };

  this.getProjectId = function getProjectId() {
    return ss.session.project.id;
  };
}])

// Lexicon Project Service
.service('lexProjectService', ['jsonRpc', 'sessionService', 'breadcrumbService', 'lexLinkService', '$location', 
function(jsonRpc, ss, breadcrumbService, linkService, $location) {
  jsonRpc.connect('/api/sf');

  this.setBreadcrumbs = function setBreadcrumbs(view, label) {
    breadcrumbService.set('top', [{
      href: '/app/projects',
      label: 'My Projects'
    }, {
      href: linkService.project(),
      label: ss.session.project.projectName
    }, {
      href: linkService.projectView(view),
      label: label
    }]);
  };

  this.baseViewDto = function baseViewDto(view, label, callback) {
    var setBreadcrumbs = this.setBreadcrumbs;
    jsonRpc.call('lex_baseViewDto', [], function(result) {
      if (result.ok) {
        setBreadcrumbs(view, label);
      }
      callback(result);
    });
  };

  this.updateConfiguration = function updateConfiguration(config, optionlist, callback) {
    jsonRpc.call('lex_configuration_update', [config, optionlist], callback);
  };

  this.updateOptionList = function updateOptionList(optionList, callback) {
    jsonRpc.call('lex_optionlist_update', [optionList], callback);
  };

  this.readProject = function readProject(callback) {
    jsonRpc.call('lex_projectDto', [], callback);
  };

  this.updateProject = function updateProject(project, callback) {
    jsonRpc.call('lex_project_update', [project], callback);
  };
  this.updateSettings = function updateSettings(smsSettings, emailSettings, callback) {
    jsonRpc.call('project_updateSettings', [smsSettings, emailSettings], callback);
  };
  this.readSettings = function readSettings(callback) {
    jsonRpc.call('project_readSettings', [], callback);
  };
  this.users = function users(callback) {
    jsonRpc.call('project_usersDto', [], callback);
  };

  this.updateUserProfile = function updateUserProfile(user, callback) {
    jsonRpc.call('user_updateProfile', [user], callback);
  };

  this.removeMediaFile = function removeMediaFile(mediaType, fileName, callback) {
    jsonRpc.call('lex_project_removeMediaFile', [mediaType, fileName], callback);
  };

  this.getProjectId = function getProjectId() {
    return ss.session.project.id;
    // var parts = $location.path().split('/');
    // // strip off the "/p/"
    // return parts[2];
  };
}])

// Lexicon Comment Service
.service('lexCommentService', ['jsonRpc', function(jsonRpc) {
  jsonRpc.connect('/api/sf');

  this.update = function updateComment(comment, callback) {
    jsonRpc.call('lex_comment_update', [comment], callback);
  };

  this.updateReply = function updateReply(commentId, reply, callback) {
    jsonRpc.call('lex_commentReply_update', [commentId, reply], callback);
  };

  this.remove = function deleteComment(commentId, callback) {
    jsonRpc.call('lex_comment_delete', [commentId], callback);
  };

  this.deleteReply = function deleteReply(commentId, replyId, callback) {
    jsonRpc.call('lex_commentReply_delete', [commentId, replyId], callback);
  };

  this.plusOne = function plusOne(commentId, callback) {
    jsonRpc.call('lex_comment_plusOne', [commentId], callback);
  };

  this.updateStatus = function updateStatus(commentId, status, callback) {
    jsonRpc.call('lex_comment_updateStatus', [commentId, status], callback);
  };
}])

// Lexicon Configuration Service
.service('lexConfigService', ['sessionService', function(ss) {
  this.isTaskEnabled = function isTaskEnabled(taskName) {
    var config = ss.session.projectSettings.config,
      role = ss.session.projectSettings.currentUserRole,
      userId = ss.session.userId;
    if (angular.isDefined(config.userViews[userId])) {
      return config.userViews[userId].showTasks[taskName];
    } else {

      // fallback to role-based field config
      return config.roleViews[role].showTasks[taskName];
    }
  };

  this.getConfigForUser = function getConfigForUser() {
    var config = angular.copy(ss.session.projectSettings.config),
      userId = ss.session.userId,
      role = ss.session.projectSettings.currentUserRole,
      fieldsConfig;

    // copy option lists to config object
    config.optionlists = {};
    angular.forEach(ss.session.projectSettings.optionlists, function(optionlist) {
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
  };

  this.fieldContainsData = function fieldContainsData(type, model) {
    var containsData = false;

    if (angular.isUndefined(model))
      return false;
    if (type == 'fields')
      return true;
    switch (type) {
      case 'multitext':
        angular.forEach(model, function(field) {
          if (field.value != '') {
            containsData = true;
          }
        });
        break;
      case 'optionlist':
        if (model.value != '') {
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
    angular.forEach(config.fieldOrder, function(fieldName) {
      if (fieldName != 'senses' && fieldName != 'examples') {
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
    var config = ss.session.projectSettings.config,
      search = config.entry.fields;

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
  };

  /*
   * this.isFieldEnabled = function(fieldName, ws) {
   * 
   * var config = ss.session.projectSettings.config; var userId =
   * ss.session.userId; var role = ss.session.projectSettings.currentUserRole;
   * var fieldConfig; // use an user-based field config if defined if
   * (angular.isDefined(config.userViews[userId])) { fieldConfig =
   * config.userViews[userId].fields[fieldName]; } else { // fallback to
   * role-based field config fieldConfig =
   * config.roleViews[role].fields[fieldName]; }
   * 
   * if (!fieldConfig) { console.log(fieldName); } // field-level visibility var
   * show = fieldConfig.show; // input system level visibility if (ws &&
   * fieldConfig.show && fieldConfig.overrideInputSystems) { if
   * (fieldConfig.inputSystems.indexOf(ws) != -1) { show = true; } else { show =
   * false; } } return show; };
   * 
   * this.isUncommonField = function isUncommonField(fieldName) { var
   * fieldConfig = getFieldConfig(fieldName); return fieldConfig.hideIfEmpty; };
   * 
   * 
   * this.isFieldVisible = function isFieldVisible(showUncommon, fieldName,
   * type, model) { if (type == 'fields') return true; var isVisible = true;
   * 
   * if (!showUncommon && this.isUncommonField(fieldName)) { isVisible = false;
   * switch (type) { case 'multitext': angular.forEach(model, function(ws) { if
   * (model[ws].value != '') { isVisible = true; } }); break; case 'optionlist':
   * case 'multioptionlist': if (model.value != '') { isVisible = true; } break; } }
   * 
   * return isVisible; };
   * 
   */

}])

// Lexicon Entry Service
.service('lexEntryService', ['jsonRpc', 'sessionService', 'lexProjectService', 'breadcrumbService', 'lexLinkService', 
function(jsonRpc, ss, projectService, breadcrumbService, linkService) {
  jsonRpc.connect('/api/sf');

  /*
   * not currently used this.read = function readEntry(id, callback) {
   * jsonRpc.call('lex_entry_read', [id], callback); };
   */

  this.update = function updateEntry(entry, callback) {
    jsonRpc.call('lex_entry_update', [entry], callback);
  };

  this.remove = function(id, callback) {
    jsonRpc.call('lex_entry_remove', [id], callback);
  };

  this.dbeDto = function dbeDto(browserId, fullRefresh, callback) {
    if (fullRefresh) {
      jsonRpc.call('lex_dbeDtoFull', [browserId], function(result) {
        if (result.ok) {
          // todo move breadcrumbs back to controller - cjh 2014-07
          breadcrumbService.set('top', [{
            href: '/app/projects',
            label: 'My Projects'
          }, {
            href: linkService.project(),
            label: ss.session.project.projectName
          }, {
            href: linkService.projectView('dbe'),
            label: 'Browse And Edit'
          }]);
        }
        callback(result);
      });
    } else {
      jsonRpc.call('lex_dbeDtoUpdatesOnly', [browserId], callback);
    }
  };

  this.updateComment = function updateComment(comment, callback) {
    jsonRpc.call('lex_entry_updateComment', [comment], callback);
  };

}]).service('lexUtils', [function() {

  function getFirstField(config, node, fieldName) {
    var result = '', ws, field;
    if (node[fieldName] && config && config.fields && config.fields[fieldName] && config.fields[fieldName].inputSystems) {
      for (var i = 0; i < config.fields[fieldName].inputSystems.length; i++) {
        ws = config.fields[fieldName].inputSystems[i];
        field = node[fieldName][ws];
        if (angular.isDefined(field) && angular.isDefined(field.value) && field.value != '') {
          result = field.value;
          break;
        }
      }
    }
    return result;
  };

  function getFields(config, node, fieldName, delimiter) {
    var result = '';
    if (typeof(delimiter) === 'undefined') delimiter = ' '; 
    if (node[fieldName] && config && config.fields && config.fields[fieldName] && config.fields[fieldName].inputSystems) {
      angular.forEach(config.fields[fieldName].inputSystems, function (inputSystem) {
        var field = node[fieldName][inputSystem];
        if (angular.isDefined(field) && angular.isDefined(field.value) && field.value != '') {
          if (result) {
            result += delimiter + field.value;
          } else {
            result = field.value;
          }
        }
      });
    }
    return result;
  };


  /**
   * 
   * @param config - entry config obj
   * @param entry
   * @returns {string}
   */
  this.getLexeme = function getLexeme(config, entry) {
    return getFirstField(config, entry, 'lexeme');
  };
  this.getWords = function getWords(config, entry) {
    return getFields(config, entry, 'lexeme');
  };

  this.getCitationForms = function(config, entry) {
    var citation = '';
    var citationFormByInputSystem = {};
    if (angular.isDefined(config.fields.citationForm)) {
      angular.forEach(config.fields.citationForm.inputSystems, function(inputSystem) {
        if (angular.isDefined(entry.citationForm)) {
          var field = entry.citationForm[inputSystem];
          if (angular.isDefined(field) && angular.isDefined(field.value) && field.value != '') {
            citationFormByInputSystem[inputSystem] = field.value;
          }
        }
      });
    }
    angular.forEach(config.fields.lexeme.inputSystems, function(inputSystem) {
      var field = entry.lexeme[inputSystem];
      var valueToAppend = '';
      if (angular.isDefined(citationFormByInputSystem[inputSystem])) {
        valueToAppend = citationFormByInputSystem[inputSystem]
      } else if (angular.isDefined(field) && angular.isDefined(field.value)) {
        valueToAppend = field.value;
      }
      if (valueToAppend) {
        if (citation) {
          citation += ' ' + valueToAppend;
        } else {
          citation += valueToAppend;
        }
      }
    });
    return citation;
  };
  
  this.getDefinition = function getDefinition(config, sense) {
    return getFirstField(config, sense, 'definition');
  };
  this.getGloss = function getGloss(config, sense) {
    return getFirstField(config, sense, 'gloss');
  };
  this.getMeaning = function getMeaning(config, sense) {
    var meaning = '';
    meaning = this.getDefinition(config, sense);
    if (!meaning) {
      meaning = this.getGloss(config, sense);
    }
    return meaning;
  };
  this.getMeanings = function getMeanings(config, sense) {
    var meaning = '';
    meaning = getFields(config, sense, 'definition');
    if (!meaning) {
      meaning = getFields(config, sense, 'gloss');
    }
    return meaning;
  };

  this.getExampleSentence = function getExampleSentence(config, example) {
    return getFields(config, example, 'sentence');
  };

  this.getPartOfSpeechAbbreviation = function getPartOfSpeechAbbreviation(posModel, optionlists) {
    if (angular.isDefined(posModel)) {
      if (angular.isDefined(optionlists)) {
        var abbreviation = '';
        angular.forEach(optionlists, function(optionlist) {
          if (optionlist.code == 'partOfSpeech' || optionlist.code == 'grammatical-info') {
            angular.forEach(optionlist.items, function(item) {
              if (item.value == posModel.value) {
                abbreviation = item.abbreviation;
              }
            });
          }
        });
        if (abbreviation)
          return abbreviation;
      }

      // capture text inside parentheses
      var myRegexp = /\((.*)\)/, 
        match = myRegexp.exec(posModel.value);
      if (match && match.length > 1) {
        return match[1];
      } else {
        return posModel.value.toLowerCase().substring(0, 5);
      }
    }
    return '';
  };

}]);
