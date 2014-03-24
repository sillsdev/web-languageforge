'use strict';

angular.module('dbe', ['jsonRpc', 'ui.bootstrap', 'bellows.services', 'palaso.ui.dc.entry', 'palaso.ui.dc.comments', 'ngAnimate', 'truncate', 'lexicon.services', 'palaso.ui.scroll'])
.controller('editCtrl', ['$scope', 'userService', 'sessionService', 'lexEntryService', 'lexConfigService', '$window', '$timeout', '$filter', 'lexLinkService', 
                        function ($scope, userService, sessionService, lexService, configService, $window, $timeout, $filter, linkService) {
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
	
	$scope.saveButtonTitle = function() {
		if ($scope.currentEntryIsDirty()) {
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
	
	$scope.saveCurrentEntry = function() {
		if ($scope.currentEntryIsDirty()) {
			var foundLexeme = false;
			angular.forEach($scope.config.entry.fields.lexeme.inputSystems, function(ws) {
				if($scope.currentEntry.lexeme[ws].value != '') {
					foundLexeme = true;
				};
			});
			if (foundLexeme) {
				lexService.update($scope.currentEntry, function(result) {
					//$scope.updateListWithEntry(result.data);
					$scope.lastSavedDate = new Date();
					pristineEntry = angular.copy($scope.currentEntry);
					$scope.refreshView($scope.load.entryStart, $scope.load.entryLength);
				});
				return true;
			} else {
				return false;
			}
		}
		return true;
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
	
	$scope.getMeaning = function(entry) {
		var meaning = '';
		if (angular.isDefined($scope.config.entry) && angular.isDefined(entry.definition)) {
			var ws = $scope.config.entry.fields.senses.fields.definition.inputSystems[0];
			if (angular.isDefined(entry.definition[ws])) {
				meaning = entry.definition[ws].value;
			}
		}
		return meaning;
	};
	
	$scope.setCurrentEntry = function(entry) {
		entry = entry || {};
		$scope.lexemeFormRequired = false;
		$scope.currentEntry = entry;
		pristineEntry = angular.copy(entry);
	};
	
	$scope.editEntry = function(id) {
		$scope.lexemeFormRequired = false;
		if (angular.isUndefined(id) || $scope.currentEntry.id != id) {
			if ($scope.saveCurrentEntry()) {
				if (arguments.length == 0) {
					//if ($scope.currentEntry.id != '') {
						var newEntry = {id:''};
						$scope.setCurrentEntry(newEntry);
						$scope.updateListWithEntry(newEntry);
					//}
				} else {
					lexService.read(id, function(result) {
						$scope.setCurrentEntry(result.data);
					});
				}
			} else {
				$scope.lexemeFormRequired = true;
			}
		}
	};

	$scope.newEntry = function() {
		$scope.editEntry();
	};
	
	$scope.getTitle = function(entry) {
		entry = entry || $scope.currentEntry;
		var title = "[empty]";
		if (entry.lexeme && $scope.config && $scope.config.entry) {
			var lexemeInputSystem = $scope.config.entry.fields.lexeme.inputSystems[0];
			if (angular.isDefined(entry.lexeme[lexemeInputSystem]) && entry.lexeme[lexemeInputSystem].value != '') {
				title = entry.lexeme[lexemeInputSystem].value;
			}
		}
		return title;
	};

	$scope.entryLoaded = function() {
		return angular.isDefined($scope.currentEntry.id);
	};
	
	$scope.deleteEntry = function(entry) {
		if ($window.confirm("Are you sure you want to delete '" + $scope.getTitle(entry) + "'?")) {
			$scope.entries.splice($scope.getEntryIndexById(entry.id), 1);
			if (entry.id != '') {
				lexService.remove(entry.id, function(){});
			}
			$scope.setCurrentEntry({});
		}
	};
	
	$scope.load = {
		entryStart: 0,
		entryLength: 30
	}; 
	$scope.loadMore = function() {
		$scope.load.entryStart += $scope.load.entryLength;
		console.log("loadMore ", $scope.load.entryStart);
		$scope.refreshView($scope.load.entryStart, $scope.load.entryLength, true);
	};
	
	$scope.refreshView = function(loadEntryStart, loadEntryLength, updateFirstEntry) {
		updateFirstEntry = typeof updateFirstEntry !== 'undefined' ? updateFirstEntry : false;
		var gotDto = function (result) {
			if (result.ok) {
				configService.setConfig(result.data.config);
				$scope.config = result.data.config;
				$scope.entries = result.data.entries;
				if (updateFirstEntry && result.data.entry.id != '') {
					$scope.setCurrentEntry(result.data.entry);
				}
			}
		};
		var view = 'dbe';
		switch (view) {
			case 'dbe':
				lexService.dbeDto(loadEntryStart, loadEntryLength, gotDto);
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
	
	$scope.refreshView($scope.load.entryStart, $scope.load.entryLength, true);
	
	$scope.submitComment = function(comment) {
		console.log('submitComment = ' + comment);
		lexService.updateComment(comment, function(result) {
			if (result.ok) {
				var entry = result.data;
				$scope.setCurrentEntry(entry);
				$scope.updateListWithEntry(entry);
			}
		});
	};
	
	
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

	// TODO: Consider moving filter-related code and variables into its own controller
	$scope.filter = {};
	$scope.filter.chevronIcon = "icon-chevron-up";
	$scope.filter.visible = false;
	$scope.toggleFilters = function() {
		console.log('Filters toggled');
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
		console.log('Applying filters:', $scope.filter);
		// TODO: Implement this
	};
}])
;
