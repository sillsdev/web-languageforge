'use strict';

angular.module('lexicon.importExport', ['ui.bootstrap', 'bellows.services', 'palaso.ui.notice', 'palaso.ui.language', 'ngAnimate', 'angularFileUpload', 'lexicon.upload'])
.controller('LiftImportCtrl', ['$scope', 'userService', 'sessionService', 'silNoticeService', 'fileReader', 'lexProjectService', 
                               function($scope, userService, ss, notice, fileReader, lexProjectService) {
	$scope.duplicates = 'createDuplicates';
	$scope.skipSameModTime = true;
	
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
				duplicates: $scope.duplicates,
				skipSameModTime: $scope.skipSameModTime,
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
