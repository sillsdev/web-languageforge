'use strict';

angular.module('lexicon.services')
  .service('lexRightsService', ['asyncSession',  'lexSendReceive',
  function (sessionService, sendReceive) {

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
     * @param {projectOwnerAllowed} - When this is true and the current project is owned by the
     * current user, the user will be considered to always have permission.
     * @return {Function<boolean>} - A function that will indicate whether the user is
     * allowed to perform the given operation.
     */
    function condition(allowArchived, domain, operation, projectOwnerAllowed) {
      return function() {
        if(sendReceive.isInProgress()) return false;
        else if(!session.project()) return false;
        else if(!allowArchived && session.project().isArchived) return false;
        else {
          var hasRight = session.hasProjectRight(domain, operation);
          // The case where user does not explicitly have a right, but does because user is owner
          if(projectOwnerAllowed) hasRight = hasRight || session.project().userIsProjectOwner;
          return hasRight;
        }
      };
    }

    var Rights = (new function () {
      // domain and operation
      var d = sessionService.domain;
      var o = sessionService.operation;

      this.canRemoveUsers = condition(true, d.USERS, o.DELETE);
      this.canCreateUsers = condition(true, d.USERS, o.CREATE)
      this.canEditUsers = condition(false, d.USERS, o.EDIT);
      this.canArchiveProject = condition(true, d.PROJECTS, o.ARCHIVE, true);
      this.canEditProject = condition(false, d.PROJECTS, o.EDIT);
      this.canEditEntry = condition(false, d.ENTRIES, o.EDIT);
      this.canDeleteEntry = condition(false, d.ENTRIES, o.DELETE);
      this.canComment = condition(false, d.COMMENTS, o.CREATE);
    });

    // Promise<Rights>
    this.getRights = function() {
      return sessionService.getSession().then(function(sessionData) {
        session = sessionData;
        return Rights;
      });
    }
  }]);
