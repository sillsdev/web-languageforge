angular.module('lexicon.services', ['jsonRpc'])
	.service('lexProjectService', ['jsonRpc', '$location', function(jsonRpc, $location) {
		jsonRpc.connect('/api/sf');
		this.configInputSystems = function() {
			return _config.inputSystems;
		};
		
		var _config = {};
		
		var settingsChangeCallbacks = [];
		
		this.settingsChangeNotify = function(callback) {
			settingsChangeCallbacks.push(callback);
			if (angular.isDefined(_config.entry)) { // special case to notify the caller that we have a real config at this time
				callback();
			}
		};
		
		function _notifySettingsChange() {
			angular.forEach(settingsChangeCallbacks, function(callback) {
				callback();
			});
		}
		
		this.getSettings = function() {
			return angular.copy(_config);
		};
		
		this.readSettings = function(callback) {
			jsonRpc.call('lex_projectSettings_read', [this.getProjectId()], function(result) {
				if (result.ok) {
					_config = result.data;
					callback(result);
					_notifySettingsChange();
				}
			});
		};
		
		this.updateSettings = function(settings, callback) {
			jsonRpc.call('lex_projectSettings_update', [this.getProjectId(), settings], function(result) {
				if (result.ok) {
					_config = angular.copy(settings);
					callback(result);
					_notifySettingsChange();
				}
			});
		};
		
		this.getProjectId = function() {
			var parts = $location.path().split('/');
			// strip off the "/p/"
			return parts[2];
		};
	}])

	.service('lexEntryService', ['jsonRpc', 'lexProjectService', function(jsonRpc, projectService) {
		jsonRpc.connect('/api/sf');
		/*
		var _dtoConfig = {};
		this.setConfig = function(dtoConfig) {
			_dtoConfig = angular.copy(dtoConfig);
		};
		this.getConfig = function() {
			return _dtoConfig;
		};
		*/

		var sampleData = [
				{
					"lexeme": {"th-fonipa-x-etic": {value: "khâaw kài thɔ̂ɔt"}},
					"senses": [{
						"definition": {
							"th": {
								value: "ข้าวไก่ทอด",
								comments: [{
									userRef: {username: "Robin M.", email: "Robin_Munn@sil.org"},
									dateModified: "2014-03-03", // Actually a Javascript Date object
									regarding: "ข้าวไก่ทอด",
									content: "I can't read Thai.",
									score: 0,
									subcomments: [], // subcomments will have userRef, content, dateModified. No regarding, no score, no subcomments.
									status: "To Do", // Possible values may change, but for now: "Resolved", "To Do", "Reviewed". One value only -- these are not tags.
									},
									{
										userRef: {username: "Mike C.", email: "Michael_Cochran@sil.org"},
										dateModified: "2014-03-03", // Actually a Javascript Date object
										regarding: "ข้าวไก่ทอด",
										content: "I can.",
										score: 0,
										subcomments: [], // subcomments will have userRef, content, dateModified. No regarding, no score, no subcomments.
										status: "Reviewed", // Possible values may change, but for now: "Resolved", "To Do", "Reviewed". One value only -- these are not tags.
									},
									{
										userRef: {username: "Ira H.", email: "test@superexpert.com"},
										dateModified: "2014-03-03", // Actually a Javascript Date object
										regarding: "ข้าวไก่ทอด",
										content: "So can I.",
										score: 0,
										subcomments: [], // subcomments will have userRef, content, dateModified. No regarding, no score, no subcomments.
										status: "Resolved", // Possible values may change, but for now: "Resolved", "To Do", "Reviewed". One value only -- these are not tags.
									},
								]},
							"en": {
								value: "pieces of fried chicken served over rice, usually with a sweet and spicy sauce on the side",
								comments: [],  // No comments yet: empty list
							}
						},
						"partOfSpeech": {"value": "noun", "comments": []},
					}],
				},

				{
					"lexeme": {"th-fonipa-x-etic": {value: "krapâw mǔu"}},
					"senses": [{
						"definition": {
							"th": {value: "กระเพาหมู"},
							"en": {value: "stir fried basil and hot peppers with ground pork over rice"},
						}
					}],
				},

				{
					"lexeme": {"th-fonipa-x-etic": {value: "phàt siiʔ ǐw mǔu"}},
					"senses": [{
						"definition": {
							"th": {value: "ผัดชีอิ้วหมู"},
							"en": {value: "Noodles fried in soy sauce with pork"},
					}}],
				},

				{
					"lexeme": {"th-fonipa-x-etic": {value: "kài phàt métmàmùaŋ"}},
					"senses": [{
						"definition": {
							"th": {value: "ไก่ผัดเม็ดมะม่วง"},
							"en": {value: "Stir fried chicken with cashews"},
						}
					}],
				},

				{
					"lexeme": {"th-fonipa-x-etic": {value: "cèt khǔnsʉ̀k phàt phrìk phǎw"}},
					"senses": [{
						"definition": {
							"th": {value: "เจ็ดขุนศึกผัดผริกเผา"},
							"en": {value: "seven kinds of meat fried and seared with peppers"},
						}
					}],
				},

				{
					"lexeme": {"th-fonipa-x-etic": {value: "phàt prîaw wǎan kài"}},
					"senses": [{
						"definition": {
							"th": {value: "ผัดเปรี้ยวหวานหมู"},
							"en": {value: "Sweet and sour chicken"},
						}
					}],
				},

				{
					"lexeme": {"th-fonipa-x-etic": {value: "phàt thai kûŋ"}},
					"senses": [{
						"definition": {
							"th": {value: "ผักไทกุ้ง"},
							"en": {value: "Fried noodles mixed or wrapped with egg and bamboo shoots topped with shrimp"},
						}
					}],
				},

				{
					"lexeme": {"th-fonipa-x-etic": {value: "khâaw khài ciaw mǔu yɔ̂ɔ"}},
					"senses": [{
						"definition": {
							"th": {value: "ข้าวไข่เจียหมูยอ"},
							"en": {value: "fried omelette with pork over rice"},
						}
					}],
				},

				{
					"lexeme": {"th-fonipa-x-etic": {value: "khâaw phàt mǔu"}},
					"senses": [{
						"definition": {
							"th": {value: "ข้าวผัดหมู"},
							"en": {value: "Fried rice with minced pork"},
						}
					}],
				},

				{
					"lexeme": {"th-fonipa-x-etic": {value: "nɔ̀máay fàràŋ phàt kûŋ"}},
					"senses": [{
						"definition": {
							"th": {value: "หน่อไม้ฝรั่งผัดกุ้ง"},
							"en": {value: "Sauteed asparagus with shrimp over rice"},
						}
					}],
				},

				{
					"lexeme": {"th-fonipa-x-etic": {value: "kài sòt kràthiam"}},
					"senses": [{
						"definition": {
							"th": {value: "ไก่สกกระเกียม"},
							"en": {value: "stir fried garlic chicken over rice"},
						}
					}],
				},

			];

		var serverEntries = [];
		var dirtyEntries = [];
		var lastLocalId = 0;
		var lastServerId = 0;
		var localIdMap = {};

		// for debugging
		this.serverEntries = function() {
			return serverEntries;
		};

		// for debugging
		this.dirtyEntries = function() {
			return dirtyEntries;
		};

		function serverIter(func) {
			for (var i=0; i<serverEntries.length; i++) {
				if (func(i, serverEntries[i])) {
					break;
				}
			}
		}

		// TODO: replace instances of this function with the full for loop
		// While this is a handy shortcut for developers, it makes the resulting code less readable
		// and perhaps less understandable.  Probably best to just code the full for loop everywhere
		// even though it is a few more keystrokes
		function dirtyIter(func) {
			for (var i=0; i<dirtyEntries.length; i++) {
				if (func(i, dirtyEntries[i])) {
					break;
				}
			}
		}

		function getNewServerId() {
			lastServerId++;
			return "server " + lastServerId;
		}

		function getNewLocalId() {
			lastLocalId++;
			return "local " + lastLocalId;
		}

		this.canSave = function() {
			return dirtyEntries.length > 0;
		};

		this.saveNow = function(callback) {
			// save each entry in the dirty list
			dirtyIter(function(i, dirtyEntry) {
				// do update or add on server (server figures it out)
				var updated = false;
				serverIter(function(j, serverEntry) {
					if (serverEntry.id == dirtyEntry.id) {
						serverEntries[j] = dirtyEntry;
						updated = true;
						return true;
					}
				});
				if (!updated) {
					var newServerId = getNewServerId();
					localIdMap[dirtyEntry.id] = newServerId;
					dirtyEntry.id = newServerId;
					serverEntries.unshift(dirtyEntry);
				}
			});
			dirtyEntries = [];
			(callback || angular.noop)({data:''});
		};

		this.read = function(id, callback) {
			var result = {};
			dirtyIter(function(i,e) {
				if (e.id == id) {
					result = e;
					return true;
				}
			});
			if (!result.hasOwnProperty('id')) {
				if (id.indexOf("local") != -1) {
					// this is a local id, get the corresponding server id
					id = localIdMap[id];
				}
				// read from server
				serverIter(function(i,e) {
					if (e.id == id) {
						result = e;
						return true;
					}
				});
			}
			(callback || angular.noop)({data: result});
		};

		this.update = function(entry, callback) {
			if (entry.hasOwnProperty('id') && entry.id != '') {
				var foundInDirty = false;
				dirtyIter(function(i,e) {
					if (e.id == entry.id) {
						dirtyEntries[i] = entry;
						foundInDirty = true;
						return true;
					}
				});
				if (!foundInDirty) {
					dirtyEntries.unshift(entry);
				}
			} else {
				entry.id = getNewLocalId();
				dirtyEntries.unshift(entry);
			}
			(callback || angular.noop)({data:entry});
		};

		this.remove = function(id, callback) {
			dirtyIter(function(i,e) {
				if (e.id == id) {
					dirtyEntries.splice(i, 1);
					return true;
				}
			});
			// remove from server
			serverIter(function(i,e){
				if (e.id == id) {
					serverEntries.splice(i, 1);
					return true;
				}
			});
			(callback || angular.noop)({data: {}});
			return;
		};

		getEntriesList = function() {
			var list = [];
			var inputSystem = _config.entry.fields.lexeme.inputSystems[0];
			serverIter(function(i,e) {
				var title = e.lexeme[inputSystem].value;
				if (!title) {
					title = '[new word]';
				}
				list.push({id: e.id, title: title, entry: e});
			});
			return list;
		};
		this.dbeDto = function(callback) {
			projectService.getSettings(function(result) {
				if (result.ok) {
					(callback || angular.noop)({'ok': true, 'data': {'entries': getEntriesList(), 'config': result.data}});
				}
			});
			//var dtoConfig = angular.copy(_config);
			//this.setConfig(dtoConfig);
		};
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

		// --- BEGIN TEST CODE ---
		// Set up sample data when service first created
		// (This will be removed once a real server is available)
		for (var _idx = 0; _idx < sampleData.length; _idx++) {
			var entry = sampleData[_idx];
			this.update('sampleProject', entry);
		};
		this.saveNow('sampleProject');
		// --- END TEST CODE ---
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
						'fieldOrder': ['definition', 'partOfSpeech', 'semanticDomainValue', 'examples'],
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
							'semanticDomainValue': {
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

