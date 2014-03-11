'use strict';

angular.module('dbe', ['jsonRpc', 'ui.bootstrap', 'bellows.services', 'palaso.ui.dc.entry', 'palaso.ui.dc.comments', 'ngAnimate'])
.controller('editCtrl', ['$scope', 'userService', 'sessionService', 'lexEntryService', '$window', '$timeout', '$filter', 
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
	
	var pristineEntry = {};
	$scope.lastSavedDate = new Date();
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
		return $scope.currentEntryIsDirty();
	};
	
	$scope.saveButtonTitle = function() {
		if ($scope.canSave()) {
			return "Save Now";
		} else {
			return "Saved " + moment($scope.lastSavedDate).fromNow();
		}
	};

	//$timeout($scope.saveButtonTitle,60000);
	//TODO set a watch on currentEntry
	// when currentEntry changes, if it can be saved, then
	// set a new 30 second timer, and delete the old timer
	// when timer goes off, execute the save now method and delete the timer
	
	$scope.saveNow = function() {
		if ($scope.canSave()) {
			lexService.update($scope.currentEntry, function(result) {
				$scope.updateListWithEntry(result.data);
				$scope.setCurrentEntry(result.data);
				$scope.lastSavedDate = new Date();
				$scope.refreshView();
			});
		}
	};
	
	$scope.updateListWithEntry = function(entry) {
		var isNew = true;
		for (var i=0; i<$scope.entries.length; i++) {
			var e = $scope.entries[i];
			if (e.id == entry.id) {
				$scope.entries[i] = entry;
				isNew = false;
				break;
			}
		}
		if (isNew) {
			$scope.entries.unshift(entry);
		}
	};
	
	$scope.getMeaning = function(entry) {
		var meaning = '';
		if (angular.isDefined($scope.config.entry) && angular.isDefined(entry.definition)) {
			var ws = $scope.config.entry.senses.definition.inputSystems[0];
			if (angular.isDefined(entry.definition[ws])) {
				meaning = entry.definition[ws].value;
			}
		}
		return meaning;
	};
	
	$scope.setCurrentEntry = function(entry) {
		entry = entry || {};
		$scope.currentEntry = angular.copy(entry);
		pristineEntry = angular.copy(entry);
	};
	
	$scope.editEntry = function(id) {
		$scope.saveNow();

		if (arguments.length == 0) {
			$scope.setCurrentEntry({id:''});
		} else {
			lexService.read(id, function(result) {
				$scope.setCurrentEntry(result.data);
			});
		}
	};

	$scope.newEntry = function() {
		$scope.editEntry();
	};
	
	$scope.getTitle = function(entry) {
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
			lexService.remove(entry.id, function(){});
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
	
	$scope.refreshView = function(updateFirstEntry) {
		updateFirstEntry = typeof updateFirstEntry !== 'undefined' ? updateFirstEntry : false;
		var gotDto = function (result) {
			if (result.ok) {
				$scope.config = result.data.config;
				$scope.entries = result.data.entries;
				if (updateFirstEntry) {
					$scope.setCurrentEntry(result.data.firstEntry);
				}
			}
		};
		var view = 'dbe';
		switch (view) {
			case 'dbe':
				lexService.dbeDto(gotDto);
				break;
			case 'add-grammar':
				break;
			case 'add-examples':
				break;
			case 'add-meanings':
				break;
			case 'add-pos':
				break;
		}
	};
	
	$scope.refreshView(true);
	
	
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
	};

	// When comments tab is clicked, set up new config for its interior
	$scope.selectCommentsTab = function() {
		if (angular.isDefined($scope.config.entry)) {
			$scope.recursiveSetConfig($scope.config.entry, 'commentsVisible', true);
		}
	};
	$scope.deselectCommentsTab = function() {
		if (angular.isDefined($scope.config.entry)) {
			$scope.recursiveSetConfig($scope.config.entry, 'commentsVisible', false);
		}
	};
}])
;
