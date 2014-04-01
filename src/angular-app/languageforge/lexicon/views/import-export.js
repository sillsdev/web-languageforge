'use strict';

angular.module('lexicon.import-export', ['ui.bootstrap', 'bellows.services', 'palaso.ui.notice', 'palaso.ui.language', 'ngAnimate', 'angularFileUpload', 'lexicon.upload'])
.controller('LiftImportCtrl', ['$scope', 'silNoticeService', 'fileReader', 'lexProjectService', 'lexBaseViewService', 
                               function($scope, notice, fileReader, lexProjectService, baseViewService) {
	lexProjectService.baseViewDto('importExport', 'Import/export', function(result) {
		if (result.ok) {
			baseViewService.setData(result.data);
		}
	});
	
	$scope.mergeRule = 'createDuplicates';
	$scope.skipSameModTime = true;
	$scope.deleteMatchingEntry = false;

	$scope.onFileSelect = function($files) {
		$scope.file = $files[0];	// take the first file only
		fileReader.readAsDataUrl($scope.file, $scope)
		.then(function(result) {
			$scope.file.data = result;
		});
	};
	
	$scope.importLift = function() {
		var importData = {
			file: $scope.file,
			settings: {
				mergeRule: $scope.mergeRule,
				skipSameModTime: $scope.skipSameModTime,
				deleteMatchingEntry: $scope.deleteMatchingEntry,
			},
		};
		lexProjectService.importLift(importData, function(result) {
			if (result.ok) {
				notice.push(notice.SUCCESS, "LIFT import completed successfully");
			}
		});
	};

}])
.controller('LiftExportCtrl', ['$scope', 'userService', 'sessionService', 'silNoticeService', 
                               function($scope, userService, ss, notice) {
	
}])
;
