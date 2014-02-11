'use strict';

function dbeCtrl($scope, userService, sessionService, lexService, $window, $timeout) {
	
	// see http://alistapart.com/article/expanding-text-areas-made-elegant
	// for an idea on expanding text areas
	
	
 
	
	/* this is what an entry looks like
	$scope.currentEntry = {
		'id': '1234',
		'lexeme': { 'en': '', 'th': '' },
		'senses': [
		    {
				'meaning': { 'en': '', 'th': '' },
		    }
		]
	};
	*/
	var projectId = 'blah';
	var pristineEntry = {};
	var lastSavedDate = new Date();
	var saveTimer;
	$scope.currentEntry = {};
	$scope.entries = [];
	$scope.config = {};
	
	// for debugging
	$scope.serverEntries = lexService.serverEntries;
	$scope.dirtyEntries = lexService.dirtyEntries;
	
	$scope.currentEntryIsDirty = function() {
		if ($scope.entryLoaded()) {
			return !angular.equals($scope.currentEntry, pristineEntry);
		}
		return false;
	};
	
	$scope.canSave = function() {
		return $scope.currentEntryIsDirty() || lexService.canSave();
	};
	
	$scope.saveButtonTitle = function() {
		if ($scope.canSave()) {
			return "Save Now";
		} else {
			return "Saved " + moment(lastSavedDate).fromNow();
			//return "All Changes Saved";
		}
	};

	//$timeout($scope.saveButtonTitle,60000);
	//TODO set a watch on currentEntry
	// when currentEntry changes, if it can be saved, then
	// set a new 30 second timer, and delete the old timer
	// when timer goes off, execute the save now method and delete the timer
	
	$scope.saveNow = function() {
		lastSavedDate = new Date();
		$scope.saveCurrentEntry();
		lexService.saveNow();
		$scope.getPageDto(function() {
			$scope.editEntry($scope.currentEntry.id);
		});
	};
	
	$scope.updateListWithEntry = function(entry) {
		var isNew = true;
		for (var i=0; i<$scope.entries.length; i++) {
			var e = $scope.entries[i];
			if (e.id == entry.id) {
				$scope.entries[i].title = $scope.entryTitle(entry);
				isNew = false;
				break;
			}
		}
		if (isNew) {
			$scope.entries.unshift({id:entry.id, title:$scope.entryTitle(entry)});
		}
	};
	
	$scope.setCurrentEntry = function(entry) {
		entry = entry || {};
		$scope.currentEntry = angular.copy(entry);
		pristineEntry = angular.copy(entry);
	};
	
	$scope.saveCurrentEntry = function() {
		if ($scope.entryLoaded() && $scope.currentEntryIsDirty()) {
			lexService.update(projectId, $scope.currentEntry, function(result) {
				$scope.updateListWithEntry(result.data);
				$scope.setCurrentEntry(result.data);
			});
		}
	};
	
	$scope.editEntry = function(id) {
		$scope.saveCurrentEntry();

		if (arguments.length == 0) {
			// create new entry
			lexService.update(projectId, {id:''}, function(result) {
				$scope.updateListWithEntry(result.data);
				$scope.setCurrentEntry(result.data);
			});
		} else {
			// load existing entry
			lexService.read(projectId, id, function(result) {
				$scope.setCurrentEntry(result.data);
			});
		}
	};

	$scope.newEntry = function() {
		$scope.editEntry();
	};
	
	$scope.entryTitle = function(entry) {
		entry = entry || $scope.currentEntry;
		var title = "[new word]";
		if (entry.lexeme && $scope.config && $scope.config.entry) {
			var lexemeWritingSystem = $scope.config.entry.definitions.lexeme.writingsystems[0];
			if (entry.lexeme[lexemeWritingSystem]) {
				title = entry.lexeme[lexemeWritingSystem];
			}
		}
		return title;
	};

	$scope.entryLoaded = function() {
		return $scope.currentEntry.hasOwnProperty('id');
	};
	
	$scope.deleteEntry = function(entry) {
		if ($window.confirm("Are you sure you want to delete '" + $scope.entryTitle(entry) + "'?")) {
			$scope.entries.splice($scope.getEntryIndexById(entry.id), 1);
			lexService.remove(projectId, entry.id, function(){});
			$scope.setCurrentEntry({});
		}
	};
	
	$scope.getEntryIndexById = function(id) {
		var index = undefined;
		for (var i=0; i<$scope.entries.length; i++) {
			var e = $scope.entries[i];
			if (e.id == id) {
				index = i;
				break;
			}
		}
		return index;
	};
	
	$scope.getPageDto = function(callback) {
		lexService.getPageDto(projectId, function(result) {
			$scope.entries = result.data.entries;
			$scope.config = result.data.config;
			(callback || angular.noop)();
		});
	};

	// run this when the page loads
	$scope.getPageDto();
	
}


angular.module('dbe', ['jsonRpc', 'ui.bootstrap', 'lf.services', 'palaso.ui.dc.entry', 'ngAnimate']).
controller('dbeCtrl', ['$scope', 'userService', 'sessionService', 'lexEntryService', '$window', '$timeout', dbeCtrl])
;
