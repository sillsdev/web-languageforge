'use strict';

angular.module('bellows.services')
  .service('sfchecksLinkService', function () {
    this.href = function (url, text) {
      return '<a href="' + url + '">' + text + '</a>';
    };

    this.project = function (projectId, projectType) {
      projectType = projectType || 'sfchecks';
      if (angular.isDefined(projectId)) {
        return '/app/' + projectType + '/' + projectId + '#/';
      } else {
        return '#/';
      }
    };

    this.text = function (textId, projectId) {
      if (angular.isDefined(projectId)) {
        return this.project(projectId) + textId;
      } else {
        return this.project() + textId;
      }
    };

    this.question = function (textId, questionId, projectId) {
      if (angular.isDefined(projectId)) {
        return this.text(textId, projectId) + '/' + questionId;
      } else {
        return this.text(textId) + '/' + questionId;
      }
    };

    this.entry = function (entryId, projectId) {
      if (angular.isDefined(projectId)) {
        // TODO: Replace hardcoded 'lexicon' below
        return this.project(projectId, 'lexicon') + '/editor/entry/' + entryId;
      } else {
        return '#/editor/entry/' + entryId;
      }
    };

    this.settings = function (projectId) {
      return this.project(projectId) + '/settings';
    };

    this.user = function (userId) {
      return '/app/userprofile/' + userId;
    };
  });
