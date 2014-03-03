'use strict';

angular.module('dbe', ['jsonRpc', 'ui.bootstrap', 'bellows.services', 'palaso.ui.dc.entry', 'palaso.ui.dc.comments', 'ngAnimate'])
.controller('dbeCtrl', ['$scope', 'userService', 'sessionService', 'lexEntryService', '$window', '$timeout', '$filter', 
                        function ($scope, userService, sessionService, lexService, $window, $timeout, $filter) {
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
	
	var projectId = $scope.routeParams.projectId;
	$scope.project = {
		'id': projectId
	};
		
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
			$scope.entries.unshift({id:entry.id, title:$scope.entryTitle(entry), entry:entry});
		}
	};
	
	$scope.getMeaning = function(entry) {
		// Default to English; second default is the first meaning found that's not blank
		var meaning = entry.senses[0].definition['en']; // Might be undefined
		// TODO: Default should be "primary analysis language", whatever that is defined in the config. (Currently there's nowhere in the config to define that).
		for (var lang in entry.senses[0].definition) {
			if (!meaning) { meaning = entry.senses[0].definition[lang]; };
		};
		if (!meaning) { meaning = {value: "[No definition]"}; }
		return meaning.value;
	};
	
	$scope.setCurrentEntry = function(entry) {
		entry = entry || {};
		$scope.currentEntry = angular.copy(entry);
		pristineEntry = angular.copy(entry);
	};
	
	$scope.saveCurrentEntry = function() {
		if ($scope.entryLoaded() && $scope.currentEntryIsDirty()) {
			lexService.update($scope.project.id, $scope.currentEntry, function(result) {
				$scope.updateListWithEntry(result.data);
				$scope.setCurrentEntry(result.data);
			});
		}
	};
	
	$scope.editEntry = function(id) {
		$scope.saveCurrentEntry();

		if (arguments.length == 0) {
			// create new entry
			lexService.update($scope.project.id, {id:''}, function(result) {
				$scope.updateListWithEntry(result.data);
				$scope.setCurrentEntry(result.data);
			});
		} else {
			// load existing entry
			lexService.read($scope.project.id, id, function(result) {
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
			var lexemeInputSystem = $scope.config.entry.fields.lexeme.inputSystems[0];
			if (entry.lexeme[lexemeInputSystem]) {
				title = entry.lexeme[lexemeInputSystem].value;
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
			lexService.remove($scope.project.id, entry.id, function(){});
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
		lexService.dbeDto($scope.project.id, function(result) {
			if (result.ok) {
				$scope.entries = result.data.entries;
				// $scope.config = result.data.config; // When retrieving config from JSON, we can do this.
				$scope.config = angular.copy(result.data.config); // When retrieving config from mock service, we need to do this
				// select the first entry
				$scope.currentEntry.id = $filter('orderAsArray')($scope.entries, 'id')[0]['id'];
			}
		});
	};

	// run this when the page loads
	$scope.getPageDto();

	$scope.recursiveSetConfig = function(startAt, propName, propValue) {
		// Go through the config tree starting at the startAt field, and
		// set a given property to a given value in all fields below startAt.
		angular.forEach(startAt.fieldOrder, function(fieldName) {
			var field = startAt.fields[fieldName];
			if (angular.isUndefined(field)) { return; }
			if (field.type == "fields") {
				$scope.recursiveSetConfig(field, propName, propValue);
			} else {
				field[propName] = propValue;
			};
		});
	}

	// When comments tab is clicked, set up new config for its interior
	$scope.selectCommentsTab = function() {
		$scope.recursiveSetConfig($scope.config.entry, 'commentsVisible', true);
	};
	$scope.deselectCommentsTab = function() {
		$scope.recursiveSetConfig($scope.config.entry, 'commentsVisible', false);
	};
}])
;
