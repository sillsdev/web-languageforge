import * as angular from 'angular';

import {
  Domains, Operations,
  RightsFunction, Session,
  SessionService
} from '../../../bellows/core/session.service';
import {LexiconSendReceiveService} from './lexicon-send-receive.service';

export type ConditionFunction = (userId?: string) => boolean;

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
  readonly canDeleteComment: ConditionFunction;
  readonly canEditComment: ConditionFunction;
  readonly canUpdateCommentStatus: ConditionFunction;

  constructor(private domain: Domains, private operation: Operations,
              private sendReceive: LexiconSendReceiveService, public session?: Session) {
    this.canRemoveUsers = this.isPermitted(true, false, domain.USERS, operation.DELETE);
    this.canCreateUsers = this.isPermitted(true, false, domain.USERS, operation.CREATE);
    this.canEditUsers = this.isPermitted(false, false, domain.USERS, operation.EDIT);
    this.canArchiveProject = this.isPermitted(true, true, domain.PROJECTS, operation.ARCHIVE);
    this.canDeleteProject = this.isPermitted(true, true, domain.PROJECTS, operation.DELETE);
    this.canEditProject = this.isPermitted(false, false, domain.PROJECTS, operation.EDIT);
    this.canEditEntry = this.isPermitted(false, false, domain.ENTRIES, operation.EDIT);
    this.canDeleteEntry = this.isPermitted(false, false, domain.ENTRIES, operation.DELETE);
    this.canComment = this.isPermitted(false, false, domain.COMMENTS, operation.CREATE);
    this.canDeleteComment = this.isPermitted(false, false, domain.COMMENTS, operation.DELETE_OWN, operation.DELETE);
    this.canEditComment = this.isPermitted(false, false, domain.COMMENTS, operation.EDIT_OWN, false);
    this.canUpdateCommentStatus = this.isPermitted(false, false, domain.COMMENTS, operation.EDIT);
  }

  /**
   * This helper returns a function with a boolean return type indicating whether an
   * operation is permitted.
   * @param {boolean} allowArchived - When false, the resulting function will always return false
   * if the project is archived.
   * @param {boolean} projectOwnerAllowed - When this is true and the current project is owned by
   * the current user, the user will be considered to always have permission.
   * @param {RightsFunction} domain - An enum value from sessionService.domain indicating the domain
   * of the operation.
   * @param {RightsFunction} operation - An enum value from sessionService.operation indicating the
   * operation for which the user's permissions should be checked.
   * @param {RightsFunction|boolean} otherUserOperation use this operation if the supplied userId is not the
   * current user.
   * @return {Function<boolean>} - A function that will indicate whether the user is
   * allowed to perform the given operation.
   */
  private isPermitted(allowArchived: boolean, projectOwnerAllowed: boolean, domain: RightsFunction,
                      operation: RightsFunction, otherUserOperation?: RightsFunction | boolean): ConditionFunction {
    return (userId?: string) => {
      if (this.sendReceive.isInProgress()) return false;
      else if (!this.session.project()) return false;
      else if (!allowArchived && this.session.project().isArchived) return false;
      else {
        let hasRight = this.session.hasProjectRight(domain, operation);
        if (otherUserOperation != null && userId != null && this.session.userId() !== userId) {
          if (typeof otherUserOperation === 'boolean') {
            hasRight = otherUserOperation;
          } else {
            hasRight = this.session.hasProjectRight(domain, otherUserOperation);
          }
        }

        // The case where user does not explicitly have a right, but does because user is owner
        if (projectOwnerAllowed) {
          hasRight = hasRight || this.session.project().userIsProjectOwner;
        }

        return hasRight;
      }
    };
  }

}

export class LexiconRightsService {
  // noinspection TypeScriptFieldCanBeMadeReadonly
  private rights: Rights;

  static $inject: string[] = ['sessionService', 'lexSendReceive'];
  constructor(private sessionService: SessionService, private sendReceive: LexiconSendReceiveService) {
    this.rights = new Rights(sessionService.domain, sessionService.operation, sendReceive);
  }

  getRights(): angular.IPromise<Rights> {
    return this.sessionService.getSession().then(session => {
      this.rights.session = session;
      return this.rights;
    });
  }

}
