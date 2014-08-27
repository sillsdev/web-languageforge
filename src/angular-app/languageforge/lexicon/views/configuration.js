'use strict';

angular.module('lexicon.configuration', ['ui.bootstrap', 'bellows.services', 'palaso.ui.notice',
	'palaso.ui.language', 'ngAnimate', 'palaso.ui.picklistEditor', 'lexicon.services', 'palaso.util.model.transform'])
	.controller('ConfigCtrl', ['$scope', 'silNoticeService', 'lexProjectService', 'sessionService', '$filter', '$modal', 'lexConfigService', '$location',
		function ($scope, notice, lexProjectService, ss, $filter, $modal, lexConfigService, $location) {
			lexProjectService.setBreadcrumbs('configuration', $filter('translate')('Dictionary Configuration'));
			$scope.configDirty = angular.copy(ss.session.projectSettings.config);
			$scope.optionlistDirty = angular.copy(ss.session.projectSettings.optionlists);
			$scope.isSaving = false;

			// InputSystemsViewModel based on BCP 47
			// TODO: This is currently only a partial implementation.  2014-08 DDW
			// References: http://en.wikipedia.org/wiki/IETF_language_tag
			//             http://tools.ietf.org/html/rfc5646#page-15
			var InputSystemsViewModel = function(inputSystem) {
				this.uuid = inputSystem.tag; // TODO Need to make this a valid uuid on construction.

				// Manage the Special dropdown on the View
				this.special = '';

				// 2-3 letter (RFC 5646 2.2.1 Primary Language Subtag)
				this.language = '';

				// 3-letter (RFC 5646 2.2.2 Extended Language Subtag) currently not implemented

				// 4-letter (RFC 5646 2.2.3 Script Subtag)
				this.script = '';

				// 2-letter or 3-number (RFC 5646 2.2.4 Region Subtag)
				this.region = '';

				// 5+ letter or 1-number 3+ character (RFC 5646 2.2.5 Variant Subtag)
				// Although the spec says we can have multiple variants, we really only use 'fonipa'
				this.variant = '';

				// RFC 5646 2.2.7 Private Use Subtag)

				// Array of SIL 'registered' private use tags
				//       x-etic : raw phonetic transcription
				//       x-emic : uses the phonology of the language
				//       x-audio: audio transcript (voice)
				this.silPrivateUse = [];

				// Array of all other private use tags.  Typically used to designate language group
				this.generalPrivateUse = [];

				this.inputSystem = inputSystem;

				this.hasPrivateUse = function() {
					return ((this.silPrivateUse.length > 0) ||
							(this.generalPrivateUse.length > 0));
				};

				// Utility to concatenate all the private use strings as '-x-...-...'
				this.privateUseAsString = function() {
					var str = '';
					if (this.hasPrivateUse()) {
						str += '-x';
					}
					this.silPrivateUse.forEach(function(entry) {
						str += '-' + entry;
					});
					this.generalPrivateUse.forEach(function(entry) {
						str += '-' + entry;
					});
					return str;
				};

				// Create a language tag based on the view
				this.buildTag = function () {
					var newTag = this.language;

					var optionsOrder = $scope.selects.special.optionsOrder;
					switch (this.special) {
						// IPA transcription
						case optionsOrder[1]:
							newTag += '-fonipa';
							break;

						// Voice
						case optionsOrder[2]:
							newTag += '-Zxxx';
							break;

						// Script / Region / Variant
						case optionsOrder[3]:
							// Default script for Unlisted language is "Code for undetermined script"
							if (this.language == 'qaa' && !this.script && !this.region) {
								this.script = 'Zyyy';
							}
							newTag += (this.script) ? '-' + this.script : '';
							newTag += (this.region) ? '-' + this.region : '';
							break;
					}

					newTag += this.privateUseAsString();
				};

				// Parse the language tag and populate InputSystemsViewModel
				this.parseTag = function (tag) {
					var tokens = tag.split('-');
					var lookForPrivateUsage = false;
					this.privateUsage = '';

					// Assumption we will never have an entire tag that is private
					// usage or grandfathered (entire tag starts with x- or i-)

					// Language code
					this.language = tokens[0];

					var optionsOrder = $scope.selects.special.optionsOrder;
					this.special = optionsOrder[0];

					// Parse the rest of the language tag
					for (var i = 1, l = tokens.length; i < l; i++) {

						if (!lookForPrivateUsage) {
							// Script
							if ((/^[a-zA-Z]{4}$/.test(tokens[i])) &&
								(tokens[i] in _inputSystems_scripts)) { //!!!
								this.script = tokens[i];
								this.special = optionsOrder[3];
								continue;
							}

							// Region
							if ((/^[a-zA-Z]{2}$/.test(tokens[i]) ||
								/^[0-9]{3}$/.test(tokens[i])) &&
								(tokens[i] in _inputSystems_regions)) { //!!!
								this.region = tokens[i];
								this.special = optionsOrder[3];
								continue;
							}

							// Variant
							if (/^[a-zA-Z]{5,}$/.test(tokens[i]) ||
								/^[0-9][0-9a-zA-Z]{3,}$/.test(tokens[i])) {
								//console.log('variant IPA: ' + tokens[i]);
								this.variant = tokens[i];
								if (tokens[i] == 'fonipa') {
									this.special = optionsOrder[1];
								}
								continue;
							}

							// Special marker for private usage
							if (tokens[i] == 'x') {
								lookForPrivateUsage = true;
								continue;
							}

							// Parse for the rest of the private usage tags
						} else {
							// SIL registered private use tags
							if (tokens[i] == 'audio') {
								this.silPrivateUse.push(tokens[i]);
								this.special = optionsOrder[2];
								continue;
							}
							if ((tokens[i] == 'etic') ||
								(tokens[i] == 'emic')) {
								console.log('purpose: ' + tokens[i]);
								this.silPrivateUse.push(tokens[i]);
								continue;
							}

							// General Private Usage
							console.log('concat priv: ' + tokens[i]);
							this.generalPrivateUse.push(tokens[i]);
							continue;
						}
					}

					//this.inputSystem.languageName = this.generateName();
				};

				// Utility to generate language names that appear the view's list of language names
				this.generateName = function () {
					// Generate name
					var name = this.inputSystem.languageName;

					// Additional name information
					if (this.variant == 'fonipa') {
						name += ' (IPA)';
					} else if (this.silPrivateUse.indexOf('audio') != -1) {
						name += ' (Voice)';
					}
					return name;
				};

                //this.parseTag(this.inputSystem.tag);
			};

			$scope.inputSystemViewModels = {};
			$scope.selects = {
				'special': {
					'optionsOrder': ['none', 'ipaTranscription', 'voice', 'scriptRegionVariant'],
					'options': {
						'none': $filter('translate')('none'),
						'ipaTranscription': $filter('translate')('IPA transcription'),
						'voice': $filter('translate')('Voice'),
						'scriptRegionVariant': $filter('translate')('Script / Region / Variant')
					}
				},
				'purpose': {
					'optionsOrder': ['etic', 'emic'],
					'options': {
						'etic': $filter('translate')('Etic (raw phonetic transcription)'),
						'emic': $filter('translate')('Emic (uses the phonology of the language)')
					}
				},
				'script': {
					'options': InputSystems.scripts()
				},
				'region': {
					'options': InputSystems.regions()
				}
			};

			$scope.isCustomField = lexConfigService.isCustomField;
			$scope.currentInputSystemTag = '';
			$scope.selectInputSystem = function selectInputSystem(inputSystemTag) {
				$scope.currentInputSystemTag = inputSystemTag;
			};

			setupView();


			function sortInputSystemsList() {
				return $filter('orderBy')($filter('orderAsArray')($scope.inputSystemViewModels, 'tag'), 'languageName');
				//return $filter('orderBy')($filter('orderAsArray')($scope.configDirty.inputSystems, 'tag'), 'languageName');
			}

			function setupView() {
				if (!angular.isDefined($scope.configDirty.inputSystems)) {
					return;
				}

				// InputSystemsViewModels
				$scope.inputSystemViewModels = {};
				angular.forEach($scope.configDirty.inputSystems, function (item) {
					//!!! This is fine for construction of a new presenter, but inadequate for updating after a save. Currently it is used in both situations.
					var vm = new InputSystemsViewModel(item);
                    vm.parseTag(item.tag);
					$scope.inputSystemViewModels[vm.uuid] = vm;
				});

				$scope.inputSystemsList = sortInputSystemsList();

				// select the first items
				$scope.selectInputSystem($scope.inputSystemsList[0].tag);
				$scope.currentTaskName = 'dashboard';

				// for FieldConfigCtrl
				$scope.fieldConfig = {};
				angular.forEach($scope.configDirty.entry.fieldOrder, function (fieldName) {
					if (angular.isDefined($scope.configDirty.entry.fields[fieldName])) {
						if ($scope.configDirty.entry.fields[fieldName].type !== 'fields') {
							$scope.fieldConfig[fieldName] = $scope.configDirty.entry.fields[fieldName];
						}
					}
					/*
					 } else {
					 if ($scope.configDirty.entry.fields.customFields.fields[fieldName].type !== 'fields') {
					 $scope.fieldConfig[fieldName] = $scope.configDirty.entry.fields.customFields.fields[fieldName];
					 }
					 */
				});
				angular.forEach($scope.configDirty.entry.fields.senses.fieldOrder, function (fieldName) {
					if (angular.isDefined($scope.configDirty.entry.fields.senses.fields[fieldName])) {
						if ($scope.configDirty.entry.fields.senses.fields[fieldName].type !== 'fields') {
							$scope.fieldConfig[fieldName] = $scope.configDirty.entry.fields.senses.fields[fieldName];
						}

					}
					//} else {
					//if ($scope.configDirty.entry.fields.senses.fields.customFields.fields[fieldName].type !== 'fields') {
					//  $scope.fieldConfig[fieldName] = $scope.configDirty.entry.fields.senses.fields.customFields.fields[fieldName];
					//}
				});
				angular.forEach($scope.configDirty.entry.fields.senses.fields.examples.fieldOrder, function (fieldName) {
					if (angular.isDefined($scope.configDirty.entry.fields.senses.fields.examples.fields[fieldName])) {
						if ($scope.configDirty.entry.fields.senses.fields.examples.fields[fieldName].type !== 'fields') {
							$scope.fieldConfig[fieldName] = $scope.configDirty.entry.fields.senses.fields.examples.fields[fieldName];
						}
					}
					//} else {
					//    if ($scope.configDirty.entry.fields.senses.fields.examples.fields.customFields.fields[fieldName].type !== 'fields') {
					//        $scope.fieldConfig[fieldName] = $scope.configDirty.entry.fields.senses.fields.examples.fields.customFields.fields[fieldName];
					//    }
				});

				// suggested languages from lexical data
				$scope.suggestedLanguageCodes = [];
			};

			$scope.configurationApply = function () {
				$scope.isSaving = true;
				lexProjectService.updateConfiguration($scope.configDirty, $scope.optionlistDirty, function (result) {
					if (result.ok) {
						notice.push(notice.SUCCESS, $filter('translate')('Dictionary configuration updated successfully'));
						$scope.configForm.$setPristine();
						$scope.projectSettings.config = angular.copy($scope.configDirty);
						$scope.projectSettings.optionlist = angular.copy($scope.optionlistDirty);
						//!!! Need to check the response and fixup our uuid -> id mapping This could be done inside setupView
						setupView(); //!!! Calling setupview after save is not a good idea.
					}
					$scope.isSaving = false;
				});

			};

			$scope.backToDictionary = function backToDictionary() {
				$location.path('/dbe');
			};

			$scope.showInputSystems = function () {
				return !($scope.currentInputSystemTag in $scope.projectSettings.config.inputSystems);
			};

			// InputSystemsConfigCtrl
			$scope.newExists = function (special) {
				var code = $scope.inputSystemViewModels[$scope.currentInputSystemTag].inputSystem.language;
				var viewModel = new InputSystemsViewModel({'language': code});
				viewModel.special = special;
				var tag = viewModel.buildTag();
				return (tag in $scope.inputSystemViewModels);
			};
			// TODO This is broken when adding input system from More dropdown.  2014-08 DDW
			$scope.addInputSystem = function addInputSystem(code, languageName, special) {
				//var tag = 'xxNewTagxx'; // Assume this is done inside the 'constructor'.  Make it so :-)
				var viewModel = new InputSystemsViewModel({
					'language': code,
					'languageName': languageName,
					'abbreviation': code
				});
				viewModel.special = special;
				$scope.inputSystemViewModels[viewModel.uuid] = viewModel;
				$scope.currentInputSystemTag = viewModel.uuid;
			};

			$scope.removeInputSystem = function removeInputSystem(currentInputSystemTag) {
				delete $scope.inputSystemViewModels[currentInputSystemTag];
				$scope.inputSystemsList = sortInputSystemsList();
				$scope.configForm.$setDirty();

				// select the first items
				$scope.selectInputSystem($scope.inputSystemsList[0].tag);
			};

			$scope.isUnlistedLanguage = function isUnlistedLanguage(code) {
				return (code == 'qaa');
			};

			$scope.openNewLanguageModal = function openNewLanguageModal(suggestedLanguageCodes) {
				var modalInstance = $modal.open({
					templateUrl: '/angular-app/languageforge/lexicon/views/select-new-language.html',
					controller: ['$scope', '$modalInstance', function ($scope, $modalInstance) {
						$scope.selected = {
							code: '',
							language: {}
						};
						$scope.add = function () {
							$modalInstance.close($scope.selected);
						};
						$scope.suggestedLanguageCodes = suggestedLanguageCodes;
					}]
				});

				modalInstance.result.then(function (selected) {
					$scope.addInputSystem(selected.code, selected.language.name, $scope.selects.special.optionsOrder[0]);
				});

			};

			$scope.$watchCollection('inputSystems[currentInputSystemTag]', function (newValue) {
				if (newValue == undefined) {
					return;
				}

				//$scope.inputSystemViewModels[tag].name = $scope.inputSystemViewModels[tag].languageName;
				//$scope.inputSystemViewModels[tag].name = InputSystems.getName($scope.inputSystemViewModels[tag].languageName, newTag);
				if (tag != newTag) {
					if (!(newTag in $scope.inputSystemViewModels)) {
						$scope.inputSystemViewModels[tag].tag = newTag;
						$scope.inputSystemViewModels[newTag] = $scope.inputSystemViewModels[tag];
						// TODO fix watched language name 2014-08 DDW
						console.log('newTag: ' + newTag);
						InputSystems.parseTag($scope.inputSystemViewModels[newTag], newTag, $scope.selects.special.optionsOrder);


						$scope.configForm.$setDirty();
						// Review CP 2014-08 This is going to cause problems if we have a ui that allows the same language code to
						// change between different specials. Ideally there would be some immutable key that we could use, at least
						// for the duration of editing in the ui.
						delete $scope.inputSystemViewModels[tag];
						$scope.selectInputSystem(newTag);
					}
					$scope.inputSystemsList = sortInputSystemsList();
				}
			});

		}])
	.controller('FieldConfigCtrl', ['$scope', '$modal', function ($scope, $modal) {
		$scope.showAllFields = false;

		$scope.currentField = {
			'name': '',
			'inputSystems': {
				'fieldOrder': [],
				'selecteds': {}
			}
		};
		$scope.selectField = function selectField(fieldName) {
			if ($scope.currentField.name !== fieldName) {
				var inputSystems = $scope.fieldConfig[fieldName].inputSystems;

				$scope.currentField.name = fieldName;

				$scope.currentField.inputSystems.selecteds = {};
				angular.forEach(inputSystems, function (tag) {
					$scope.currentField.inputSystems.selecteds[tag] = true;
				});

				// if the field uses input systems, add the selected systems first then the unselected systems
				if (inputSystems) {
					$scope.currentField.inputSystems.fieldOrder = inputSystems;
					angular.forEach($scope.configDirty.inputSystems, function (inputSystem, tag) {
						if (!(tag in $scope.currentField.inputSystems.selecteds) &&
							$scope.currentField.inputSystems.fieldOrder.indexOf(tag) == -1) {
							$scope.currentField.inputSystems.fieldOrder.push(tag);
						}
					});
				}
			}
		};
		$scope.selectField('lexeme');

		$scope.moveUp = function moveUp(currentTag) {
			var currentTagIndex = $scope.currentField.inputSystems.fieldOrder.indexOf(currentTag);
			$scope.currentField.inputSystems.fieldOrder[currentTagIndex] = $scope.currentField.inputSystems.fieldOrder[currentTagIndex - 1];
			$scope.currentField.inputSystems.fieldOrder[currentTagIndex - 1] = currentTag;
			$scope.fieldConfig[$scope.currentField.name].inputSystems = [];
			angular.forEach($scope.currentField.inputSystems.fieldOrder, function (tag) {
				if ($scope.currentField.inputSystems.selecteds[tag]) {
					$scope.fieldConfig[$scope.currentField.name].inputSystems.push(tag);
				}
			});
			$scope.configForm.$setDirty();
		};
		$scope.moveDown = function moveDown(currentTag) {
			var currentTagIndex = $scope.currentField.inputSystems.fieldOrder.indexOf(currentTag);
			$scope.currentField.inputSystems.fieldOrder[currentTagIndex] = $scope.currentField.inputSystems.fieldOrder[currentTagIndex + 1];
			$scope.currentField.inputSystems.fieldOrder[currentTagIndex + 1] = currentTag;
			$scope.fieldConfig[$scope.currentField.name].inputSystems = [];
			angular.forEach($scope.currentField.inputSystems.fieldOrder, function (tag) {
				if ($scope.currentField.inputSystems.selecteds[tag]) {
					$scope.fieldConfig[$scope.currentField.name].inputSystems.push(tag);
				}
			});
			$scope.configForm.$setDirty();
		};

		$scope.fieldIsHidden = function fieldIsHidden(fieldName) {
			if (angular.isUndefined($scope.fieldConfig[fieldName]) || !('hideIfEmpty' in $scope.fieldConfig[fieldName])) {
				return true;
			}
			return !$scope.showAllFields && $scope.fieldConfig[fieldName].hideIfEmpty;
		};

		$scope.fieldConfigItemExists = function fieldConfigItemExists(itemName) {
			return itemName in $scope.fieldConfig[$scope.currentField.name];
		};

		$scope.openNewCustomFieldModal = function openNewCustomFieldModal() {
			var modalInstance = $modal.open({
				scope: $scope,
				templateUrl: '/angular-app/languageforge/lexicon/views/new-custom-field.html',
				controller: ['$scope', '$filter', '$modalInstance', function ($scope, $filter, $modalInstance) {
					$scope.selects = {};
					$scope.selects.level = {
						'optionsOrder': ['entry', 'senses', 'examples'],
						'options': {
							'entry': $filter('translate')('Entry Level'),
							'senses': $filter('translate')('Meaning Level'),
							'examples': $filter('translate')('Example Level')
						}
					};
					$scope.selects.type = {
						'optionsOrder': ['multitext', 'optionlist', 'multioptionlist'],
						'options': {
							'multitext': $filter('translate')('Multi-input-system Text'),
							'optionlist': $filter('translate')('Option List'),
							'multioptionlist': $filter('translate')('Multi-option List'),
							'reference': $filter('translate')('Entry Reference'),
							'picture': $filter('translate')('Picture'),
							'date': $filter('translate')('Date'),
							'number': $filter('translate')('Number')
						}
					};
					$scope.newCustomData = {
						'name': ''
					};
					$scope.customFieldNameExists = function customFieldNameExists(level, code) {
						var customFieldName = 'customField_' + level + '_' + code;
						return customFieldName in $scope.fieldConfig;
					};
					$scope.add = function add() {
						$modalInstance.close($scope.newCustomData);
					};

					$scope.$watch('newCustomData.name', function (newValue, oldValue) {
						if (angular.isDefined(newValue) && newValue !== oldValue) {

							// replace spaces with underscore
							$scope.newCustomData.code = newValue.replace(/ /g, '_');
						}
					});

				}]
			});

			modalInstance.result.then(function (newCustomData) {
				var customField = {},
					customViewField = {},
					customFieldName = 'customField_' + newCustomData.level + '_' + newCustomData.code;
				customField.label = newCustomData.name;
				customField.type = newCustomData.type;
				customField.hideIfEmpty = false;
				customViewField.type = 'basic';
				customViewField.show = false;
				if (newCustomData.type === 'multitext') {
					customField.displayMultiline = false;
					customField.width = 20;
					customField.inputSystems = [$scope.inputSystemsList[0].tag];
					customViewField.type = 'multitext';
					customViewField.overrideInputSystems = false;
					customViewField.inputSystems = [];
				}

				switch (newCustomData.level) {
					case 'examples':
						$scope.configDirty.entry.fields.senses.fields.examples.fields[customFieldName] = customField;
						$scope.fieldConfig[customFieldName] = $scope.configDirty.entry.fields.senses.fields.examples.fields[customFieldName];
						if (!(customFieldName in $scope.configDirty.entry.fields.senses.fields.examples.fieldOrder)) {
							$scope.configDirty.entry.fields.senses.fields.examples.fieldOrder.push(customFieldName);
						}
						break;
					case 'senses':
						$scope.configDirty.entry.fields.senses.fields[customFieldName] = customField;
						$scope.fieldConfig[customFieldName] = $scope.configDirty.entry.fields.senses.fields[customFieldName];
						if (!(customFieldName in $scope.configDirty.entry.fields.senses.fieldOrder)) {
							$scope.configDirty.entry.fields.senses.fieldOrder.push(customFieldName);
						}
						break;

					// 'entry'
					default:
						$scope.configDirty.entry.fields[customFieldName] = customField;
						$scope.fieldConfig[customFieldName] = $scope.configDirty.entry.fields[customFieldName];
						if (!(customFieldName in $scope.configDirty.entry.fieldOrder)) {
							$scope.configDirty.entry.fieldOrder.push(customFieldName);
						}
				}

				angular.forEach($scope.configDirty.roleViews, function (roleView) {
					roleView.fields[customFieldName] = angular.copy(customViewField);
				});
				$scope.configDirty.roleViews['project_manager'].fields[customFieldName].show = true;
				angular.forEach($scope.configDirty.userViews, function (userView) {
					userView.fields[customFieldName] = angular.copy(customViewField);
				});

				$scope.selectField(customFieldName);
				$scope.configForm.$setDirty();
			});
		};

		$scope.showRemoveCustomField = function showRemoveCustomField(fieldName) {
			if ($scope.isCustomField(fieldName) && !(fieldName in $scope.projectSettings.config.entry.fields) && !(fieldName in $scope.projectSettings.config.entry.fields.senses.fields) && !(fieldName in $scope.projectSettings.config.entry.fields.senses.fields.examples.fields)) {
				return true;
			}
			return false;
		};

		$scope.removeSelectedCustomField = function removeSelectedCustomField() {
			var fieldName = $scope.currentField.name,
				i;
			if ($scope.isCustomField(fieldName)) {
				delete $scope.fieldConfig[fieldName];

				// remove field name from fieldOrder
				i = $scope.configDirty.entry.fields.senses.fields.examples.fieldOrder.indexOf(fieldName);
				if (i > -1) {
					$scope.configDirty.entry.fields.senses.fields.examples.fieldOrder.splice(i, 1);
				}
				i = $scope.configDirty.entry.fields.senses.fieldOrder.indexOf(fieldName);
				if (i > -1) {
					$scope.configDirty.entry.fields.senses.fieldOrder.splice(i, 1);
				}
				i = $scope.configDirty.entry.fieldOrder.indexOf(fieldName);
				if (i > -1) {
					$scope.configDirty.entry.fieldOrder.splice(i, 1);
				}

				$scope.configForm.$setDirty();
				$scope.selectField('lexeme');
			}
		};

		$scope.editInputSystems = {
			'collapsed': true,
			'done': function () {
				this.collapsed = true;
			}
		};

		$scope.$watchCollection('currentField.inputSystems.selecteds', function (newValue) {
			if (angular.isDefined(newValue)) {
				if (angular.isDefined($scope.fieldConfig[$scope.currentField.name].inputSystems)) {
					$scope.fieldConfig[$scope.currentField.name].inputSystems = [];
					angular.forEach($scope.currentField.inputSystems.fieldOrder, function (tag) {
						if ($scope.currentField.inputSystems.selecteds[tag]) {
							$scope.fieldConfig[$scope.currentField.name].inputSystems.push(tag);
						}
					});
				}
			}
		});

	}])
	.controller('TaskConfigCtrl', ['$scope', '$filter', function ($scope, $filter) {
		$scope.selects.timeRange = {
			'optionsOrder': ['30days', '90days', '1year', 'all'],
			'options': {
				'30days': $filter('translate')('Up to 30 days'),
				'90days': $filter('translate')('Up to 90 days'),
				'1year': $filter('translate')('Up to 1 year'),
				'all': $filter('translate')('All')
			}
		};
		$scope.selects.language = {
			'options': {
				'en': $filter('translate')('English'),
				'es': $filter('translate')('Spanish'),
				'fr': $filter('translate')('French'),
				'hi': $filter('translate')('Hindi'),
				'id': $filter('translate')('Indonesian'),
				'km': $filter('translate')('Central Khmer'),
				'ne': $filter('translate')('Nepali'),
				'ru': $filter('translate')('Russian'),
				'th': $filter('translate')('Thai'),
				'ur': $filter('translate')('Urdu'),
				'zh-CN': $filter('translate')('Chinese')
			}
		};

		$scope.selectTask = function (taskName) {
			$scope.currentTaskName = taskName;
		};

	}])
	.controller('OptionListCtrl', ['$scope', function ($scope) {
		$scope.optionLists = {
			pos: {
				id: 'pos',
				name: 'Part of Speech',
				items: $scope.optionlistDirty[0].items,
				defaultKey: 'noun'
			}
		};
		$scope.currentListId = 'pos';

		$scope.selectList = function (listId) {
			$scope.currentListId = listId;
		};

		$scope.$watch('optionLists.pos.items', function (newval, oldval) {
			if (angular.isDefined(newval) && newval != oldval) {
				$scope.configForm.$setDirty();
			}
		}, true);

	}])
;
