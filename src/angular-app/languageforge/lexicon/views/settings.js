'use strict';

angular.module(
		'settings', 
		['jsonRpc', 'ui.bootstrap', 'sf.services', 'palaso.ui.dc.entry', 'ngAnimate']
	)
	.controller('SettingsCtrl', ['$scope', 'userService', 'sessionService', 'lexEntryService', '$window', '$timeout', 
	                                 function($scope, userService, ss, lexService, $window, $timeout) {

		$scope.config = {};
		$scope.languageCodes = {};
		$scope.lists = {
			inputSystems: {}
		};
		
		$scope.selects = {
			'special': {
				'options': [
					'none',
					'IPA transcription',
					'Voice',
					'Script / Region / Variant'
				]
			},
			'purpose': {
				'options': [
					'unspecified',
					'Etic (raw phonetic transcription)',
					'Emic (uses the phonology of the language)'
				]
			},
			'script': {
				'options': inputSystems.scripts()
			},
			'region': {
				'options': inputSystems.regions()
			},
		};
		
		$scope.currentInputSystemTag = '';
		$scope.currentInputSystem = {
			'name': '',
			'code': '',
			'abbreviation': '',
			'special': '',
			'purpose': '',
			'script': '',
			'region': '',
			'variant': ''
		};
		$scope.selectInputSystem = function(inputSystemTag) {
			$scope.currentInputSystemTag = inputSystemTag;
			$scope.currentInputSystem.name = $scope.lists.inputSystems[inputSystemTag].name;
			$scope.currentInputSystem.code = $scope.lists.inputSystems[inputSystemTag].code;
			$scope.currentInputSystem.abbreviation = $scope.lists.inputSystems[inputSystemTag].abbreviation;
			$scope.currentInputSystem = convertSelects($scope.currentInputSystem, $scope.lists.inputSystems[inputSystemTag]);
		};
		
		$scope.currentFieldId = '';
		$scope.currentField = {
			'hidden': ''
		};
		$scope.selectField = function(fieldId) {
			$scope.currentFieldId = fieldId;
		};
		
		$scope.queryProjectSettings = function() {
			lexService.projectSettings('', function(result) {	// TODO Add. $scope.project.id in place of '' when part of project IJH 2014-02
				if (result.ok) {
					$scope.languageCodes = inputSystems.languageCodes();
					$scope.config = result.data.config;
					$scope.lists.inputSystems = $scope.config.inputSystems;
					for (var tag in $scope.lists.inputSystems) {
						var code = inputSystems.getCode(tag);
						var script = inputSystems.getScript(tag);
						var region = inputSystems.getRegion(tag);
						var privateUse = inputSystems.getPrivateUse(tag);
						$scope.lists.inputSystems[tag].code = code;
						$scope.lists.inputSystems[tag].script = script;
						$scope.lists.inputSystems[tag].region = region;
						$scope.lists.inputSystems[tag].privateUse = privateUse;
						$scope.lists.inputSystems[tag].name = inputSystems.getName(code, script, region, privateUse);
					};
				}
			});
		};
		
		$scope.queryProjectSettings();
		$scope.editInputSystems = {};
		$scope.editInputSystems.collapsed = true;
		
		$scope.saveInputSystems = function() {
			$scope.editInputSystems.collapsed = true;
		};
		
		// convert raw config inputSystems to use in selectors
		var convertSelects = function(selectorInputSystem, inputSystem) {
			selectorInputSystem.purpose = $scope.selects.purpose.options[0];
			selectorInputSystem.script = '';
			selectorInputSystem.region = '';
			selectorInputSystem.variant = '';
			switch(inputSystem.script) {
				case '':
					selectorInputSystem.special = $scope.selects.special.options[0];
					break;
				case 'fonipa':
					selectorInputSystem.special = $scope.selects.special.options[1];
					switch(inputSystem.privateUse) {
						case 'etic':
							selectorInputSystem.purpose = $scope.selects.purpose.options[1];
							break;
						case 'emic':
							selectorInputSystem.purpose = $scope.selects.purpose.options[2];
							break;
					}
					break;
				case 'Zxxx':
					if (inputSystem.privateUse == 'audio') {
						selectorInputSystem.special = $scope.selects.special.options[2];
						break;
					}
				default:
					selectorInputSystem.special = $scope.selects.special.options[3];
					selectorInputSystem.script = $scope.selects.script.options[inputSystem.script];
					selectorInputSystem.region = $scope.selects.region.options[inputSystem.region];
					selectorInputSystem.variant = inputSystem.privateUse;
			}
			return selectorInputSystem;
		};
		// revert script selectors to use in raw config inputSystems script
		var revertSelectScript = function(selectorScript) {
			for (var script in  $scope.selects.script.options) {
				if ($scope.selects.script.options[script] == selectorScript) {
					break;
				}
			}
			return script;
		};
		// revert region selectors to use in raw config inputSystems region
		var revertSelectRegion = function(selectorRegion) {
			for (var region in  $scope.selects.region.options) {
				if ($scope.selects.region.options[region] == selectorRegion) {
					break;
				}
			}
			return region;
		};
		
		$scope.$watch('config.inputSystems', function(newValue) {
//			console.log("config input systems watch: ", newValue);
			if (newValue != undefined) {
				for (var tag in newValue) {
					$scope.currentInputSystemTag = tag;
					break;
				}
			}
		});
		$scope.$watchCollection('currentInputSystem', function(newValue) {
//			console.log("current input system watch: ", newValue);
			if (newValue != undefined) {
				$scope.currentInputSystemTag = $scope.currentInputSystem.code;
				switch(newValue.special) {
					case $scope.selects.special.options[1]:		// IPA transcription
						$scope.currentInputSystemTag += '-fonipa';
						switch(newValue.purpose) {
							case $scope.selects.purpose.options[1]:		// Etic (raw phonetic transcription)
								$scope.currentInputSystemTag += '-x-etic';
								break;
							case $scope.selects.purpose.options[2]:		// Emic (uses the phonology of the language)
								$scope.currentInputSystemTag += '-x-emic';
								break;
						}
						break;
					case $scope.selects.special.options[2]:		// Voice
						$scope.currentInputSystemTag += '-Zxxx-x-audio';
						break;
					case $scope.selects.special.options[3]:		// Script / Region / Variant
						var script = revertSelectScript($scope.currentInputSystem.script);
						var region = revertSelectRegion($scope.currentInputSystem.region);
						$scope.currentInputSystemTag += (script) ? '-' + script : '';
						$scope.currentInputSystemTag += (region) ? '-' + region : '';
						$scope.currentInputSystemTag += ($scope.currentInputSystem.variant) ? '-x-' + $scope.currentInputSystem.variant : '';
						break;
				}
			}
		});
	
	}])
	;
