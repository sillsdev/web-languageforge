'use strict';

angular.module('translate.services')
  .service('translateRightsService', ['sessionService',
  function (sessionService) {
    // mock sendReceive (TODO combine with lexRightsService)
    var sendReceive = {
      isInProgress: function () { return false; }
    };

    this.canRemoveUsers = function canRemoveUsers() {
      if (sendReceive.isInProgress()) return false;

      return sessionService.hasProjectRight(sessionService.domain.USERS,
        sessionService.operation.DELETE);
    };

    this.canCreateUsers = function canCreateUsers() {
      if (sendReceive.isInProgress()) return false;

      return sessionService.hasProjectRight(sessionService.domain.USERS,
        sessionService.operation.CREATE);
    };

    this.canEditUsers = function canEditUsers() {
      if (sendReceive.isInProgress() || sessionService.session.project.isArchived) return false;

      return sessionService.hasProjectRight(sessionService.domain.USERS,
        sessionService.operation.EDIT);
    };

    this.canArchiveProject = function canArchiveProject() {
      if (sendReceive.isInProgress() || !angular.isDefined(sessionService.session.project))
        return false;

      return (sessionService.session.project.userIsProjectOwner ||
        sessionService.hasSiteRight(sessionService.domain.PROJECTS,
          sessionService.operation.ARCHIVE));
    };

    this.canEditProject = function canEditProject() {
      if (sendReceive.isInProgress() || sessionService.session.project.isArchived) return false;

      return sessionService.hasProjectRight(sessionService.domain.PROJECTS,
        sessionService.operation.EDIT);
    };

    this.canEditEntry = function canEditEntry() {
      if (sendReceive.isInProgress() || sessionService.session.project.isArchived) return false;

      return sessionService.hasProjectRight(sessionService.domain.ENTRIES,
        sessionService.operation.EDIT);
    };

    this.canDeleteEntry = function canDeleteEntry() {
      if (sendReceive.isInProgress() || sessionService.session.project.isArchived) return false;

      return sessionService.hasProjectRight(sessionService.domain.ENTRIES,
        sessionService.operation.DELETE);
    };

    this.canComment = function canComment() {
      if (sendReceive.isInProgress() || sessionService.session.project.isArchived) return false;

      return sessionService.hasProjectRight(sessionService.domain.COMMENTS,
        sessionService.operation.CREATE);
    };

  }])

  ;
