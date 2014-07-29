'use strict';

angular.module('lexicon.services', ['jsonRpc', 'bellows.services', 'sgw.ui.breadcrumb'])
.service('lexLinkService', ['$location', 'sessionService', function($location, ss) {
	this.project = function () {
		return '/app/lexicon/' + this.getProjectId();
	};
	
	this.projectView = function (view) {
		return this.project() + '/' + view;
	};

	this.getProjectId = function() {
		return ss.session.project.id;
	};
}])
.service('lexProjectService', ['jsonRpc', 'sessionService', 'breadcrumbService', 'lexLinkService', '$location', 
                               function(jsonRpc, ss, breadcrumbService, linkService, $location) {
	jsonRpc.connect('/api/sf');

	this.setBreadcrumbs = function(view, label) {
		breadcrumbService.set('top', [
			{href: '/app/projects', label: 'My Projects'},
			{href: linkService.project(), label: ss.session.project.projectName},
			{href: linkService.projectView(view), label: label}
		]);
	};

	this.baseViewDto = function(view, label, callback) {
		var setBreadcrumbs = this.setBreadcrumbs;
		jsonRpc.call('lex_baseViewDto', [], function(result) {
			if (result.ok) {
				setBreadcrumbs(view, label);
				callback(result);
			}
		});
	};

	this.updateConfiguration = function(config, callback) {
		jsonRpc.call('lex_configuration_update', [config], callback);
	};
	
	this.importLift = function(importData, callback) {
		jsonRpc.call('lex_import_lift', [importData], function(result) {
			if (result.ok) {
				callback(result);
			}
		});
	};
	
	this.readProject = function(callback) {
		var setBreadcrumbs = this.setBreadcrumbs;
		jsonRpc.call('lex_projectDto', [], function(result) {
			if (result.ok) {
				setBreadcrumbs('settings', 'Project Settings');
				callback(result);
			}
		});
	};
	
	this.updateProject = function(project, callback) {
		jsonRpc.call('lex_project_update', [project], callback);
	};
	
	this.users = function(callback) {
		var setBreadcrumbs = this.setBreadcrumbs;
		jsonRpc.call('project_usersDto', [], function(result) {
			if (result.ok) {
				setBreadcrumbs('users', 'User Management');
				callback(result);
			}
		});
	};
	
	this.updateUserProfile = function(user, callback) {
		jsonRpc.call('user_updateProfile', [user], callback);
	};
	
	this.getProjectId = function() {
		return ss.session.project.id;
//		var parts = $location.path().split('/');
//		// strip off the "/p/"
//		return parts[2];
	};
}])
.service('lexCommentService', ['jsonRpc',
function(jsonRpc) {
    jsonRpc.connect('/api/sf');

    this.update = function update(comment, callback) {
        jsonRpc.call('lex_comment_update', [comment], callback);
    };

    this.updateReply = function updateReply(commentId, reply, callback) {
        jsonRpc.call('lex_commentReply_update', [commentId, reply], callback);
    };

    this.delete = function deleteComment(commentId, callback) {
        jsonRpc.call('lex_comment_delete', [commentId], callback);
    };

    this.deleteReply = function deleteReply(commentId, replyId, callback) {
        jsonRpc.call('lex_comment_delete', [commentId, replyId], callback);
    };

    this.plusOne = function plusOne(commentId, callback) {
        jsonRpc.call('lex_comment_plusOne', [commentId], callback);
    };

    this.updateStatus = function updateStatus(commentId, status, callback) {
        jsonRpc.call('lex_comment_updateStatus', [commentId, status], callback);
    };
}])
.service('lexConfigService', ['sessionService',
function(ss) {

    this.isTaskEnabled = function(taskName) {
        var config = ss.session.projectSettings.config;
        var role = ss.session.projectSettings.currentUserRole;

        return config.roleViews[role].showTasks[taskName];
    };

    this.isFieldEnabled = function(fieldName, ws) {

        var config = ss.session.projectSettings.config;
        var userId = ss.session.userId;
        var role = ss.session.projectSettings.currentUserRole;
        var fieldConfig;

        // use an user-based field config if defined
        if (angular.isDefined(config.userViews[userId])) {
            fieldConfig = config.userViews[userId].fields[fieldName];
        } else {
            // fallback to role-based field config
            fieldConfig = config.roleViews[role].fields[fieldName];
        }

        if (!fieldConfig) {
            console.log(fieldName);
        }

        // field-level visibility
        var show = fieldConfig.show;

        // input system level visibility
        if (ws && fieldConfig.show && fieldConfig.overrideInputSystems) {
            if (fieldConfig.inputSystems.indexOf(ws) != -1) {
                show = true;
            } else {
                show = false;
            }
        }
        return show;
    };

    this.isUncommonField = function isUncommonField(fieldName) {
        var fieldConfig = getFieldConfig(fieldName);
        return fieldConfig.hideIfEmpty;
    };

    /**
     *
     * @param boolean showUncommon - flag specifying whether we should show uncommon fields if they are empty
     * @param string fieldName
     * @param string type - field type
     * @param model - field data model
     * @returns {boolean}
     */
    this.isFieldVisible = function isFieldVisible(showUncommon, fieldName, type, model) {
        if (type == 'fields') return true;

        // check if field is enabled in config
        var isVisible = this.isFieldEnabled(fieldName);

        if (!showUncommon && this.isUncommonField(fieldName)) {
            isVisible = false;
            switch (type) {
                case 'multitext':
                    angular.forEach(model, function(ws) {
                        if (model[ws].value != '') {
                            isVisible = true;
                        }
                    });
                    break;
                case 'optionlist':
                case 'multioptionlist':
                    if (model.value != '') {
                        isVisible = true;
                    }
                    break;
            }
        }

        return isVisible;

    };

    /**
     *
     * @param fieldName - unique field name
     */
    function getFieldConfig(fieldName) {
        var config = ss.session.projectSettings.config;

        var search = config.entry;
        if (angular.isDefined(search.fields[fieldName])) {
            return search.fields[fieldName];
        }

        search = config.entry.fields.senses.fields;
        if (angular.isDefined(search.fields[fieldName])) {
            return search.fields[fieldName];
        }

        search = config.entry.fields.senses.fields.examples.fields;
        if (angular.isDefined(search.fields[fieldName])) {
            return search.fields[fieldName];
        }
        return undefined;
    }
}])

