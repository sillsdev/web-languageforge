'use strict';

angular.module(
		'settings', 
		['jsonRpc', 'ui.bootstrap', 'sf.services', 'palaso.ui.dc.entry', 'ngAnimate']
	)
	.controller('SettingsCtrl', ['$scope', 'userService', 'sessionService', 'lexEntryService', '$window', '$timeout', 
	                                 function($scope, userService, ss, lexService, $window, $timeout) {

		$scope.config = {};
		$scope.languageCodes = {};
		
		$scope.currentInputSystemTag = '';
		$scope.currentInputSystem = {};
		$scope.currentInputSystem.code = '';
		$scope.currentInputSystem.abbreviation = '';
		$scope.currentInputSystem.special = '';
		$scope.currentInputSystem.purpose = '';
		$scope.currentInputSystem.script = '';
		$scope.currentInputSystem.region = '';
		$scope.currentInputSystem.variant = '';
		$scope.selectInputSystem = function(inputSystemTag) {
			$scope.currentInputSystem.abbreviation = inputSystemTag;		// TODO add. fiddle until load current input system is done IJH 2014-02
			$scope.currentInputSystem.code = inputSystemTag;
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
					$scope.config = result.data.config;
					$scope.languageCodes = inputSystems.langaugeCodes();
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
