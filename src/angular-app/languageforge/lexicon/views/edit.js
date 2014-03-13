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
		$scope.lexemeFormRequired = false;
		if ($scope.canSave()) {
			var foundLexeme = false;
			angular.forEach($scope.config.entry.fields.lexeme.inputSystems, function(ws) {
				if($scope.currentEntry.lexeme[ws].value != '') {
					foundLexeme = true;
				};
			});
			if (foundLexeme) {
				lexService.update($scope.currentEntry, function(result) {
	
					$scope.updateListWithEntry(result.data);
					$scope.setCurrentEntry(result.data);
					$scope.lastSavedDate = new Date();
					$scope.refreshView();
				});
			} else {
				$scope.lexemeFormRequired = true;
			}
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
		$scope.currentEntry = angular.copy(entry);
		pristineEntry = angular.copy(entry);
	};
	
	$scope.editEntry = function(id) {
		$scope.saveNow();

		if (arguments.length == 0) {
			if ($scope.currentEntry.id != '') {
				var newEntry = {id:''};
				$scope.setCurrentEntry(newEntry);
				$scope.updateListWithEntry(newEntry);
			}
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
	
	$scope.refreshView = function(updateFirstEntry) {
		updateFirstEntry = typeof updateFirstEntry !== 'undefined' ? updateFirstEntry : false;
		var gotDto = function (result) {
			if (result.ok) {
				configService.setConfig(result.data.config);
				$scope.config = enhanceConfig(result.data.config);
				$scope.entries = result.data.entries;
				if (updateFirstEntry && result.data.entry.id != '') {
					$scope.setCurrentEntry(result.data.entry);
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
	
	function enhanceConfig(conf) {
		var config = angular.copy(conf);
		if (angular.isDefined(config.entry)) {
			config.entry.fields.lexeme.wsInfo = config.inputSystems;
			angular.forEach(config.entry.fields.senses, function(sense) {
				sense.fields.definition.wsInfo = config.inputSystems;
				angular.forEach(sense.fields.examples, function(example) {
					example.fields.sentence.wsInfo = config.inputSystems;
					example.fields.translation.wsInfo = config.inputSystems;
				});
			});
		}
		return config;
	}

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