.service('lexEntryService', ['jsonRpc', 'sessionService', 'lexProjectService', 'breadcrumbService', 'lexLinkService', 
function(jsonRpc, ss, projectService, breadcrumbService, linkService) {
    jsonRpc.connect('/api/sf');
    /* not currently used
    this.read = function(id, callback) {
        jsonRpc.call('lex_entry_read', [id], callback);
    };
    */

    this.update = function(entry, callback) {
        jsonRpc.call('lex_entry_update', [entry], callback);
    };

    this.remove = function(id, callback) {
        jsonRpc.call('lex_entry_remove', [id], callback);
    };

    this.dbeDto = function(browserId, fullRefresh, callback) {
        if (fullRefresh) {
            jsonRpc.call('lex_dbeDtoFull', [browserId], function(result) {
                if (result.ok) {
                    // todo move breadcrumbs back to controller - cjh 2014-07
                    breadcrumbService.set('top',
                        [
                            {href: '/app/projects', label: 'My Projects'},
                            {href: linkService.project(), label: ss.session.project.projectName},
                            {href: linkService.projectView('dbe'), label: 'Browse And Edit'}
                        ]
                    );
                    callback(result);
                }
            });
        } else {
            jsonRpc.call('lex_dbeDtoUpdatesOnly', [browserId], callback);
        }
    };

    this.updateComment = function(comment, callback) {
        jsonRpc.call('lex_entry_updateComment', [comment], callback);
    };

}])
    .service('lexUtils', [function() {


        var _getFirstField = function _getFirstField(config, node, fieldName) {
            var ws, field, result = '';
            if (node[fieldName] && config && config.fields) {
                for (var i=0; i<config.fields[fieldName].inputSystems.length; i++) {
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



        /**
         *
         * @param config - entry config obj
         * @param entry
         * @returns {string}
         */
        this.getLexeme = function getLexeme(config, entry) {
            return _getFirstField(config, entry, 'lexeme');
        };
        this.getDefinition = function getDefinition(config, sense) {
            return _getFirstField(config, sense, 'definition');
        };
        this.getGloss = function getGloss(config, sense) {
            return _getFirstField(config, sense, 'gloss');
        };
        this.getWord = function getWord(config, entry) {
            return this.getLexeme(config, entry);
        };
        this.getExampleSentence = function getExampleSentence(config, example) {
            return _getFirstField(config, example, 'sentence');
        };

        this.getMeaning = function getMeaning(config, sense) {
            var meaning = '';
            meaning = this.getDefinition(config, sense);
            if (!meaning) {
                meaning = this.getGloss(config, sense);
            }
            return meaning;
        };

        this.getPartOfSpeechAbbreviation = function getPartOfSpeechAbbreviation(posModel) {
            var match, myRegexp = /\((.*)\)/; // capture text inside parens
            if (posModel && angular.isDefined) {
                match = myRegexp.exec(posModel.value);
                if (match && match.length > 1) {
                    return match[1];
                } else {
                    return posModel.value.toLowerCase().substring(0,5);
                }
            }
            return '';
        };

    }])
;
