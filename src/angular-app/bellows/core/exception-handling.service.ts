import * as angular from 'angular';
import Bugsnag from 'bugsnag-js';
import { Client } from 'bugsnag-js/types/client';

export class Metadata {
  userId: string;
  userName: string;
  projectCode?: string;
  projectName: string;
}

export class ExceptionHandlingService {

  private bugsnagClient: Client;
  private metadata: Metadata;

  static $inject: string[] = ['$log'];
  constructor(private $log: angular.ILogService) {
    this.bugsnagClient = Bugsnag({ apiKey: '0ac621681992952c356d54bc01d529b1' });
  }

  updateInformation(metaData: Metadata) {
    this.metadata = metaData;
  }

  reportError(message: string, cause?: string) {
    this.reportException(new Error(message), cause);
  }

  reportException(exception: Error, cause?: string) {
    // We assume this error has been already reported to the user by calling ErrorService.notify
    this.notifyBugsnag(exception, cause);
  }

  reportUnhandledException(exception: Error, cause?: string) {
    if (cause == null) {
      this.$log.error('Error: ' + exception.message + ' (reported to Bugsnag)');
    } else {
      this.$log.error('Error: ' + exception.message + '; caused by: ' + cause + ' (reported to Bugsnag)');
    }

    this.notifyBugsnag(exception, cause);
  }

  private notifyBugsnag(exception: Error, cause?: string) {
    if (this.metadata.userName.startsWith('test_runner_')) {
      // running unit tests
      return;
    }

    this.bugsnagClient.notify(exception, {
      beforeSend: report => {
        if (this.metadata != null) {
          report.user = {
            id: this.metadata.userId,
            name: this.metadata.userName
          };
          report.updateMetaData('App', {
            projectCode: this.metadata.projectCode,
            projectName: this.metadata.projectName
          });
        }
        if (cause != null) {
          report.updateMetaData('angular', 'cause', {cause});
        }
      }
    });
  }
}

export const ExceptionOverrideModule = angular
  .module('exceptionOverride', [ ])
  .service('exceptionHandler', ExceptionHandlingService)
  .factory('$exceptionHandler', ['$log', 'exceptionHandler', ($log: angular.ILogService,
                                                              exceptionHandler: ExceptionHandlingService) => {
    return (exception: Error, cause?: string) => exceptionHandler.reportUnhandledException(exception, cause);
  }])
  .name;
