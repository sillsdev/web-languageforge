'use strict';

angular.module('lexicon.services')

// Lexicon Entry Service
.service('lexEntryApiService', ['jsonRpc', 'sessionService', 'lexProjectService', 'breadcrumbService', 'lexLinkService',
function(jsonRpc, ss, projectService, breadcrumbService, linkService) {
  jsonRpc.connect('/api/sf');

  /*
   * not currently used this.read = function readEntry(id, callback) {
   * jsonRpc.call('lex_entry_read', [id], callback); };
   */

  this.update = function updateEntry(entry, callback) {
    jsonRpc.call('lex_entry_update', [entry], callback);
  };

  this.remove = function(id, callback) {
    jsonRpc.call('lex_entry_remove', [id], callback);
  };

  this.dbeDtoFull = function dbeDtoFull(browserId, offset, callback) {
    jsonRpc.call('lex_dbeDtoFull', [browserId, offset], function (result) {
      if (result.ok) {
        // todo move breadcrumbs back to controller - cjh 2014-07
        breadcrumbService.set('top', [{
          href: '/app/projects',
          label: 'My Projects'
        }, {
          href: linkService.project(),
          label: ss.session.project.projectName
        }, {
          href: linkService.projectView('dbe'),
          label: 'Browse And Edit'
        }]);
      }
      callback(result);
    });
  };

  this.dbeDtoUpdatesOnly = function dbeDtoUpdatesOnly(browserId, timestamp, callback) {
    if (timestamp) {
      jsonRpc.call('lex_dbeDtoUpdatesOnly', [browserId, timestamp], callback);
    } else {
      jsonRpc.call('lex_dbeDtoUpdatesOnly', [browserId], callback);
    }
  };

}])
;
