'use strict';

angular.module('settings', ['jsonRpc', 'ui.bootstrap', 'bellows.services', 'palaso.ui.notice', 'palaso.ui.dc.entry', 'ngAnimate'])
.controller('SettingsCtrl', ['$scope', 'userService', 'sessionService', 'silNoticeService', 'lexEntryService', '$filter', 
                             function($scope, userService, ss, notice, lexService, $filter) {
	var projectId = $scope.routeParams.projectId;
	$scope.project = {
		'id': projectId
	};
	
	$scope.showPre = true;		// TODO Remove. Set false to hide <pre>. Remove this and all debug <pre> IJH 2014-02

	$scope.config = {};
	$scope.inputSystems = {};
	
	$scope.selects = {
		'special': {
			'optionsOrder': ['none', 'ipaTranscription', 'voice', 'scriptRegionVariant'],
			'options': {
				'none': 'none',
				'ipaTranscription': 'IPA transcription',
				'voice': 'Voice',
				'scriptRegionVariant': 'Script / Region / Variant'
			}
		},
		'purpose': {
			'optionsOrder': ['etic', 'emic'],
			'options': {
				'etic': 'Etic (raw phonetic transcription)',
				'emic': 'Emic (uses the phonology of the language)'
			}
		},
		'script': {
			'options': inputSystems.scripts()
		},
		'region': {
			'options': inputSystems.regions()
		},
	};
	
	$scope.currentInputSystemTag = '';
	$scope.selectInputSystem = function(inputSystemTag) {
		$scope.currentInputSystemTag = inputSystemTag;
	};
	
	$scope.removeInputSystem = function(currentInputSystemTag) {
//		console.log("removeInputSystem");
		delete $scope.inputSystems[currentInputSystemTag];
		// select the first items
		$scope.selectInputSystem($filter('orderAsArray')($scope.config.inputSystems, 'tag')[0]['tag']);
	};
	
	$scope.queryProjectSettings = function() {
		lexService.readProjectSettings($scope.project.id, function(result) {
			if (result.ok) {
				$scope.config = result.data.config;
				$scope.inputSystems = $scope.config.inputSystems;
				for (var tag in $scope.inputSystems) {
					var code = inputSystems.getCode(tag);
					var script = inputSystems.getScript(tag);
					var region = inputSystems.getRegion(tag);
					var privateUse = inputSystems.getPrivateUse(tag);
					$scope.inputSystems[tag].name = inputSystems.getName(code, script, region, privateUse);
					$scope.inputSystems[tag].code = code;
					$scope.inputSystems[tag].purpose = '';
					$scope.inputSystems[tag].script = '';
					$scope.inputSystems[tag].region = '';
					$scope.inputSystems[tag].variant = '';
					switch(script) {
						case '':
							$scope.inputSystems[tag].special = $scope.selects.special.optionsOrder[0];
							break;
						case 'fonipa':
							$scope.inputSystems[tag].special = $scope.selects.special.optionsOrder[1];
							$scope.inputSystems[tag].purpose = privateUse;
							break;
						case 'Zxxx':
							if (privateUse == 'audio') {
								$scope.inputSystems[tag].special = $scope.selects.special.optionsOrder[2];
								break;
							}
						default:
							$scope.inputSystems[tag].special = $scope.selects.special.optionsOrder[3];
							$scope.inputSystems[tag].script = script;
							$scope.inputSystems[tag].region = region;
							$scope.inputSystems[tag].variant = privateUse;
					}
				};
				// select the first items
				$scope.selectInputSystem($filter('orderAsArray')($scope.config.inputSystems, 'tag')[0]['tag']);
				$scope.currentTaskName = 'dashboard';
			}
		});
	};

	$scope.settingsApply = function() {
//		console.log("settingsApply");
		lexService.updateProjectSettings($scope.project.id, $scope.config, function(result) {
			if (result.ok) {
				notice.push(notice.SUCCESS, "Project settings updated successfully");
				$scope.settingsForm.$setPristine();
			}
		});
	};
	
	$scope.queryProjectSettings();
	
	$scope.$watchCollection('inputSystems[currentInputSystemTag]', function(newValue) {
//		console.log("current input system watch: ", newValue);
		if (newValue != undefined) {
			var newInputSystemTag = $scope.inputSystems[$scope.currentInputSystemTag].code;
			switch($scope.inputSystems[$scope.currentInputSystemTag].special) {
				case $scope.selects.special.optionsOrder[1]:		// IPA transcription
					newInputSystemTag += '-fonipa';
					newInputSystemTag += ($scope.inputSystems[$scope.currentInputSystemTag].purpose) ? '-x-' + $scope.inputSystems[$scope.currentInputSystemTag].purpose : '';
					break;
				case $scope.selects.special.optionsOrder[2]:		// Voice
					newInputSystemTag += '-Zxxx-x-audio';
					break;
				case $scope.selects.special.optionsOrder[3]:		// Script / Region / Variant
					newInputSystemTag += ($scope.inputSystems[$scope.currentInputSystemTag].script) ? '-' + $scope.inputSystems[$scope.currentInputSystemTag].script : '';
					newInputSystemTag += ($scope.inputSystems[$scope.currentInputSystemTag].region) ? '-' + $scope.inputSystems[$scope.currentInputSystemTag].region : '';
					newInputSystemTag += ($scope.inputSystems[$scope.currentInputSystemTag].variant) ? '-x-' + $scope.inputSystems[$scope.currentInputSystemTag].variant : '';
					break;
			}
			if (newInputSystemTag != $scope.currentInputSystemTag) {
				$scope.inputSystems[newInputSystemTag] = $scope.inputSystems[$scope.currentInputSystemTag];
				delete $scope.inputSystems[$scope.currentInputSystemTag];
				$scope.selectInputSystem(newInputSystemTag);
			}
		}
	});

}])
.controller('FieldSettingsCtrl', ['$scope', 'userService', 'sessionService', 'silNoticeService', 'lexEntryService', 
                                  function($scope, userService, ss, notice, lexService) {
	$scope.fieldConfig = {
		'lexeme': $scope.config.entry.fields['lexeme'],
		'definition': $scope.config.entry.fields.senses.fields['definition'],
		'partOfSpeech': $scope.config.entry.fields.senses.fields['partOfSpeech'],
		'semanticDomainValue': $scope.config.entry.fields.senses.fields['semanticDomainValue'],
		'example': $scope.config.entry.fields.senses.fields.examples.fields['example'],
		'translation': $scope.config.entry.fields.senses.fields.examples.fields['translation']
	};
	$scope.currentField = {
		'name': '',
		'inputSystems': {
			'fieldOrder': [],
			'selecteds': {}
		}
	};
	$scope.selectField = function(fieldName) {
		$scope.currentField.name = fieldName;

		$scope.currentField.inputSystems.selecteds = {};
		angular.forEach($scope.fieldConfig[fieldName].inputSystems, function(tag) {
			$scope.currentField.inputSystems.selecteds[tag] = true;
		});
		
		// if the field uses input systems, add the selected systems first then the unselected systems
		if ($scope.fieldConfig[fieldName].inputSystems) {
			$scope.currentField.inputSystems.fieldOrder = $scope.fieldConfig[fieldName].inputSystems;
			angular.forEach($scope.config.inputSystems, function(inputSystem, tag) {
				if(! (tag in $scope.currentField.inputSystems.selecteds)) {
					$scope.currentField.inputSystems.fieldOrder.push(tag);
				}
			});
		}
	};
	
	$scope.moveUp = function(currentTag) {
		var currentTagIndex = $scope.currentField.inputSystems.fieldOrder.indexOf(currentTag);
		$scope.currentField.inputSystems.fieldOrder[currentTagIndex] = $scope.currentField.inputSystems.fieldOrder[currentTagIndex - 1];
		$scope.currentField.inputSystems.fieldOrder[currentTagIndex - 1] = currentTag;
	};
	$scope.moveDown = function(currentTag) {
		var currentTagIndex = $scope.currentField.inputSystems.fieldOrder.indexOf(currentTag);
		$scope.currentField.inputSystems.fieldOrder[currentTagIndex] = $scope.currentField.inputSystems.fieldOrder[currentTagIndex + 1];
		$scope.currentField.inputSystems.fieldOrder[currentTagIndex + 1] = currentTag;
	};

	$scope.editInputSystems = {
		'collapsed': true,
		'done': function() {
			this.collapsed = true;
		}
	};
	
	$scope.$watch('config', function (newValue) {
//		console.log("config Fields watch ", newValue);
		if (newValue != undefined) {
			// when config is updated select the first Feild in the list
			$scope.selectField('lexeme');
		}
	});
	$scope.$watchCollection('currentField.inputSystems.selecteds', function(newValue) {
//		console.log("currentField.inputSystems.selecteds watch ", newValue);
		if (newValue != undefined) {
			$scope.fieldConfig[$scope.currentField.name].inputSystems = [];
			angular.forEach($scope.currentField.inputSystems.selecteds, function(selected, tag) {
				if (selected) {
					$scope.fieldConfig[$scope.currentField.name].inputSystems.push(tag);
				}
			});
		}
	});
	
}])
.controller('TaskSettingsCtrl', ['$scope', 'userService', 'sessionService', 'silNoticeService', 'lexEntryService', 
                                 function($scope, userService, ss, notice, lexService) {
	$scope.selects.timeRange = {
		'optionsOrder': ['30days', '90days', '1year', 'all'],
		'options': {
			'30days': 'Up to 30 days',
			'90days': 'Up to 90 days',
			'1year': 'Up to 1 year',
			'all': 'All'
		}
	};
	$scope.selects.language = {
		'options': {
			'en': 'English',
			'es': 'Spanish',
			'fr': 'French',
			'hi': 'Hindi',
			'id': 'Indonesian',
			'km': 'Central Khmer',
			'ne': 'Nepali',
			'ru': 'Russian',
			'th': 'Thai',
			'ur': 'Urdu',
			'zh-CN': 'Chinese'
		}
	};
	
	$scope.selectTask = function(taskName) {
		$scope.currentTaskName = taskName;
	};

}])
;
