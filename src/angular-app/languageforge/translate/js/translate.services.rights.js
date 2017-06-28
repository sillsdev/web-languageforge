'use strict';

angular.module('translate.services')
  .service('translateRightsService', ['sessionService', function (sessionService) {
    // mock sendReceive (TODO combine with lexRightsService)
    var sendReceive = {
      isInProgress: function () { return false; }
    };

    var session;

    /**
     * This helper returns a function with a boolean return type indicating whether an
     * operation is permitted.
     * @param {boolean} allowArchived - When false, the resulting function will always return false
     * if the project is archived.
     * @param {number} domain - An enum value from sessionService.domain indicating the domain of
     * the operation.
     * @param {number} operation - An enum value from sessionService.operation indicating the
     * operation for which the user's permissions should be checked.
     * @param {boolean} projectOwnerAllowed - When this is true and the current project is owned by
     * the current user, the user will be considered to always have permission.
     * @return {Function<boolean>} - A function that will indicate whether the user is
     * allowed to perform the given operation.
     */
    function condition(allowArchived, domain, operation, projectOwnerAllowed) {
      return function () {
        if (sendReceive.isInProgress()) return false;
        else if (!session.project()) return false;
        else if (!allowArchived && session.project().isArchived) return false;
        else {
          var hasRight = session.hasProjectRight(domain, operation);

          // The case where user does not explicitly have a right, but does because user is owner
          if (projectOwnerAllowed) hasRight = hasRight || session.project().userIsProjectOwner;
          return hasRight;
        }
      };
    }

    var Rights = (new function () {
      var domain = sessionService.domain;
      var operation = sessionService.operation;

      this.canRemoveUsers = condition(true, domain.USERS, operation.DELETE);
      this.canCreateUsers = condition(true, domain.USERS, operation.CREATE);
      this.canEditUsers = condition(false, domain.USERS, operation.EDIT);
      this.canArchiveProject = condition(true, domain.PROJECTS, operation.ARCHIVE, true);
      this.canDeleteProject = condition(true, domain.PROJECTS, operation.DELETE, true);
      this.canEditProject = condition(false, domain.PROJECTS, operation.EDIT);
      this.canEditEntry = condition(false, domain.ENTRIES, operation.EDIT);
      this.canDeleteEntry = condition(false, domain.ENTRIES, operation.DELETE);
      this.canComment = condition(false, domain.COMMENTS, operation.CREATE);
    });

    // Promise<Rights>
    this.getRights = function () {
      return sessionService.getSession().then(function (sessionData) {
        session = sessionData;
        return Rights;
      });
    };

  }])

  ;
