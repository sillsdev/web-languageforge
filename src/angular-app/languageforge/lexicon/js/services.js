angular.module('lexicon.services', ['jsonRpc'])
	.service('lexEntryService', function() {
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
		this.configInputSystems = function() {
			return _config.inputSystems;
		};
		this.readProjectSettings = function(projectId, callback) {
			var config = angular.copy(_config);
			this.setConfig(config);
			(callback || angular.noop)({'ok': true, 'data': {'config': config}});
		};
		this.updateProjectSettings = function(projectId, config, callback) {
			_config = config;
			(callback || angular.noop)({'ok': true});
		};
		
		var _dtoConfig = {};
		this.setConfig = function(dtoConfig) {
			_dtoConfig = angular.copy(dtoConfig);
		};
		this.getConfig = function() {
			return _dtoConfig;
		};

		var sampleData = [
				{
					"lexeme": {"th-fonipa-x-etic": "khâaw kài thɔ̂ɔt"},
					"senses": [{
						"definition": {
							"th": "ข้าวไก่ทอด",
							"en": "pieces of fried chicken served over rice, usually with a sweet and spicy sauce on the side",
						}
					}],
				},

				{
					"lexeme": {"th-fonipa-x-etic": "krapâw mǔu"},
					"senses": [{
						"definition": {
							"th": "กระเพาหมู",
							"en": "stir fried basil and hot peppers with ground pork over rice",
						}
					}],
				},

				{
					"lexeme": {"th-fonipa-x-etic": "phàt siiʔ ǐw mǔu"},
					"senses": [{
						"definition": {
							"th": "ผัดชีอิ้วหมู",
							"en": "Noodles fried in soy sauce with pork",
					}}],
				},

				{
					"lexeme": {"th-fonipa-x-etic": "kài phàt métmàmùaŋ"},
					"senses": [{
						"definition": {
							"th": "ไก่ผัดเม็ดมะม่วง",
							"en": "Stir fried chicken with cashews",
						}
					}],
				},

				{
					"lexeme": {"th-fonipa-x-etic": "cèt khǔnsʉ̀k phàt phrìk phǎw"},
					"senses": [{
						"definition": {
							"th": "เจ็ดขุนศึกผัดผริกเผา",
							"en": "seven kinds of meat fried and seared with peppers",
						}
					}],
				},

				{
					"lexeme": {"th-fonipa-x-etic": "phàt prîaw wǎan kài"},
					"senses": [{
						"definition": {
							"th": "ผัดเปรี้ยวหวานหมู",
							"en": "Sweet and sour chicken",
						}
					}],
				},

				{
					"lexeme": {"th-fonipa-x-etic": "phàt thai kûŋ"},
					"senses": [{
						"definition": {
							"th": "ผักไทกุ้ง",
							"en": "Fried noodles mixed or wrapped with egg and bamboo shoots topped with shrimp",
						}
					}],
				},

				{
					"lexeme": {"th-fonipa-x-etic": "khâaw khài ciaw mǔu yɔ̂ɔ"},
					"senses": [{
						"definition": {
							"th": "ข้าวไข่เจียหมูยอ",
							"en": "fried omelette with pork over rice",
						}
					}],
				},

				{
					"lexeme": {"th-fonipa-x-etic": "khâaw phàt mǔu"},
					"senses": [{
						"definition": {
							"th": "ข้าวผัดหมู",
							"en": "Fried rice with minced pork",
						}
					}],
				},

				{
					"lexeme": {"th-fonipa-x-etic": "nɔ̀máay fàràŋ phàt kûŋ"},
					"senses": [{
						"definition": {
							"th": "หน่อไม้ฝรั่งผัดกุ้ง",
							"en": "Sauteed asparagus with shrimp over rice",
						}
					}],
				},

				{
					"lexeme": {"th-fonipa-x-etic": "kài sòt kràthiam"},
					"senses": [{
						"definition": {
							"th": "ไก่สกกระเกียม",
							"en": "stir fried garlic chicken over rice",
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

		this.saveNow = function(projectId, callback) {
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

		this.read = function(projectId, id, callback) {
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

		this.update = function(projectId, entry, callback) {
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

		this.remove = function(projectId, id, callback) {
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
				var title = e.lexeme[inputSystem];
				if (!title) {
					title = '[new word]';
				}
				list.push({id: e.id, title: title, entry: e});
			});
			return list;
		};
		this.dbeDto = function(projectId, callback) {
			var dtoConfig = angular.copy(_config);
			this.setConfig(dtoConfig);
			(callback || angular.noop)({'ok': true, 'data': {'entries': getEntriesList(), 'config': dtoConfig}});
		};
		this.addExampleDto = function(projectId, callback) {
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
		this.addGrammarDto = function(projectId, callback) {
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
		this.addMeaningsDto = function(projectId, callback) {
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
	})
	;
