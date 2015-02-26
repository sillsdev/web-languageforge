'use strict';

angular.module('examples', ['jsonRpc', 'ui.bootstrap', 'bellows.services', 'palaso.ui.dc.entry', 'palaso.ui.listview', 'ngAnimate'])
.controller('examplesCtrl', ['$scope', 'userService', 'sessionService', 'lexEntryService', 
                             function ($scope, userService, sessionService, lexService) {
  var projectId = $scope.routeParams.projectId;
  $scope.project = {
    'id': projectId
  };
    
  $scope.items = [];
  $scope.visibleEntries = [];
  $scope.config = {};
  $scope.pageData = {};
  $scope.pageData.currentEntry = {};

  $scope.getPageDto = function() {
    lexService.addExampleDto($scope.project.id, function(result) {
      if (result.ok) {
        $scope.items = result.data.entries;  // Items is a list of {id: 3, title: "foo", entry: (full entry)} objects
        $scope.config = result.data.config;
      }
    });
  };

  $scope.entryTitle = function(entry) {
    entry = entry || $scope.pageData.currentEntry;
    var title = "[new word]";
    if (entry.lexeme && $scope.config && $scope.config.entry) {
      var lexemeInputSystem = $scope.config.entry.fields.lexeme.inputSystems[0];
      if (entry.lexeme[lexemeInputSystem]) {
        title = entry.lexeme[lexemeInputSystem];
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
      lexService.update($scope.project.id, $scope.pageData.currentEntry, function(result) {
        $scope.updateListWithEntry(result.data);
        $scope.selectEntry(result.data);
      });
    };
  };

  // run this when the page loads
  $scope.getPageDto();

}])
;
