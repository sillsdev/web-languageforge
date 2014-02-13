'use strict';

function grammarCtrl($scope, userService, sessionService, lexService, $window, $timeout) {
	var projectId = 'sampleProject';
	$scope.items = [];
	$scope.visibleEntries = [];
	$scope.config = {};
	$scope.pageData = {};
	$scope.pageData.currentEntry = {};

	$scope.getPageDto = function(callback) {
		lexService.getPageDto(projectId, function(result) {
			$scope.items = result.data.entries;  // Items is a list of {id: 3, title: "foo", entry: (full entry)} objects
			// $scope.config = result.data.config; // Can't just do this because we need to modify our local copy
			$scope.config = angular.copy(result.data.config);
			// We just want to see the definition and part of speech, but leave rest of config alone
			$scope.config.entry.fields.senses.fieldNames = ['definition', 'partOfSpeech'];
			// Definition should be read-only
			$scope.config.entry.fields.senses.fields.definition.readonly = true; // Not yet implemented, but soon
			(callback || angular.noop)();
		});
	};

	$scope.entryTitle = function(entry) {
		entry = entry || $scope.pageData.currentEntry;
		var title = "[new word]";
		if (entry.lexeme && $scope.config && $scope.config.entry) {
			var lexemeWritingSystem = $scope.config.entry.fields.lexeme.writingsystems[0];
			if (entry.lexeme[lexemeWritingSystem]) {
				title = entry.lexeme[lexemeWritingSystem];
			}
		}
		return title;
	};

	$scope.getEntryName = function(item) {
		if (item.hasOwnProperty('title')) {
			return item.title;
		} else {
			return $scope.entryTitle(item.entry);
		};
	};
	
	$scope.itemIsSelected = function(item) {
		return ($scope.pageData.currentEntry.id == item.id);
	};

	$scope.selectEntry = function(entry) {
		$scope.pageData.currentEntry  = angular.copy(entry);
		$scope.pageData.pristineEntry = angular.copy(entry);
	};

	$scope.selectItem = function(item) {
		$scope.selectEntry(item.entry);
	};

	$scope.entryLoaded = function() {
		return $scope.pageData.currentEntry.hasOwnProperty('id');
	};

	$scope.currentEntryIsDirty = function() {
		if ($scope.entryLoaded()) {
			return !angular.equals($scope.pageData.currentEntry, $scope.pageData.pristineEntry);
		}
		return false;
	};

	$scope.getItemIndexById = function(id) {
		var index = undefined;
		for (var i=0; i<$scope.items.length; i++) {
			var item = $scope.items[i];
			if (item.id == id) {
				index = i;
				break;
			}
		}
		return index;
	};

	$scope.constrainIndex = function(index) {
		var length = $scope.items.length;
		if (index < 0) {
			return 0;
		} else if (index >= length){
			return length-1;
		} else {
			return index;
		}
	};

	$scope.prevItem = function(entry) {
		entry = entry || $scope.pageData.currentEntry;
		var index = $scope.getItemIndexById(entry.id);
		return $scope.items[$scope.constrainIndex(index-1)];
	};

	$scope.nextItem = function(entry) {
		entry = entry || $scope.pageData.currentEntry;
		var index = $scope.getItemIndexById(entry.id);
		return $scope.items[$scope.constrainIndex(index+1)];
	};

	$scope.updateListWithEntry = function(entry) {
		var index = $scope.getItemIndexById(entry.id);
		if (angular.isUndefined(index)) {
			// New items go to start of list
			$scope.entries.unshift({id:entry.id, title:$scope.entryTitle(entry), entry:entry});
		} else {
			$scope.items[index].title = $scope.entryTitle(entry);
			$scope.items[index].entry = entry;
		}
	};

	$scope.saveEntry = function() {
		if ($scope.entryLoaded() && $scope.currentEntryIsDirty()) {
			lexService.update(projectId, $scope.pageData.currentEntry, function(result) {
				$scope.updateListWithEntry(result.data);
				$scope.selectEntry(result.data);
			});
		};
	}

	// run this when the page loads
	$scope.getPageDto();
	
};

angular.module('meaning', ['jsonRpc', 'ui.bootstrap', 'sf.services', 'palaso.ui.dc.entry', 'palaso.ui.listview', 'ngAnimate']).
controller('grammarCtrl', ['$scope', 'userService', 'sessionService', 'lexEntryService', '$window', '$timeout', grammarCtrl])
;
