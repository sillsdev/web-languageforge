'use strict';

angular.module(
		'settings', 
		['jsonRpc', 'ui.bootstrap', 'sf.services', 'palaso.ui.dc.entry', 'ngAnimate']
	)
	.controller('SettingsCtrl', ['$scope', 'userService', 'sessionService', 'lexEntryService', '$window', '$timeout', 
	                                 function($scope, userService, ss, lexService, $window, $timeout) {

		$scope.currentWritingSystemTag = '';
		$scope.currentWritingSystem = {};
		$scope.currentWritingSystem.id = '';
		$scope.currentWritingSystem.abbreviation = '';
		$scope.currentWritingSystem.special = '';
		$scope.currentWritingSystem.purpose = '';
		$scope.currentWritingSystem.script = '';
		$scope.currentWritingSystem.region = '';
		$scope.currentWritingSystem.variant = '';
		$scope.selectWritingSystem = function(writingSystemId) {
			$scope.currentWritingSystem.abbreviation = writingSystemId;		// TODO add. fiddle until load current writing system is done IJH 2014-02
			$scope.currentWritingSystem.id = writingSystemId;
		};
		
		$scope.currentField = {};
		$scope.currentField.hidden = '';
		$scope.currentFieldId = '';
		$scope.selectField = function(fieldId) {
			$scope.currentFieldId = fieldId;
		};
		
		$scope.querySettings = function() {
			$scope.config = lexService.projectSettings();
		};
		
		$scope.querySettings();
		$scope.editWritingSystems = {};
		$scope.editWritingSystems.collapsed = true;
		
		$scope.saveWritingSystems = function() {
			$scope.editWritingSystems.collapsed = true;
		};
		
		$scope.$watch('config.writingsystems', function(newValue) {
//			console.log("config writing systems watch: ", newValue);
			if (newValue != undefined) {
				for (var key in newValue.map) {
					$scope.currentWritingSystem.id = key;
					break;
				}
			}
		});
		$scope.$watchCollection('currentWritingSystem', function(newValue) {
//			console.log("current writing system watch: ", newValue);
			if (newValue != undefined) {
				$scope.currentWritingSystemTag = $scope.currentWritingSystem.id;
				switch(newValue.special) {
					case 'IPA transcription':
						$scope.currentWritingSystemTag += '-fonipa';
						switch(newValue.purpose) {
							case 'Etic (raw phonetic transcription)':
								$scope.currentWritingSystemTag += '-x-etic';
								break;
							case 'Emic (uses the phonology of the language)':
								$scope.currentWritingSystemTag += '-x-emic';
								break;
						}
						break;
					case 'Voice':
						$scope.currentWritingSystemTag += '-Zxxx-x-audio';
						break;
					case 'Script / Region / Variant':
						$scope.currentWritingSystemTag += ($scope.currentWritingSystem.script) ? '-' + $scope.currentWritingSystem.script : '';
						$scope.currentWritingSystemTag += ($scope.currentWritingSystem.region) ? '-' + $scope.currentWritingSystem.region : '';
						$scope.currentWritingSystemTag += ($scope.currentWritingSystem.variant) ? '-x-' + $scope.currentWritingSystem.variant : '';
						break;
				}
			}
		});
	
	}])
	;
