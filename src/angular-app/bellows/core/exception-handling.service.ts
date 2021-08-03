import * as angular from 'angular';

export class ExceptionHandlingService {

  static $inject: string[] = ['$log'];
  constructor(private $log: angular.ILogService) {
  }

  reportUnhandledException(exception: Error, cause?: string) {
    if (cause == null) {
      this.$log.error('Error: ' + exception.message ? exception.message : exception);
    } else {
      this.$log.error('Error: ' + exception.message ? exception.message : exception + '; caused by: ' + cause);
    }
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
