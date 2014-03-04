'use strict';

angular.module('lexicon.importExport', ['ui.bootstrap', 'bellows.services', 'palaso.ui.notice', 'palaso.ui.language', 'ngAnimate', 'angularFileUpload'])
.controller('ImportExportCtrl', ['$scope', 'userService', 'sessionService', 'silNoticeService', 'lexProjectService', '$filter', '$modal', 
                             function($scope, userService, ss, notice, lexService, $filter, $modal) {
	
}])
.controller('LiftImportCtrl', ['$scope', 'userService', 'sessionService', 'silNoticeService', '$http',
                                 function($scope, userService, ss, notice, $http) {
	$scope.mergeWithExisting = true;
	
	$scope.progress = 0;
	$scope.uploadResult = '';
	$scope.onFileSelect = function($files) {
		var file = $files[0];	// take the first file only
		$scope.file = file;
		if (file['size'] <= ss.fileSizeMax()) {
			$http.uploadFile({
			    url: '/upload',	// upload.php script
//				headers: {'myHeaderKey': 'myHeaderVal'},
				data: {
					projectId: projectId,
					textId: textId,
				},
				file: file
			}).progress(function(evt) {
				$scope.progress = parseInt(100.0 * evt.loaded / evt.total);
				if (!$scope.$$phase) {
					$scope.$apply();
				}
			}).success(function(data, status, headers, config) {
				$scope.uploadResult = data.toString();
				$scope.progress = 100.0;
				// to fix IE not updating the dom
				if (!$scope.$$phase) {
					$scope.$apply();
				}
			});
		} else {
			$scope.uploadResult = file['name'] + " is too large.";
		}
	};
	
	$scope.updateImport = function() {
		console.log("updateImport");
	};

}])
.controller('LiftExportCtrl', ['$scope', 'userService', 'sessionService', 'silNoticeService', 
                                 function($scope, userService, ss, notice) {
	
}])
;
