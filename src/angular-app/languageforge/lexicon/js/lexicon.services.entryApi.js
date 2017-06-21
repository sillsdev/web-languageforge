'use strict';

angular.module('lexicon.services')

// Lexicon Entry Service
.service('lexEntryApiService', ['apiService', function (api) {

  this.update = api.method('lex_entry_update');
  this.remove = api.method('lex_entry_remove');
  this.dbeDtoFull = api.method('lex_dbeDtoFull');
  this.dbeDtoUpdatesOnly = api.method('lex_dbeDtoUpdatesOnly');

}]);
