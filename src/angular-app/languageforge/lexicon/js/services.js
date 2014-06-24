angular.module('lexicon.services', ['jsonRpc', 'sgw.ui.breadcrumb'])
.service('lexBaseViewService', [function(jsonRpc, $location) {
	var _callbacks = [];
	var _data = {
		config: {},
		user: {},
		project: {},
		rights: {}
	};
	
	this.setData = function(data) {
		_data = angular.copy(data);
		if (angular.isDefined(_data.config.entry)) {
			angular.forEach(_callbacks, function(callback) {
				callback();
			});
		}
	};
	
	this.getData = function() {
		return _data;
	};
	
	this.setConfig = function(config) {
		_data.config = angular.copy(config);
		if (angular.isDefined(_data.config.entry)) {
			angular.forEach(_callbacks, function(callback) {
				callback();
			});
		}
	};
	
	this.getConfig = function() {
		return _data.config;
	};
	
	this.registerListener = function(callback) {
		_callbacks.push(callback);
		if (angular.isDefined(_data.config.entry)) {
			callback();
		}
	};
	
}])
.service('lexLinkService', ['$location', function($location) {
	this.project = function () {
		return '/app/lexicon/' + this.getProjectId();
	};
	
	this.projectView = function (view) {
		return this.project() + '/' + view;
	};

	this.getProjectId = function() {
		// todo: make this work - cjh 2014-06
		return 0;
	};
}])
.service('lexProjectService', ['jsonRpc', 'breadcrumbService', 'lexLinkService', '$location', function(jsonRpc, breadcrumbService, linkService, $location) {
	jsonRpc.connect('/api/sf');
	this.baseViewDto = function(view, label, callback) {
		jsonRpc.call('lex_baseViewDto', [], function(result) {
			if (result.ok) {
				breadcrumbService.set('top',
					[
					 {href: '/app/projects', label: 'My Projects'},
					 {href: linkService.project(), label: result.data.project.projectName},
					 {href: linkService.projectView(view), label: label},
					]
				);
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
		var projectId = this.getProjectId();
		jsonRpc.call('lex_projectDto', [], function(result) {
			if (result.ok) {
				breadcrumbService.set('top',
					[
					 {href: '/app/projects', label: 'My Projects'},
					 {href: linkService.project(), label: result.data.project.projectName},
					 {href: linkService.projectView('settings'), label: 'Project Settings'},
					]
				);
				callback(result);
			}
		});
	};
	
	this.updateProject = function(project, callback) {
		jsonRpc.call('lex_project_update', [project], callback);
	};
	
	this.users = function(callback) {
		var projectId = this.getProjectId();
		jsonRpc.call('lex_manageUsersDto', [], function(result) {
			if (result.ok) {
				breadcrumbService.set('top',
					[
					 {href: '/app/projects', label: 'My Projects'},
					 {href: linkService.project(), label: result.data.project.projectName},
					 {href: linkService.projectView('users'), label: 'User Management'},
					]
				);
				callback(result);
			}
		});
	};
	
	this.updateUserProfile = function(user, callback) {
		jsonRpc.call('user_updateProfile', [user], callback);
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
		jsonRpc.call('lex_entry_read', [id], callback);
	};
	
	this.update = function(entry, callback) {
		jsonRpc.call('lex_entry_update', [entry], callback);
	};

	this.remove = function(id, callback) {
		jsonRpc.call('lex_entry_remove', [id], callback);
	};

	this.dbeDto = function(iEntryStart, numberOfEntries, callback) {
		jsonRpc.call('lex_dbeDto', [iEntryStart, numberOfEntries], function(result) {
			if (result.ok) {
				breadcrumbService.set('top',
					[
					 {href: '/app/projects', label: 'My Projects'},
					 {href: linkService.project(), label: result.data.project.projectName},
					 {href: linkService.projectView('dbe'), label: 'Browse And Edit'},
					]
				);
				callback(result);
			}
		});
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

