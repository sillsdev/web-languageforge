import * as angular from 'angular';

import {
  Domains, Operations,
  Session, SessionService,
  RightsFunction
} from '../../../bellows/core/session.service';

export interface ConditionFunction { (): boolean }

export class Rights {
  readonly canRemoveUsers: ConditionFunction;
  readonly canCreateUsers: ConditionFunction;
  readonly canEditUsers: ConditionFunction;
  readonly canArchiveProject: ConditionFunction;
  readonly canDeleteProject: ConditionFunction;
  readonly canEditProject: ConditionFunction;
  readonly canEditEntry: ConditionFunction;
  readonly canDeleteEntry: ConditionFunction;
  readonly canComment: ConditionFunction;

  constructor(private domain: Domains, private operation: Operations,
              private sendReceive: SendReceive, public session?: Session) {
    this.canRemoveUsers = this.isPermitted(true, domain.USERS, operation.DELETE);
    this.canCreateUsers = this.isPermitted(true, domain.USERS, operation.CREATE);
    this.canEditUsers = this.isPermitted(false, domain.USERS, operation.EDIT);
    this.canArchiveProject = this.isPermitted(true, domain.PROJECTS, operation.ARCHIVE,
      true);
    this.canDeleteProject = this.isPermitted(true, domain.PROJECTS, operation.DELETE,
      true);
    this.canEditProject = this.isPermitted(false, domain.PROJECTS, operation.EDIT);
    this.canEditEntry = this.isPermitted(false, domain.ENTRIES, operation.EDIT);
    this.canDeleteEntry = this.isPermitted(false, domain.ENTRIES, operation.DELETE);
    this.canComment = this.isPermitted(false, domain.COMMENTS, operation.CREATE);
  }

  /**
   * This helper returns a function with a boolean return type indicating whether an
   * operation is permitted.
   * @param {boolean} allowArchived - When false, the resulting function will always return false
   * if the project is archived.
   * @param {RightsFunction} domain - An enum value from sessionService.domain indicating the domain
   * of the operation.
   * @param {RightsFunction} operation - An enum value from sessionService.operation indicating the
   * operation for which the user's permissions should be checked.
   * @param {boolean} projectOwnerAllowed - When this is true and the current project is owned by
   * the current user, the user will be considered to always have permission.
   * @return {Function<boolean>} - A function that will indicate whether the user is
   * allowed to perform the given operation.
   */
  private isPermitted(allowArchived: boolean, domain: RightsFunction, operation: RightsFunction,
                      projectOwnerAllowed: boolean = false): ConditionFunction {
    return () => {
      if (this.sendReceive.isInProgress()) return false;
      else if (!this.session.project()) return false;
      else if (!allowArchived && this.session.project().isArchived) return false;
      else {
        let hasRight = this.session.hasProjectRight(domain, operation);

        // The case where user does not explicitly have a right, but does because user is owner
        if (projectOwnerAllowed) hasRight = hasRight || this.session.project().userIsProjectOwner;
        return hasRight;
      }
    };
  }

}

// mock sendReceive service
class SendReceive {
  isInProgress () {
    return false;
  }
}

export class TranslateRightsService {
  private rights: Rights;

  static $inject: string[] = ['sessionService'];
  constructor(private sessionService: SessionService) {
    // mock sendReceive service (TODO combine with lexRightsService)
    const sendReceive = new SendReceive();

    this.rights = new Rights(sessionService.domain, sessionService.operation, sendReceive);
  }

  getRights(): angular.IPromise<Rights> {
    return this.sessionService.getSession().then((session) => {
      this.rights.session = session;
      return this.rights;
    });
  };

}
