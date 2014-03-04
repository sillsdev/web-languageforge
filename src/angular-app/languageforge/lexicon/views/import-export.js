'use strict';

angular.module('lexicon.importExport', ['ui.bootstrap', 'bellows.services', 'palaso.ui.notice', 'palaso.ui.language', 'ngAnimate', 'angularFileUpload'])
.controller('ImportExportCtrl', ['$scope', 'userService', 'sessionService', 'silNoticeService', 'lexProjectService', '$filter', '$modal', 
                             function($scope, userService, ss, notice, lexService, $filter, $modal) {
	
}])
.controller('LiftImportCtrl', ['$scope', 'userService', 'sessionService', 'silNoticeService', '$http',
                                 function($scope, userService, ss, notice, $http) {
	$scope.mergeWithExisting = true;

	$scope.onFileSelect = function($files) {
		$scope.file = $files[0];	// take the first file only
		
	};
	
	$scope.importLift = function() {
		console.log("importLift");
	};

}])
.controller('LiftExportCtrl', ['$scope', 'userService', 'sessionService', 'silNoticeService', 
                                 function($scope, userService, ss, notice) {
	
}])
;
