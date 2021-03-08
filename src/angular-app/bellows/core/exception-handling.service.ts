import * as angular from 'angular';
import Bugsnag from 'bugsnag-js';
import { Client } from 'bugsnag-js/types/client';

import {websiteInstances} from './website-instances.generated-data';

export class Metadata {
  version: string;
  userId: string;
  userName: string;
  projectCode?: string;
  projectName: string;
}

export class ExceptionHandlingService {

  private metadata: Metadata = null;
  private bugsnagClient: Client;

  static $inject: string[] = ['$log'];
  constructor(private $log: angular.ILogService) {
    // process.env.* are set in webpack.config.js
    this.bugsnagClient = Bugsnag({
      apiKey: process.env.XFORGE_BUGSNAG_API_KEY,
      notifyReleaseStages: process.env.NOTIFY_RELEASE_STAGES,
      releaseStage: this.getReleaseStage()
    });
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
      this.$log.error('Error: ' + exception.message ? exception.message : exception + ' (reported to Bugsnag)');
    } else {
      this.$log.error('Error: ' + exception.message ? exception.message : exception + '; caused by: ' + cause + ' (reported to Bugsnag)');
    }

    this.notifyBugsnag(exception, cause);
  }

  private notifyBugsnag(exception: Error, cause?: string) {
    if (this.metadata != null && this.metadata.userName != null && this.metadata.userName.startsWith('test_runner_')) {
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
            projectName: this.metadata.projectName,
            version: this.metadata.version,
            type: 'angular'
          });
        }
        if (cause != null) {
          report.updateMetaData('angular', 'cause', {cause});
        }
      }
    });
  }

  private getReleaseStage(): string {
    return websiteInstances[location.hostname] ? websiteInstances[location.hostname] : 'local';
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
