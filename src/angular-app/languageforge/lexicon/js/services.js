angular.module('lexicon.services', ['jsonRpc', 'sgw.ui.breadcrumb'])
.service('lexConfigService', [function(jsonRpc, $location) {

	var _callbacks = [];
	var _config = {};
	
	this.setConfig = function(config) {
		_config = angular.copy(config);
		if (angular.isDefined(_config.entry)) {
			angular.forEach(_callbacks, function(callback) {
				callback();
			});
		}
	};
	
	this.getConfig = function() {
		return _config;
	};
	
	this.registerListener = function(callback) {
		_callbacks.push(callback);
		if (angular.isDefined(_config.entry)) {
			callback();
		}
	};
	
}])
.service('lexLinkService', ['$location', function($location) {
	this.project = function () {
		return '/app/lexicon#/p/' + this.getProjectId();
	};
	
	this.projectView = function (view) {
		return this.project() + '/' + view;
	};

	this.getProjectId = function() {
		var parts = $location.path().split('/');
		// strip off the "/p/"
		return parts[2];
	};
}])
.service('lexProjectService', ['jsonRpc', 'breadcrumbService', 'lexLinkService', '$location', function(jsonRpc, breadcrumbService, linkService, $location) {
	jsonRpc.connect('/api/sf');

	this.configurationPageDto = function(callback) {
		jsonRpc.call('lex_projectSettingsDto', [this.getProjectId()], function(result) {
			if (result.ok) {
				breadcrumbService.set('top',
					[
					 {href: '/app/projects', label: 'My Projects'},
					 {href: linkService.project(), label: result.data.project.projectname},
					 {href: linkService.projectView('configuration'), label: 'Dictionary Configuration'},
					]
				);
				callback(result);
			}
		});
	};

	this.updateConfiguration = function(config, callback) {
		jsonRpc.call('lex_projectSettings_update', [this.getProjectId(), config], callback);
	};
	
	
	this.importLift = function(importData, callback) {
		jsonRpc.call('lex_projectSettings_importLift', [this.getProjectId(), importData], function(result) {
			if (result.ok) {
				callback(result);
			}
		});
	};
	
	this.getProjectId = function() {
		var parts = $location.path().split('/');
		// strip off the "/p/"
		return parts[2];
	};
}])
.service('lexEntryService', ['jsonRpc', 'lexProjectService', 'breadcrumbService', 'lexLinkService', function(jsonRpc, projectService, breadcrumbService, linkService) {
	jsonRpc.connect('/api/sf');
	this.read = function(id, callback) {
		jsonRpc.call('lex_entry_read', [projectService.getProjectId(), id], callback);
	};
	
	this.update = function(entry, callback) {
		jsonRpc.call('lex_entry_update', [projectService.getProjectId(), entry], callback);
	};

	this.remove = function(id, callback) {
		jsonRpc.call('lex_entry_remove', [projectService.getProjectId(), id], callback);
	};

	this.dbeDto = function(callback) {
		jsonRpc.call('lex_dbeDto', [projectService.getProjectId()], function(result) {
			if (result.ok) {
				breadcrumbService.set('top',
					[
					 {href: '/app/projects', label: 'My Projects'},
					 {href: linkService.project(), label: result.data.project.projectname},
					 {href: linkService.projectView('dbe'), label: 'Browse And Edit'},
					]
				);
				callback(result);
			}
		});
	};
	
	this.updateLexemeComment = function(entryId, ws, comment, callback) {
		jsonRpc.call('lex_updateLexemeComment', [projectService.getProjectId(), entryId, ws, comment], callback);
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

