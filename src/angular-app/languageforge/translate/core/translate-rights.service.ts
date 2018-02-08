import * as angular from 'angular';

import { Domains, Operations, RightsFunction, Session, SessionService } from '../../../bellows/core/session.service';
import { TranslateSendReceiveService } from './translate-send-receive.service';

export class TranslateRights {
  session: Session;

  canRemoveUsers(): boolean {
    return this.isPermitted(true, this.domain.USERS, this.operation.DELETE);
  }

  canCreateUsers(): boolean {
    return this.isPermitted(true, this.domain.USERS, this.operation.CREATE);
  }

  canEditUsers(): boolean {
    return this.isPermitted(false, this.domain.USERS, this.operation.EDIT);
  }

  canArchiveProject(): boolean {
    return this.isPermitted(true, this.domain.PROJECTS, this.operation.ARCHIVE, true);
  }

  canDeleteProject(): boolean {
    return this.isPermitted(true, this.domain.PROJECTS, this.operation.DELETE, true);
  }

  canEditProject(): boolean {
    return this.isPermitted(false, this.domain.PROJECTS, this.operation.EDIT);
  }

  canEditEntry(): boolean {
    return this.isPermitted(false, this.domain.ENTRIES, this.operation.EDIT);
  }

  canDeleteEntry(): boolean {
    return this.isPermitted(false, this.domain.ENTRIES, this.operation.DELETE);
  }

  canComment(): boolean {
    return this.isPermitted(false, this.domain.COMMENTS, this.operation.CREATE);
  }

  constructor(private readonly domain: Domains, private readonly operation: Operations,
              private readonly sendReceiveService: TranslateSendReceiveService) {
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
   * @return {boolean} - indicates whether the user is allowed to perform the given operation.
   */
  private isPermitted(allowArchived: boolean, domain: RightsFunction, operation: RightsFunction,
                      projectOwnerAllowed: boolean = false): boolean {
    if (this.sendReceiveService.isInProgress) return false;
    else if (!this.session.project()) return false;
    else if (!allowArchived && this.session.project().isArchived) return false;
    else {
      let hasRight = this.session.hasProjectRight(domain, operation);

      // The case where user does not explicitly have a right, but does because user is owner
      if (projectOwnerAllowed) hasRight = hasRight || this.session.project().userIsProjectOwner;
      return hasRight;
    }
  }
}

export class TranslateRightsService {
  private rights: TranslateRights;

  static $inject: string[] = ['sessionService', 'translateSendReceiveService'];
  constructor(private readonly sessionService: SessionService, sendReceiveService: TranslateSendReceiveService) {
    this.rights = new TranslateRights(sessionService.domain, sessionService.operation, sendReceiveService);
  }

  getRights(): angular.IPromise<TranslateRights> {
    return this.sessionService.getSession().then(session => {
      this.rights.session = session;
      return this.rights;
    });
  }
}
