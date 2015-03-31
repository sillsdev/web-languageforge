'use strict';

angular.module('lexicon.services')

// Lexicon Link Service
.service('lexLinkService', ['$location', 'sessionService', function($location, ss) {
  this.project = function project() {
    return '/app/lexicon/' + this.getProjectId() + '/#';
  };

  this.projectView = function projectView(view) {
    return this.project() + view;
  };

  this.getProjectId = function getProjectId() {
    return ss.session.project.id;
  };
}]);

