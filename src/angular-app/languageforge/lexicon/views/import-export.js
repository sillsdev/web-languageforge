'use strict';

angular.module('lexicon.importExport', ['ui.bootstrap', 'bellows.services', 'palaso.ui.notice', 'palaso.ui.language', 'ngAnimate', 'angularFileUpload', 'lexicon.upload'])
.controller('LiftImportCtrl', ['$scope', 'breadcrumbService', 'lexLinkService', 'userService', 'sessionService', 'silNoticeService', 'fileReader', 'lexProjectService', 
                               function($scope, breadcrumbService, linkService, userService, ss, notice, fileReader, lexProjectService) {
	$scope.project = {};
	$scope.project.projectname = breadcrumbService.get('top')[1]['label'];	// TODO Fix. doesn't work on a page refresh, very page needs to pull a minimal dto for config ad projectname. IJH 2014-03
	breadcrumbService.set('top',
		[
		 {href: '/app/projects', label: 'My Projects'},
		 {href: linkService.project(), label: $scope.project.projectname},
		 {href: linkService.projectView('importExport'), label: 'Import/Export'},
		]
	);
	
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
