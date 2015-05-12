'use strict';

angular.module('semdomtrans.edit', ['jsonRpc', 'ui.bootstrap', 'bellows.services',  'ngAnimate', 'palaso.ui.notice', 'semdomtrans.services', 'palaso.ui.sd.term', 'palaso.ui.sd.questions', 'palaso.ui.scroll', 'palaso.ui.typeahead', 'palaso.ui.sd.ws'])
// DBE controller
.controller('editCtrl', ['$scope', '$state', '$stateParams', 'semdomtransEditService', 'semdomtransEditorDataService', 'sessionService', 'modalService', 'silNoticeService', '$rootScope', '$filter', '$timeout', '$q', 
function($scope, $state, $stateParams, semdomEditApi, editorDataService, sessionService, modal, notice, $rootScope, $filter, $timeout, $q) {
  
  // variable that determines which tab is selected
  $scope.selectedTab = 0;
  
  // control is set to scope (necessary for passing down to directives)
  $scope.control = $scope;
  
  // determines which question we are on in term
  $scope.currentQuestionPos = 0;
  
  /*
  $scope.tabDisplay = {"val": '0'};
  $scope.state = "edit"; 
  */
  $scope.displayedItems = [];
  $scope.selectedDepth = 1;
  $scope.searchText = "";
  $scope.isEditingWorkingSet = false;
  $scope.hideTranslated = false;
  $scope.hideDescription = false;
  $scope.hideSearchKeys = false;
  $scope.hideQuestionsTerms = false;
  $scope.workingSetItems = {};
  $scope.filteredItems = {};

  $scope.subDomain = "1";
  $scope.allSubDomains = [];
  
  var api = semdomEditApi;
   
  $scope.selectSubDomain = function(subDomain) {
    $scope.subDomain = subDomain;
    $scope.reloadItems($scope.selectedDepth);
  }
  
  /*
   * Calculates a list of all subdomains that have at least one item from the current working set in them
   * Then check if currently selected subdomain is in this list, if not set it to the first subdomain on list
   */
  function calculateSubdomainList() {
    var subDomainsDict = {};
    $scope.allSubDomains = [];
    for (var key in $scope.workingSetItems) {
      var sd = key[0];
      if (angular.isUndefined(subDomainsDict[sd]) || !subDomainsDict[sd]) {
        $scope.allSubDomains.push(sd);
        subDomainsDict[sd] = "true";
      }
    }
    
    // sort in case earlier subdomains were added later to working set
    $scope.allSubDomains.sort();
    
    if (angular.isUndefined(subDomainsDict[$scope.subDomain]) || !subDomainsDict[$scope.subDomain]) {
      $scope.subDomain = $scope.allSubDomains[0];
    }
  }
  
  /*
   * Reloads all items to be displayed based on the following filters:
   *    1) Depth of slider that determines to what depth of tree we want to see items
   *    2) Simple search filter - this is a regular angular filter, that filters items based on their content
   *    3) Working set - only show items or ancestors of items in a given working set
   *    4) Subdomain - we only display items of one top level domain at a time (e.g. "1", "2", ..., "9")
   */
  $scope.reloadItems = function reloadItems(depth, delay) {
     if (delay == undefined) {
       delay = 0;
     }
      var query = $scope.selectedText;
      $timeout(function() {
            if (query != $scope.selectedText)
              return;
            
            // calculate list of subdomains
            calculateSubdomainList();
           
            // all items in ws
            var workingSetList = [];
            
            // ancestors of filtered items
            var ancestorsOfFiltered = [];
            
            // dictionary to keep track of items add 
            // (since it is possible for multiple items in a working set to have the same ancestors (e.g. 1.3 and 1.4 will have 1 as common ancestor
            //- so this would result in duplicates if we did not keep track of what has been added)
            var addedToFiltered = {};
            
            
            // get all actually included items by depth
            for (var i in $scope.itemsTree) {
              var node = $scope.itemsTree[i];
              var item = node.content;
              if ($scope.isIncludedInWs(item.key) && item.key[0] == $scope.subDomain) {
                workingSetList.push(item);
              }              
            }          
          
            // apply filter       
            var filteredItemsList = $filter('filter')(workingSetList, $scope.searchText);
                              
            // reset filtered items dict
            $scope.filteredItems = {};
            
            // check off that items have been added (to avoid duplicates in next step)
            for (var i in filteredItemsList) {
              var item = filteredItemsList[i];
              addedToFiltered[item.key] = true;
              $scope.filteredItems[item.key] = true; 
            }
            
            // add ancestors of items in working set
            for (var i in filteredItemsList) {
              var node = $scope.itemsTree[filteredItemsList[i].key];
              var item = node.content;      
              if ($scope.isIncludedInWs(item.key) && item.key[0] == $scope.subDomain) {
                while(node.parent != '') {
                  if (angular.isUndefined(addedToFiltered[node.parent]) || !addedToFiltered[node.parent]) {
                    ancestorsOfFiltered.push($scope.itemsTree[node.parent].content);
                    addedToFiltered[node.parent] = true;
                  }
                  
                  node = $scope.itemsTree[node.parent];
                }
              }
            }            
            
            filteredItemsList = filteredItemsList.concat(ancestorsOfFiltered);
            
            var filteredByDepthItems = [];
            
            // process by depth
            for (var i in filteredItemsList) {
              if (checkDepth(filteredItemsList[i].key)) {
                filteredByDepthItems.push(filteredItemsList[i]);
              }
            }
            
            filteredByDepthItems.sort(function(a, b) {
              if (a.key < b.key) {
                return -1;
              } else {
                return 1;
              }
            });           
            
            $scope.displayedItems = filteredByDepthItems;
            if (!$scope.$$phase) {
              $scope.$apply()      
            }
          }, delay);
  }
  
  /*
   * Set items to be included 
   */
  $scope.setInclusion = function setInclusion(itemsToInclude, v) {
    for (var i in itemsToInclude) {
      $scope.workingSetItems[itemsToInclude[i].key] = v;
    }
    
    $scope.reloadItems($scope.selectedDepth);    
  }
  
  /*
   * Determines if a semdom item is completely approved (4 stands for approved)
   */
  
  function isItemCompletelyApproved(item) {
    var translated = true;
    translated = translated && (item.name.status == 4);
    translated = translated && (item.description.status == 4);
    for (var i = 0; i < item.searchKeys.length; i++) {
      translated = translated && (item.searchKeys[i].status == 4);
    }
    
    for (var i = 0; i < item.questions.length; i++) {
      translated = translated && (item.questions[i].question.status == 4);
      translated = translated && (item.questions[i].terms.status == 4);
    }
    
    return translated;
  }
  
  $scope.$watch('selectedDepth', function(newVal, oldVal) {
    if (oldVal != newVal) {
      var depth = newVal;
      $timeout(function() {
        if (depth == $scope.selectedDepth) {
            $scope.reloadItems(newVal);
        }
      }, 500);
    }
  });
  
  function checkDepth(key) {
    if ((key.length + 1) / 2 <= $scope.selectedDepth) {
      return true;
    }
    return false;
  }
  
  $scope.setTab = function(val) {
    $scope.selectedTab = val;
  }  
  
  $scope.changeTerm = function(key) {
      $scope.currentQuestionPos = 0;
      for (var i = 0; i < $scope.items.length; i++) {
        if ($scope.items[i].key == key) {
          $scope.currentEntry = $scope.items[i];
          $scope.currentEntryIndex = i;
          break;
        }
      }      
      $state.go("editor.editItem", { position: $scope.currentEntryIndex});
    }
  
  $scope.updateItem = function updateItem(v) {
    // update item if we hit the enter key
    v = (v === undefined) ? 13 : v;
    if (v == 13) {
      api.updateTerm($scope.currentEntry, function(result) {
        ;
      });
    }
  }
  
  $scope.refreshDbeData = function refreshDbeData(state) {
    var deferred = $q.defer();
    
    editorDataService.refreshEditorData().then(function(result) { 
       editorDataService.processEditorDto(result).then(function(resut) {
         deferred.resolve(); 
       })
     });

     return deferred.promise;
  };
    
  $scope.$watchCollection('items', function(newVal) {
    if (newVal && newVal.length > 0) {
      
      // reload all items up to appropriate tree depth
      var maxDepth = 0;
      for (var i in $scope.items) {
        var depth = ($scope.items[i].key.length + 1)/2;
        if (depth > maxDepth) {
          maxDepth = depth;
        }
        
        $scope.workingSetItems[$scope.items[i].key] = true;
      }
      
      $scope.maxDepth = maxDepth;
      
      $scope.selectedDepth = 5;
      
      // reload current entry if it is included in lsit
      if (!angular.isUndefined($stateParams.position) && $stateParams.position != null && $stateParams.position != "" && $scope.workingSetItems[$scope.items[$stateParams.position].key]) {      
        $scope.currentEntry = $scope.items[$stateParams.position];
        $scope.currentEntryIndex = angular.isUndefined($stateParams.position) ? 0 : $stateParams.position;
        $scope.changeTerm($scope.currentEntry.key);
      }
      
      $scope.currentEntry = $scope.items[$scope.currentEntryIndex];
      $scope.translatedItems = {};
      // find all items that are completely translated
      for (var i = 0; i < $scope.items.length; i++) {
        if (isItemCompletelyApproved($scope.items[i])) {
          $scope.translatedItems[$scope.items[i].key] = true;
        } else {
          $scope.translatedItems[$scope.items[i].key] = false;
        }
      }
    }   
  });
  
  /*
   * Handles changes when workingSets change - specifically if no selectedWorkingSet is defined
   * than set the default to 0, otherwise reload selectedWorkingSet
   */
  $scope.$watchCollection('workingSets', function(newVal) {
    if (newVal) {
      if (angular.isUndefined($scope.selectedWorkingSet)) {
        $scope.selectedWorkingSet = $scope.workingSets[0];
      }
      else {
        loadWorkingSetItems($scope.selectedWorkingSet);
      }
    }
  });
  
  //search typeahead
  $scope.typeahead = {
    term: '',
    searchResults: []
  };
  
  /*
   * Function that takes as input a query and returns associated search results for typeahed
   */
  $scope.typeahead.searchEntries = function searchEntries(query) {
    // if query starts with number, include all items whose key begin with that number
    if (!isNaN(parseInt(query[0]))) {
      $scope.typeahead.searchResults = []
      var results = [];
      var ln = query.length;
      for (var i in $scope.items) {
        if ($scope.items[i].key.substring(0, ln) === query) {
          results.push($scope.items[i]);
        }
      }
      $scope.typeahead.searchResults = results; 
    } else {
      $scope.typeahead.searchResults = $filter('filter')($scope.items, query);
    }
  };

  /*
   * Neccessary to define this function for typeahead
   */
  $scope.typeahead.searchSelect = function searchSelect(entry) {
  }; 
  
  /*
   * Function that determinses if an item is included in our current working set
   */
   $scope.isIncludedInWs = function isIncludedInWs(key) {
    return !angular.isUndefined($scope.workingSetItems[key]) && $scope.workingSetItems[key] ;
  }
  /*
   * Function that determines if an items is in filtered list
   */
   $scope.isInFiltered = function isInFiltered(key) {
     return !angular.isUndefined($scope.filteredItems[key]) && $scope.filteredItems[key] ;
   }
   
  /*
   * Set the appropriate working set to be edited
   */
  $scope.editWorkingSet = function editWorkingSet(wsID) {
    for (var i = 0; i < $scope.workingSets.length; i++) {
      if ($scope.workingSets[i].id == wsID) {
        $scope.selectedWorkingSet = $scope.workingSets[i];
        $scope.isEditingWorkingSet = true;
        break;
      }
    }
  }
  
  /*
   * Cancels editing of working set, specifically
   * isEditingWorkingSet is set to false, and newWS is set back to undefined
   */
  $scope.cancelEditingWorkingSet = function cancelEditingWorkingSet(wsOriginal) {
    loadWorkingSetItems($scope.selectedWorkingSet);
    $scope.isEditingWorkingSet = false;
    if (!angular.isUndefined($scope.newWs)) {
      $scope.newWs = undefined;
    }
  }

  /*
   * Creates a new empty working set and then loads it
   */
  $scope.createNewWorkingSet = function createNewWorkingSet() {    
    $scope.newWs = { id: '',  name: '', isShared : false, itemKeys : [] }   
    $scope.isEditingWorkingSet = true;
    loadWorkingSetItems($scope.newWs)
  }
  
  /*
   * Handle change in selectedWorkingSet by loading working set
   */
  $scope.$watch("selectedWorkingSet", function(newVal, oldVal) {
    if (oldVal != newVal) {
      $scope.searchText = "";
      loadWorkingSetItems($scope.selectedWorkingSet);
    }
  })
  
  function loadWorkingSetItems(ws) {
    $scope.workingSetItems = {};
    for (var i = 0; i < ws.itemKeys.length; i++) {
      $scope.workingSetItems[ws.itemKeys[i]] = true;
    }
    
    $scope.reloadItems($scope.selectedDepth);    
  }  
  
  /*
   * Function that handles saving of working set:
   * 1) Pull all items from working set and insert them into an array
   * 2) Make call to updateWorkingSet on service
   * 3) Reset working set variables (
   */
  $scope.saveWorkingSet = function saveWorkingSet(ws) {
    var ik = [];
    for (var i in $scope.workingSetItems) {
      if ($scope.workingSetItems[i]) {
        ik.push(i);
      }
    }
    
    ws.itemKeys = ik;

    // determine position of item in working set list:
    // if new item set selected working set position to last,
    // else keep selected working set position as is
    var position = ($scope.newWs == undefined) ? $scope.workingSets.indexOf($scope.selectedWorkingSet) : $scope.workingSets.length; 

    $scope.isEditingWorkingSet = false;
    $scope.newWs = undefined;
    
    notice.setLoading('Creating and Loading Working Set.');
    api.updateWorkingSet(ws, function(result) {
      if (result.ok) {
        $scope.refreshDbeData().then(function(result) {
            notice.cancelLoading();
            $scope.selectedWorkingSet = $scope.workingSets[position];
        });
      }
    })
    

  }
  
  $scope.isItemSelected = function isItemSelected() {
    return !angular.isUndefined($scope.currentEntryIndex);
  }
 
}]);
