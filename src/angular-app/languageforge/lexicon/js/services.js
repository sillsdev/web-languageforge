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

    this.updateOptionList = function(optionList, callback) {
        jsonRpc.call('lex_optionlist_update', [optionList], callback);
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


	
	
	
	
	
	/*
	
	this.addExampleDto = function(callback) {
		var dtoConfig = angular.copy(_config);
		// We just want to see the definition and part of speech, but leave rest of config alone
		angular.forEach(dtoConfig.entry.fields.senses.fields , function(field, fieldName) {
			field.visible = false;
		});
		dtoConfig.entry.fields.senses.fields['definition'].visible = true;
		dtoConfig.entry.fields.senses.fields['examples'].visible = true;
		// Definition should be read-only
		dtoConfig.entry.fields.senses.fields.definition.readonly = true;
		this.setConfig(dtoConfig);
		(callback || angular.noop)({'ok': true, 'data': {'entries': getEntriesList(), 'config': dtoConfig}});
	};
	this.addGrammarDto = function(callback) {
		var dtoConfig = angular.copy(_config);
		// We just want to see the definition and part of speech, but leave rest of config alone
		angular.forEach(dtoConfig.entry.fields.senses.fields , function(field, fieldName) {
			field.visible = false;
		});
		dtoConfig.entry.fields.senses.fields['definition'].visible = true;
		dtoConfig.entry.fields.senses.fields['partOfSpeech'].visible = true;
		// Definition should be read-only
		dtoConfig.entry.fields.senses.fields.definition.readonly = true;
		this.setConfig(dtoConfig);
		(callback || angular.noop)({'ok': true, 'data': {'entries': getEntriesList(), 'config': dtoConfig}});
	};
	this.addMeaningsDto = function(callback) {
		var dtoConfig = angular.copy(_config);
		// We just want to see the definition and part of speech, but leave rest of config alone
		angular.forEach(dtoConfig.entry.fields.senses.fields , function(field, fieldName) {
			field.visible = false;
		});
		dtoConfig.entry.fields.senses.fields['definition'].visible = true;
		this.setConfig(dtoConfig);
		(callback || angular.noop)({'ok': true, 'data': {'entries': getEntriesList(), 'config': dtoConfig}});
	};
	*/

	/*
	// --- BEGIN TEST CODE ---
	// Set up sample data when service first created
	// (This will be removed once a real server is available)
	for (var _idx = 0; _idx < sampleData.length; _idx++) {
		var entry = sampleData[_idx];
		this.update(entry);
	};
	this.saveNow();
	// --- END TEST CODE ---
	*/
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


	/*
	var _config = {
		'inputSystems': {
			'en': {
				'languageName': 'English',
				'abbreviation': 'en',
				'fieldUseCount': 11
			},
			'qaa': {
				'languageName': 'Unlisted Language',
				'abbreviation': 'qaa',
				'fieldUseCount': 0
			},
			'th': {
				'languageName': 'Thai',
				'abbreviation': 'th',
				'fieldUseCount': 11
			},
			'th-fonipa-x-etic': {
				'languageName': 'Thai',
				'abbreviation': 'thipa',
				'fieldUseCount': 11
			},
			'mi-Zxxx-x-audio': {
				'languageName': 'Maori',
				'abbreviation': 'mi',
				'fieldUseCount': 0
			},
			'mi-Latn-NZ-x-Ngati': {
				'languageName': 'Maori',
				'abbreviation': 'miNgati',
				'fieldUseCount': 0
			}
		},
		'entry': {
			'type': 'fields',
			'fieldOrder': ['lexeme', 'senses'],
			'fields': {
				'lexeme': {
					'type': 'multitext',
					'label': 'Word',
					'visible': true,
					'inputSystems': ['th-fonipa-x-etic'],
					'width': 20
				},
				'senses': {
					'type': 'fields',
					'fieldOrder': ['definition', 'partOfSpeech', 'semanticDomain', 'examples'],
					'fields': {
						'definition': {
							'type': 'multitext',
							'label': 'Meaning',
							'visible': true,
							'inputSystems': ['th', 'en'],
							'width': 20
						},
						'partOfSpeech': {
							'type': 'optionlist',
							'label': 'Part of Speech',
							'visible': true,
							'values': {
								'noun': 'Noun',
								'verb': 'Verb',
								'adjective': 'Adjective'
							},
							'width': 20
						},
						'semanticDomain': {
							'type': 'optionlist',
							'label': 'Semantic Domain',
							'visible': true,
							'values': {
								'2.1': '2.1 Body',
								'2.2': '2.2 Head and Shoulders',
								'2.3': '2.3 Feet'
							},
							'width': 20
						},
						'examples': {
							'type': 'fields',
							'visible': true,
							'fieldOrder': ['example', 'translation'],
							'fields': {
								'example': {
									'type': 'multitext',
									'label': 'Example Sentence',
									'visible': true,
									'inputSystems': ['th'],
									'width': 20
								},
								'translation': {
									'type': 'multitext',
									'label': 'Example Translation',
									'visible': true,
									'inputSystems': ['en'],
									'width': 20
								}
							}
						}
					}
				}
			}
		},
		'tasks': {
			'view': {'visible': true},
			'dashboard': {
				'visible': true,
				'timeRange': '30days',
				'targetWordCount': 0
			},
			'gather-texts': {'visible': true},
			'semdom': {
				'visible': true,
				'language': 'en',
				'visibleFields': {
					'definition': true,
					'partOfSpeech': true,
					'example': true,
					'translation': true
				}
			},
			'wordlist': {'visible': true},
			'dbe': {'visible': true},
			'add-meanings': {'visible': true},
			'add-grammar': {'visible': true},
			'add-examples': {'visible': true},
			'settings': {'visible': true},
			'review': {'visible': true}
		}
	};
	*/

