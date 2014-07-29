'use strict';

angular.module('dbe', ['jsonRpc', 'ui.bootstrap', 'bellows.services', 'palaso.ui.dc.entry',
    'palaso.ui.dc.comments', 'ngAnimate', 'truncate', 'lexicon.services', 'palaso.ui.scroll', 'palaso.ui.notice'])
.controller('editCtrl', ['$scope', 'userService', 'sessionService', 'lexEntryService', '$window',
        '$interval', '$filter', 'lexLinkService', 'lexUtils', 'modalService', 'silNoticeService', '$route', '$rootScope', '$location',
function ($scope, userService, sessionService, lexService, $window, $interval, $filter, linkService, utils, modal, notice, $route, $rootScope, $location) {

    // redefine the $location.path function as per http://joelsaupe.com/programming/angularjs-change-path-without-reloading/
    var originalPathFunction = $location.path;
    $location.path = function (path, reload) {
        if (reload === false) {
            var lastRoute = $route.current;
            var un = $rootScope.$on('$locationChangeSuccess', function () {
                $route.current = lastRoute;
                un();
            });
        }
        return originalPathFunction.apply($location, [path]);
    };

    var pristineEntry = {};
    var browserInstanceId = Math.floor(Math.random() * 1000);
    $scope.config = $scope.projectSettings.config;
	$scope.lastSavedDate = new Date();
	$scope.currentEntry = {};
    $scope.state = 'list'; // default state.  State is one of 'list', 'edit', or 'comment'
    $scope.showUncommonFields = false;

    // Note: $scope.entries is declared on the MainCtrl so that each view refresh will not cause a full dictionary reload


	$scope.currentEntryIsDirty = function() {
		if ($scope.entryLoaded()) {
			return !angular.equals($scope.currentEntry, pristineEntry);
		}
		return false;
	};
	
	var saving = false;
	var saved = false;

	$scope.saveNotice = function() {
//		if ($scope.currentEntryIsDirty()) {	// TODO. Disabled. until php can deliver completely valid entry model and directives no longer make valid models. IJH 2014-03
//			if (saving) {
//				return "Saving";
//			}
//		} else {
//			if (saved) {
//				return "Saved";
//			}
//		}
		return "";
	};
	$scope.saveButtonTitle = function() {	// TODO. Remove. until php can deliver completely valid entry model and directives no longer make valid models. IJH 2014-03
		if ($scope.currentEntryIsDirty()) {
			return "Save Entry";
		} else {
			return "Entry saved";
		}
	};


	$scope.saveCurrentEntry = function saveCurrentEntry(setEntry, successCallback, failCallback) {
        var isNewEntry = false;
        if (angular.isUndefined(setEntry)) {
            // setEntry is mainly used for when the save button is pressed, that is when the user is saving the current entry and is NOT going to a different entry (as is the case with editing another entry
            setEntry = false;
        }
		if ($scope.currentEntryIsDirty()) {
			//cancelAutoSaveTimer();
			saving = true;
            isNewEntry = ($scope.currentEntry.id == '');
            if (isNewEntry) {
                removeEntryFromLists('');
            }
			lexService.update(prepEntryForUpdate($scope.currentEntry), function(result) {
				if (result.ok) {
                    var entry = result.data;
                    if (isNewEntry) {
                        // note: we have to reset the show window, because we don't know where the new entry will show up in the list
                        // we can solve this problem by implementing a sliding "scroll window" that only shows a few entries at a time (say 30?)
                        $scope.show.initial();
                    }
                    if (setEntry) {
                        setCurrentEntry(entry);
                    }
					$scope.lastSavedDate = new Date();

                    // refresh data will add the new entry to the entries list
					refreshData(false, function() {
                        if (isNewEntry && setEntry) {
                            scrollListToEntry(entry.id, 'top');
                        }
                    });
					saved = true;
					(successCallback||angular.noop)(result);
				} else {
					(failCallback||angular.noop)(result);
				}
				saving = false;
			});
		}
	};

	function prepEntryForUpdate(entry) {
		return recursiveRemoveProperties(angular.copy(entry), ['guid', 'mercurialSha', 'authorInfo', 'comments', 'dateCreated', 'dateModified', 'liftId', '$$hashKey']);
	}
	
	$scope.getWordForDisplay = function(entry) {
        var lexeme = utils.getLexeme($scope.config.entry, entry);
        if (!lexeme) {
            return '[Empty]';
        }
        return lexeme;
	};
	
	$scope.lexemeAlign = function(listEntry) {
		if ($scope.config && $scope.config.entry && listEntry.lexeme) {
			var inputSystem = $scope.config.entry.fields.lexeme.inputSystems[0];
			return ($scope.config.inputSystems[inputSystem].isRightToLeft) ? 'right' : 'left';
		} else {
			return 'left';
		}
	};
	
	$scope.getMeaningForDisplay = function(entry) {
		var meaning = '';
        if (entry.senses && entry.senses[0]) {
            meaning = utils.getMeaning($scope.config.entry.fields.senses, entry.senses[0]);
        }
        if (!meaning) {
            return '[Empty]';
        }
        return meaning;
	};

	$scope.definitionOrGlossAlign = function(listEntry) {
		if ($scope.config && $scope.config.entry && $scope.config.entry.fields.senses) {
			if (listEntry.definition) {
				var inputSystem = $scope.config.entry.fields.senses.fields.definition.inputSystems[0];
				return ($scope.config.inputSystems[inputSystem].isRightToLeft) ? 'right' : 'left';
			} else if (listEntry.gloss) {
				var inputSystem = $scope.config.entry.fields.senses.fields.gloss.inputSystems[0];
				return ($scope.config.inputSystems[inputSystem].isRightToLeft) ? 'right' : 'left';
			}
		} else {
			return 'left';
		}
	};
	
    function _scrollDivToId(containerId, divId, posOffset) {
        var offsetTop, div = $(divId), containerDiv = $(containerId);
        var foundDiv = false;
        if (angular.isUndefined(posOffset)) {
            posOffset = 0;
        }

        // todo: refactor this spaghetti logic
        if (div && containerDiv) {
            if (angular.isUndefined(div.offsetTop)) {
                if (angular.isDefined(div[0])) {
                    div = div[0];
                    foundDiv = true;
                } else {
                    console.log('Error: unable to scroll to div with div id ' + divId);
                }
            }
            if (foundDiv) {
                if (angular.isUndefined(div.offsetTop)) {

                    offsetTop = div.offset().top - posOffset;
                } else {
                    offsetTop = div.offsetTop - posOffset;
                }
                if (offsetTop < 0) offsetTop = 0;
                containerDiv.scrollTop(offsetTop);
            }
        }
    }

    function scrollListToEntry(id, position) {
        var posOffset = (position == 'top') ? 237 : 450;
        var index, entryDivId = '#entryId_'+id, listDivId = '#compactEntryListContainer';

        // make sure the item is visible in the list
        // todo implement lazy "up" scrolling to make this more efficient

        // only expand the "show window" if we know that the entry is actually in the entry list - a safe guard
        if (angular.isDefined(getEntryIndexInList(id, $scope.entries))) {
            while($scope.show.entries.length < $scope.entries.length) {
                index = getEntryIndexInList(id, $scope.show.entries);
                if (angular.isDefined(index)) {
                    break;
                }
                $scope.show.more();
            }
        } else {
            throw 'Error: tried to scroll to an entry that is not in the entry list!';
        }

        // note: ':visible' is a JQuery invention that means 'it takes up space on the page'.
        // It may actually not be visible at the moment because it may down inside a scrolling div or scrolled off the view of the page
        if ($(listDivId).is(':visible') && $(entryDivId).is(':visible')) {
            _scrollDivToId(listDivId, entryDivId, posOffset);
        }
        else {
            // wait then try to scroll
            $interval(function(){
                _scrollDivToId(listDivId, entryDivId, posOffset);
            }, 200, 1);
        }
    };

    $scope.editEntryAndScroll = function editEntryAndScroll(id) {
        $scope.editEntry(id);
        scrollListToEntry(id, 'middle');
    };


    function getEntryIndexInList(id, list) {
		var index = undefined;
		for (var i=0; i<list.length; i++) {
			var e = list[i];
			if (e.id == id) {
				index = i;
                return index;
			}
		}
        return undefined;
	};
	
	function setCurrentEntry(entry) {
		entry = entry || {};

        // auto-make a valid model but stop at the examples array
        entry = $scope.makeValidModelRecursive($scope.config.entry, entry, 'examples');
		$scope.currentEntry = entry;
		pristineEntry = angular.copy(entry);
		saved = false;
	}

	$scope.editEntry = function(id) {
		if ($scope.currentEntry.id != id) {
			$scope.saveCurrentEntry();
            setCurrentEntry($scope.entries[getEntryIndexInList(id, $scope.entries)]);
		}
        $scope.state = 'edit';
        $location.path('/dbe/' + id, false);
	};

	$scope.newEntry = function newEntry() {
        $scope.saveCurrentEntry();
        var newEntry = {id:''};
        setCurrentEntry(newEntry);
        addEntryToEntryList(newEntry);
        $scope.show.initial();
        scrollListToEntry('', 'top');
        $scope.state = 'edit';
        $location.path('/dbe', false);
	};
	
	$scope.entryLoaded = function entryLoaded() {
		return angular.isDefined($scope.currentEntry.id);
	};

     $scope.returnToList = function returnToList() {
         $scope.saveCurrentEntry();
         setCurrentEntry();
         $scope.state = 'list';
         $location.path('/dbe', false);
     };

    function removeEntryFromLists(id) {
        var iFullList = getEntryIndexInList(id, $scope.entries);
        if (angular.isDefined(iFullList)) {
            $scope.entries.splice(iFullList, 1);
            /* not yet implemented
            if ($scope.show.startOfWindow != 0) {
                $scope.show.startOfWindow--;
            }
            */
        }
        var iShowList = getEntryIndexInList(id, $scope.show.entries);
        if (angular.isDefined(iShowList)) {
            $scope.show.entries.splice(iShowList, 1);
        }
    }

    function addEntryToEntryList(entry) {
        $scope.entries.unshift(entry);
    }

    $scope.makeValidModelRecursive = function makeValidModelRecursive(config, data, stopAtNodes) {
        if (angular.isString(stopAtNodes)) {
            var node = stopAtNodes;
            stopAtNodes = [];
            stopAtNodes.push(node);
        } else if (angular.isArray(stopAtNodes)) {
            // array
        } else {
            stopAtNodes = [];
        }

        //console.log('makeValid: cfg: ' + config, 'data: ', data);


        switch (config.type) {
            case 'fields':
                angular.forEach(config.fieldOrder, function(f) {
                    if (angular.isUndefined(data[f])) {
                        if (config.fields[f].type == 'fields') {
//                            console.log('field ' + f + ' is array');
                            data[f] = [];
                        } else {
         //                   console.log('field ' + f + ' is object');
                            data[f] = {};
                        }
                    }

                    // only recurse if the field is not in our node stoplist
                    if (stopAtNodes.indexOf(f) == -1) {
          //              console.log('calling recursive: config.fields[f], data[f], f= ', f);
                        if (config.fields[f].type == 'fields') {
                            if (data[f].length == 0) {
                                data[f].push({});
                            }
                            for (var i=0; i<data[f].length; i++) {
                                data[f][i] = $scope.makeValidModelRecursive(config.fields[f], data[f][i], stopAtNodes);
                            }
                        } else {
                            data[f] = $scope.makeValidModelRecursive(config.fields[f], data[f], stopAtNodes);
                        }
                    }
                });
                break;
            case 'multitext':
           //     console.log('multitext cfg:', config);
                // when a multitext is completely empty for a field, and sent down the wire, it will come as a [] because of the way
                // that the PHP JSON default encode works.  We change this to be {} for an empty multitext
                if (angular.isArray(data)) {
                    data = {};
                }
                angular.forEach(config.inputSystems, function(ws) {
                    if (angular.isUndefined(data[ws])) {
                        data[ws] = {value:''};
                    }
                });
                break;
            case 'optionlist':
                if (angular.isUndefined(data['value'])) {
                    data['value'] = '';
                }
                break;
            case 'multioptionlist':
                if (angular.isUndefined(data['values'])) {
                    data['values'] = [];
                }
                break;
        }
//        console.log('end data: ', data);
        return data;
    }

	$scope.deleteEntry = function deleteEntry(entry) {
        var deletemsg = "Are you sure you want to delete the word <b>' " + utils.getLexeme($scope.config.entry, entry) + " '</b>";
		//var deletemsg = $filter('translate')("Are you sure you want to delete '{lexeme}'?", {lexeme:utils.getLexeme($scope.config.entry, entry)});
        modal.showModalSimple('Delete Word', deletemsg, 'Cancel', 'Delete Word').then(function() {
                var iShowList = getEntryIndexInList(entry.id, $scope.show.entries);
                removeEntryFromLists(entry.id);
                if ($scope.entries.length > 0) {
                    if (iShowList != 0) iShowList--;
                    setCurrentEntry($scope.show.entries[iShowList]);
                } else {
                    setCurrentEntry();
                }
                if (entry.id != '') {
                    lexService.remove(entry.id, angular.noop);
                }
            }
        );
	};
	

    /* TODO implement a proper sliding window that can go back and forward */
	$scope.show = {
		//startOfWindow: 0,
		entries: []
    };
	$scope.show.initial = function showInitial() {
        //var windowSize = 50;
		$scope.show.entries = $scope.entries.slice(0, 50);
	};
	$scope.show.more = function showMore() {
        var increment = 50;

        if (this.entries.length < $scope.entries.length) {
            this.entries = $scope.entries.slice(0, this.entries.length + increment);
        }
	};

    $scope.getCompactItemListOverlay = function getCompactItemListOverlay(entry) {
        var title, subtitle;
        title = $scope.getWordForDisplay(entry);
        subtitle = $scope.getMeaningForDisplay(entry);
        if (title.length > 19 || subtitle.length > 25) {
            return title + '         ' + subtitle;
        } else {
            return '';
        }
    };


    /*
    // for debugging
    var assertNoDuplicateIds = function assertNoDuplicateIds(arr) {
        // check for duplicate ids???
        var ids = [];
        for (var i=0; i<arr.length; i++) {
            var e = arr[i];
            if (ids.indexOf(e.id) > -1) {
                console.log('Ouch!  Somehow we got a duplicate id in the entries array! id = ' + e.id);
                console.log(e);
                //throw 'duplicate id in array!';
            };
            ids.push(e.id);
        }
    };
    */



	function refreshData(fullRefresh, callback) {
        callback = callback||angular.noop;
        if (fullRefresh) notice.setLoading('Loading Dictionary');
		var processDbeDto = function (result) {
            notice.cancelLoading();
			if (result.ok) {
                if (fullRefresh) {
                    $scope.entries = result.data.entries;
                    //assertNoDuplicateIds($scope.entries); // for debugging only

                    $scope.show.initial();
                } else {
                    // splice updates into entry lists
                    angular.forEach(result.data.entries, function(e) {
                        var i;

                        // splice into $scope.entries
                        i = getEntryIndexInList(e.id, $scope.entries);
                        if (angular.isDefined(i)) {
                            //console.log('refreshing entry in $scope.entries:');
                            //console.log(e);
                            $scope.entries[i] = e;
                        } else {
                            addEntryToEntryList(e);
//                            console.log('adding new entry into $scope.entries:');
//                            console.log(e);
                        }

                        // splice into $scope.show.entries
                        i = getEntryIndexInList(e.id, $scope.show.entries);
                        if (angular.isDefined(i)) {
//                            console.log('refreshing entry in $scope.show.entries:');
//                            console.log(e);
                            $scope.show.entries[i] = e;
                        } else {
//                            console.log('new entry isnt in view so we dont do anything');
                            // don't do anything.  The entry is not in view so we don't need to update it
                        }
                    });

                    // todo: sort both lists after splicing in updates

                }
			}
            callback();
		};
		var view = 'dbe';
		switch (view) {
			case 'dbe':
				lexService.dbeDto(browserInstanceId, fullRefresh, processDbeDto);
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

    function evaluateState() {
        var match, path = $location.path();

        var goToState = function goToState() {
            match = /dbe\/(.+)\/comments/.exec(path);
            if (match) {
                $scope.show.initial();
                $scope.editEntryAndScroll(match[1]);
                $scope.showComments(match[1]);
                return;
            }

            match = /dbe\/(.+)$/.exec(path);
            if (match) {
                $scope.show.initial();
                $scope.editEntryAndScroll(match[1]);
                return;
            }

            $scope.returnToList();
        };

        // refresh the data and go to state
        if ($scope.entries.length == 0) {
            refreshData(true, goToState);
        } else {
            refreshData(false, goToState);
        }
    }

    $scope.showComments = function showComments(fieldName) {
        $scope.saveCurrentEntry();
        $scope.state = 'comment';
        $location.path('/dbe/' + $scope.currentEntry.id + '/comments', false);
    };

    // only refresh the full view if we have not yet loaded the dictionary for the first time

    evaluateState();

 /* disable autosave feature until it's ready
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
//				startAutoSaveTimer();	// TODO. Disabled. until php can deliver completely valid entry model and directives no longer make valid models. IJH 2014-03
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
		
		var answer = confirm($filter('translate')("You have unsaved changes. Leave the page?"));
		if (!answer) {
			//prevent navigation by default since we'll handle it
			//once the user selects a dialog option
			event.preventDefault();
		}
		
		return;
	});
	
	$window.onbeforeunload = function (event) {
		var message = $filter('translate')('You have unsaved changes.');
		if (typeof event == 'undefined') {
			event = window.event;
		}
		if (! $scope.currentEntryIsDirty()) return;
		if (event) {
			event.returnValue = message;
		}
		return message;
	};
	*/

    /*
	$scope.submitComment = function submitComment(comment) {
//		console.log('submitComment = ' + comment);
		lexService.updateComment(comment, function(result) {
			if (result.ok) {
				var entry = result.data;
				setCurrentEntry(entry);
				//$scope.updateListWithEntry(entry);
			}
		});
	};
	*/

    // hack to pass down the parent scope down into all child directives (i.e. entry, sense, etc)
	$scope.control = $scope;

    // permissions stuff

    $scope.rights = {
        canEditEntry: function canEditEntry() {
            return sessionService.hasProjectRight(sessionService.domain.ENTRIES, sessionService.operation.EDIT);
        },
        canDeleteEntry: function canDeleteEntry() {
            return sessionService.hasProjectRight(sessionService.domain.ENTRIES, sessionService.operation.DELETE);
        },
        canComment: function canComment() {
            return sessionService.hasProjectRight(sessionService.domain.COMMENTS, sessionService.operation.CREATE);
        },
        canDeleteComment: function canDeleteComment(commentAuthorId) {
            if (sessionService.currentUserId == commentAuthorId) {
                return sessionService.hasProjectRight(sessionService.domain.COMMENTS, sessionService.operation.DELETE_OWN);
            } else {
                return sessionService.hasProjectRight(sessionService.domain.COMMENTS, sessionService.operation.DELETE);
            }
        },
        canEditComment: function canEditComment(commentAuthorId) {
            if (sessionService.currentUserId == commentAuthorId) {
                return sessionService.hasProjectRight(sessionService.domain.COMMENTS, sessionService.operation.EDIT_OWN);
            } else {
                return sessionService.hasProjectRight(sessionService.domain.COMMENTS, sessionService.operation.EDIT);
            }
        }
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
	
	var recursiveRemoveProperties = function recursiveRemoveProperties(startAt, properties) {
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
				recursiveRemoveProperties(startAt[key], properties);
			}
		});
		return startAt;
	};


    // todo implement this
    $scope.getFieldCommentCount = function getFieldCommentCount(fieldName) {
        var count;
        if (fieldName) {
            count = 5;
        } else {
            // get all unresolved comments for this entry
            count = 10;
        }
        return count;
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
		"Resolved"
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
	$scope.typeahead = {term : '', searchResults : []};
	$scope.typeahead.searchEntries = function(query) {
        $scope.typeahead.searchResults = $filter('filter')($scope.entries, query);
	};
	
	$scope.typeahead.searchSelect = function(entry) {
		$scope.typeahead.searchItemSelected = '';
        $scope.typeahead.searchResults = [];
        if (entry.id) {
            $scope.editEntryAndScroll(entry.id);
        }
	};
	
}])
;
