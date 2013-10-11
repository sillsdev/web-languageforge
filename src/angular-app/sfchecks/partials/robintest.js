'use strict';

angular.module(
		'sfchecks.robintest',
		[ 'sf.services', 'palaso.ui.listview', 'palaso.ui.jqte', 'ui.bootstrap', 'palaso.ui.selection', 'palaso.ui.notice' ]
	)
	.controller('RobinTestCtrl', ['$scope', '$routeParams', 'questionService', 'sessionService', 'breadcrumbService', 'silNoticeService',
	                              function($scope, $routeParams, questionService, ss, breadcrumbService, notice) {
		console.log("Testing tag layout");
		$scope.tags = ["First", "Second", "Third", "Fourth"];

		$scope.addTag = function(tag) {
			$scope.tags.push(tag);
		}
		$scope.addTag("DEBUG: And another one");

		$scope.removeTag = function(tagIndex) {
			$scope.tags.splice(tagIndex, 1);
		}

		$scope.inputtaglist = [];
		$scope.$watch('inputtags', function(tagstring) {
			// This isn't useful yet -- we could be doing the string.split()
			// when the user submits the new set of tags -- but when we start
			// working on the typeahead feature, this watch will come in handy.
			if (tagstring) {
				var tags = tagstring.split(',');
				for (var i=0; i < tags.length; i++) {
					tags[i] = tags[i].trim();
					// Guard against empty-string tags (i.e., "")
					if (!tags[i]) {
						tags.splice(i, 1);
						i--; // Stay on this index for next loop iteration
					}
				}
				$scope.inputtaglist = tags;
			}
		});
		$scope.submitTags = function() {
			console.log('Old tag list:', $scope.tags);
			console.log('User entered the following tags:', $scope.inputtaglist);
			$scope.tags = $scope.mergeArrays($scope.tags, $scope.inputtaglist);
			console.log('New tag list:', $scope.tags);
		}

		$scope.mergeArrays = function(a, b) {
			// See mergeStringArrays from http://stackoverflow.com/questions/1584370/how-to-merge-two-arrays-in-javascript
			var set = {};
			var result = [];

			// Can't count on forEach being available; loop the manual way
			for (var i=0; i < a.length; i++) {
				var item = a[i];
				if (!set[item]) { // O(1) lookup
					set[item] = true;
					result.push(item);
				}
			}
			for (var i=0; i < b.length; i++) {
				var item = b[i];
				if (!set[item]) { // O(1) lookup
					set[item] = true;
					result.push(item);
				}
			}
			return result;
		}
	}])
	;
