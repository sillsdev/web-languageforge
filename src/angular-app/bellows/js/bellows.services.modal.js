'use strict';

angular.module('bellows.services')
  .service('modalService', ['$modal', function ($modal) {
    // Taken from http://weblogs.asp.net/dwahlin/archive/2013/09/18/building-an-angularjs-modal-service.aspx
    var modalDefaults = {
      backdrop: true,
      keyboard: true,
      modalFade: true,
      templateUrl: '/angular-app/bellows/js/modal.html'
    };

    var modalOptions = {
      closeButtonText: 'Close',
      actionButtonText: 'OK',
      headerText: 'Proceed?',
      bodyText: 'Perform this action?'
    };

    this.showModal = function (customModalDefaults, customModalOptions) {
      if (!customModalDefaults) customModalDefaults = {};
      customModalDefaults.backdrop = 'static';
      return this.show(customModalDefaults, customModalOptions);
    };

    this.showModalSimple = function showModalSimple(headerText, messageText, closeButtonText, actionButtonText) {
      var opts = {
        headerText: headerText,
        bodyText: messageText
      };
      if (closeButtonText) opts.closeButtonText = closeButtonText;
      if (actionButtonText) opts.actionButtonText = actionButtonText;
      return this.showModal({}, opts);
    };

    this.showModalSimpleWithCustomTemplate = function showModalSimpleWithCustomTemplate(customTemplateUrl) {
      var opts = {
        customTemplateUrl: customTemplateUrl
      };
      return this.show({ templateUrl: '/angular-app/bellows/js/modalCustomTemplate.html', backdrop: true}, opts);
    };

    this.show = function (customModalDefaults, customModalOptions) {
      // Create temp objects to work with since we're in a singleton service
      var tempModalDefaults = {};
      var tempModalOptions = {};

      // Map angular-ui modal custom defaults to modal defaults defined in service
      angular.extend(tempModalDefaults, modalDefaults, customModalDefaults);

      // Map modal.html $scope custom properties to defaults defined in service
      angular.extend(tempModalOptions, modalOptions, customModalOptions);

      if (!tempModalDefaults.controller) {
        tempModalDefaults.controller = ['$scope', '$modalInstance', function ($scope, $modalInstance) {
          $scope.modalOptions = tempModalOptions;
          $scope.modalOptions.ok = function (result) {
            $modalInstance.close(result);
          };
          $scope.modalOptions.close = function (result) {
            $modalInstance.dismiss('cancel');
          };
        }];
      }

      return $modal.open(tempModalDefaults).result;
    };

  }]);
