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
		};
		
		$scope.currentField = {};
		$scope.currentField.hidden = '';
		$scope.currentFieldId = '';
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
						var code = inputSystems.code(tag);
						var script = inputSystems.script(tag);
						var region = inputSystems.region(tag);
						var privateUse = inputSystems.privateUse(tag);
						$scope.lists.inputSystems[tag].code = code;
						$scope.lists.inputSystems[tag].script = script;
						$scope.lists.inputSystems[tag].region = region;
						$scope.lists.inputSystems[tag].privateUse = privateUse;
						$scope.lists.inputSystems[tag].name = inputSystems.name(code, script, region, privateUse);
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
		
		$scope.$watch('config.inputSystems', function(newValue) {
//			console.log("config input systems watch: ", newValue);
			if (newValue != undefined) {
				for (var key in newValue.map) {
					$scope.currentInputSystem.code = key;
					break;
				}
			}
		});
		$scope.$watchCollection('currentInputSystem', function(newValue) {
//			console.log("current input system watch: ", newValue);
			if (newValue != undefined) {
				$scope.currentInputSystemTag = $scope.currentInputSystem.code;
				switch(newValue.special) {
					case 'IPA transcription':
						$scope.currentInputSystemTag += '-fonipa';
						switch(newValue.purpose) {
							case 'Etic (raw phonetic transcription)':
								$scope.currentInputSystemTag += '-x-etic';
								break;
							case 'Emic (uses the phonology of the language)':
								$scope.currentInputSystemTag += '-x-emic';
								break;
						}
						break;
					case 'Voice':
						$scope.currentInputSystemTag += '-Zxxx-x-audio';
						break;
					case 'Script / Region / Variant':
						$scope.currentInputSystemTag += ($scope.currentInputSystem.script) ? '-' + $scope.currentInputSystem.script : '';
						$scope.currentInputSystemTag += ($scope.currentInputSystem.region) ? '-' + $scope.currentInputSystem.region : '';
						$scope.currentInputSystemTag += ($scope.currentInputSystem.variant) ? '-x-' + $scope.currentInputSystem.variant : '';
						break;
				}
			}
		});
	
	}])
	;
