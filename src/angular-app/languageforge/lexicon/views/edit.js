'use strict';

angular.module('dbe', ['jsonRpc', 'ui.bootstrap', 'bellows.services', 'palaso.ui.dc.entry', 'palaso.ui.dc.comments', 'ngAnimate', 'truncate', 'lexicon.services', 'palaso.ui.scroll'])
.controller('editCtrl', ['$scope', 'userService', 'sessionService', 'lexEntryService', 'lexConfigService', '$window', '$modal', '$interval', '$filter', 'lexLinkService', 
                        function ($scope, userService, sessionService, lexService, configService, $window, $modal, $interval, $filter, linkService) {
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
	
	$scope.currentEntryIsDirty = function() {
		if ($scope.entryLoaded()) {
			return !angular.equals($scope.currentEntry, pristineEntry);
		}
		return false;
	};
	
	var saving = false;
	var saved = false;
	$scope.saveNotice = function() {
		if ($scope.currentEntryIsDirty()) {
			if (saving) {
				return "Saving";
			}
		} else {
			if (saved) {
				return "Saved";
			}
		}
		return "";
	};

	$scope.saveCurrentEntry = function(successCallback, failCallback) {
		if ($scope.currentEntryIsDirty()) {
			cancelAutoSaveTimer();
			saving = true;
			lexService.update($scope.prepEntryForUpdate($scope.currentEntry), function(result) {
				if (result.ok) {
					$scope.updateListWithEntry(result.data);
					if ($scope.currentEntry.id != '') { // new word button pressed - don't set current entry
						$scope.setCurrentEntry(result.data);
					}
					$scope.lastSavedDate = new Date();
					$scope.refreshView($scope.load.iEntryStart, $scope.load.numberOfEntries);
					saved = true;
					(successCallback||angular.noop)();
				} else {
					(failCallback||angular.noop)();
				}
				saving = false;
			});
		}
	};
	
	$scope.prepEntryForUpdate = function(entry) {
		return $scope.recursiveRemoveProperties(entry, ['guid', 'mercurialSha', 'authorInfo', 'comments', 'dateCreated', 'dateModified', 'liftId', '$$hashKey']);
	};
	
	$scope.updateListWithEntry = function(entry) {
		var isNew = true;
		var toInsert = {id: entry.id, lexeme: $scope.getTitle(entry), definition: $scope.getMeaning(entry)};
		for (var i=0; i<$scope.show.entries.length; i++) {
			var e = $scope.show.entries[i];
			if (e.id == entry.id) {
				$scope.show.entries[i] = toInsert;
				$scope.entries[i] = toInsert;
				isNew = false;
				break;
			}
		}
		if (isNew) {
			$scope.show.entries.unshift(toInsert);
			$scope.entries.unshift(toInsert);
		}
	};
	
	$scope.getEntryIndexById = function(id) {
		var index = undefined;
		for (var i=0; i<$scope.show.entries.length; i++) {
			var e = $scope.show.entries[i];
			if (e.id == id) {
				index = i;
				break;
			}
		}
		return index;
	};
	
	$scope.getMeaning = function(entry) {
		var meaning = '';
		if (entry.definition) {
			meaning = entry.definition;
		} else if (entry.gloss) {
			meaning = entry.gloss;
		} 
		return meaning;
	};
	
	$scope.setCurrentEntry = function(entry) {
		entry = entry || {};
		$scope.currentEntry = entry;
		pristineEntry = angular.copy(entry);
		saved = false;
	};
	
	$scope.editEntry = function(id) {
		if (angular.isUndefined(id) || $scope.currentEntry.id != id) {
			$scope.saveCurrentEntry();
			if (angular.isUndefined(id)) {
				var newEntry = {id:''};
				$scope.setCurrentEntry(newEntry);
				$scope.selectEditTab();
				$scope.updateListWithEntry(newEntry);
			} else {
				lexService.read(id, function(result) {
					$scope.setCurrentEntry(result.data);
				});
			}
		}
	};

	$scope.newEntry = function() {
		$scope.editTab.active = true;
		$scope.editEntry();
		$scope.entriesTotalCount++;
	};
	
	$scope.getTitle = function(entry) {
		entry = entry || $scope.currentEntry;
		var title = "[empty]";
		if (entry.lexeme) {
			title = entry.lexeme;
		}
		return title;
	};

	$scope.entryLoaded = function() {
		return angular.isDefined($scope.currentEntry.id);
	};
	
	$scope.deleteEntry = function(entry) {
		if ($window.confirm("Are you sure you want to delete '" + $scope.getTitle(entry) + "'?")) {
			if ($scope.entryHasComments(entry)) {
				if ($window.confirm("Are you sure you want to delete '" + $scope.getTitle(entry) + "'?")) {
					var entryIndex = $scope.getEntryIndexById(entry.id);
					$scope.show.entries.splice(entryIndex, 1);
					$scope.entries.splice(entryIndex, 1);
					$scope.entriesTotalCount--;
					if (entry.id != '') {
						lexService.remove(entry.id, function(){});
					}
					$scope.setCurrentEntry({});
				}
			} else {
				var entryIndex = $scope.getEntryIndexById(entry.id);
				$scope.show.entries.splice(entryIndex, 1);
				$scope.entries.splice(entryIndex, 1);
				$scope.entriesTotalCount--;
				if (entry.id != '') {
					lexService.remove(entry.id, function(){});
				}
				$scope.setCurrentEntry({});
			}
		}
	};
	
	$scope.entryHasComments = function(entry) {
		return false;
	};
	
	$scope.load = {
		iEntryStart: 0,
		numberOfEntries: null	// use null to grab all data from iEntryStart onwards
	}; 
	$scope.show = {
		iEntryStart: 0,
		numberOfEntries: 50,
		entries: [],
	}; 
	$scope.show.initial = function() {
		$scope.show.iEntryStart = 0;
		$scope.show.numberOfEntries = 50;
		$scope.show.entries = $scope.entries.slice($scope.show.iEntryStart, $scope.show.iEntryStart + $scope.show.numberOfEntries);
	};
	$scope.show.more = function() {
		$scope.show.iEntryStart += $scope.show.numberOfEntries;
		if ($scope.show.iEntryStart > $scope.entriesTotalCount) {
			$scope.show.iEntryStart = $scope.entriesTotalCount;
		} else {
			var moreEntries = $scope.entries.slice($scope.show.iEntryStart, $scope.show.iEntryStart + $scope.show.numberOfEntries);
			$scope.show.entries = $scope.show.entries.concat(moreEntries);
		}
	};
	
	$scope.refreshView = function(iEntryStart, numberOfEntries, updateFirstEntry) {
		updateFirstEntry = typeof updateFirstEntry !== 'undefined' ? updateFirstEntry : false;
		var gotDto = function (result) {
			if (result.ok) {
				configService.setConfig(result.data.config);
				$scope.config = result.data.config;
				$scope.entries = result.data.entries;
				$scope.entriesTotalCount = result.data.entriesTotalCount;
				if (updateFirstEntry && result.data.entry.id != '') {
					$scope.setCurrentEntry(result.data.entry);
				}
				$scope.show.initial();
			}
		};
		var view = 'dbe';
		switch (view) {
			case 'dbe':
				lexService.dbeDto(iEntryStart, numberOfEntries, gotDto);
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
	
	$scope.refreshView($scope.load.iEntryStart, $scope.load.numberOfEntries, true);
	
	var autoSaveTimer;
	function startAutoSaveTimer() {
		if (angular.isDefined(autoSaveTimer)) {
			return;
		}
		autoSaveTimer = $interval($scope.saveCurrentEntry, 5000, 1);
	};
	function cancelAutoSaveTimer() {
		if (angular.isDefined(autoSaveTimer)) {
			$interval.cancel(autoSaveTimer);
			autoSaveTimer = undefined;
		}
	};
	
	$scope.$watch('currentEntry', function(newValue) {
		if (newValue != undefined) {
			cancelAutoSaveTimer();
			if ($scope.currentEntryIsDirty) {
				startAutoSaveTimer();
			}
		}
	}, true);
	
	$scope.$on('$destroy', function() {
		cancelAutoSaveTimer();
		$scope.saveCurrentEntry();
	});
	
	$scope.$on('$locationChangeStart', function (event, next, current) {
		//Navigate to newUrl if the entry isn't dirty
		if (! $scope.currentEntryIsDirty()) return;
		
		var answer = confirm("You have unsaved changes. Leave the page?");
		if (!answer) {
			//prevent navigation by default since we'll handle it
			//once the user selects a dialog option
			event.preventDefault();
		}
		
		return;
	});
	
	$window.onbeforeunload = function (event) {
		var message = 'You have unsaved changes.';
		if (typeof event == 'undefined') {
			event = window.event;
		}
		if (! $scope.currentEntryIsDirty()) return;
		if (event) {
			event.returnValue = message;
		}
		return message;
	};
	
	$scope.submitComment = function(comment) {
//		console.log('submitComment = ' + comment);
		lexService.updateComment(comment, function(result) {
			if (result.ok) {
				var entry = result.data;
				$scope.setCurrentEntry(entry);
				$scope.updateListWithEntry(entry);
			}
		});
	};
	
	// permissions stuff
	$scope.control = {};
	$scope.control.canDeleteSense = function() {
		return true;
	};
	
	$scope.control.canDeleteWord = function() {
		return true;
	};
	
	$scope.control.canDeleteExample = function() {
		return true;
	};
	
	/*
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
	*/
	
	$scope.recursiveRemoveProperties = function(startAt, properties) {
		angular.forEach(startAt, function(value, key) {
			var deleted = false;
			angular.forEach(properties, function(propName) {
				//console.log ("key = " + key + "  && propName = " + propName);
				if (!deleted && key == propName) {
					//console.log("deleted " + key + " (" + startAt[key] + ")");
					delete startAt[key];
					deleted = true;
				}
			});
			if (!deleted && angular.isObject(value)) {
				$scope.recursiveRemoveProperties(startAt[key], properties);
			}
		});
		return startAt;
	};
	
	// defaults
	$scope.editTab = {active: true};
	$scope.commentsTab = {active: false};
	$scope.control.showComments = false;
	
	// When comments tab is clicked, set up new config for its interior
	$scope.selectCommentsTab = function() {
//		console.log('comments tab selected');
		$scope.control.showComments = true;
		$scope.editTab.active = false;
		$scope.commentsTab.active = true;
	};
	$scope.selectEditTab = function() {
//		console.log('edit tab selected');
		$scope.control.showComments = false;
		$scope.editTab.active = true;
		$scope.commentsTab.active = false;
	};

	// TODO: Consider moving filter-related code and variables into its own controller
	$scope.filter = {};
	$scope.filter.chevronIcon = "icon-chevron-up";
	$scope.filter.visible = false;
	$scope.toggleFilters = function() {
//		console.log('Filters toggled');
		if ($scope.filter.visible) {
			$scope.filter.visible = false;
			$scope.filter.chevronIcon = "icon-chevron-down";
		} else {
			$scope.filter.visible = true;
			$scope.filter.chevronIcon = "icon-chevron-up";
		}
	};
	$scope.filter.validStatuses = [ // TODO: Get this from appropriate service or API call, rather than hardcoded list
		"To Do",
		"Reviewed",
		"Resolved",
	];
	$scope.filter.searchFor = {};
	angular.forEach($scope.validStatuses, function(status) {
		$scope.filter.searchFor[status] = false;
	});
	$scope.filter.searchFor['To Do'] = true; // DEBUG: To check appropriate checkbox in filter form
	$scope.getInputSystems = function() {
		return $scope.config.inputSystems; // TODO: Add filtering if needed, i.e. only show a checkbox for input systems that have comments below
	};
	$scope.filter.showLangs = {};
	angular.forEach($scope.getInputSystems(), function(inputSystem) {
		$scope.filter.showLangs[inputSystem.abbreviation] = false;
	});
	$scope.filter.showLangs['en'] = true; // DEBUG: To check appropriate checkbox in filter form
	$scope.applyFilters = function() {
//		console.log('Applying filters:', $scope.filter);
		// TODO: Implement this
	};
	
	
	// search typeahead
	$scope.typeahead = {term : '', searchResults : [], };
	$scope.typeahead.searchEntries = function(query) {
		if (query.length > 1) {
			$scope.typeahead.searchResults = $filter('filter')($scope.entries, query);
		} else {
			$scope.typeahead.searchResults = [];
		}
	};
	
	$scope.typeahead.searchSelect = function(entry) {
		$scope.typeahead.searchItemSelected = '';
		$scope.editEntry(entry.id);
	};
	
}])
;
