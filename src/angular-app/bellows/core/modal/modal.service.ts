import * as angular from 'angular';

export interface ModalService extends angular.ui.bootstrap.IModalService {
  showModalSimple(headerText: string, messageText: string, closeButtonText?: string,
                  actionButtonText?: string): angular.IPromise<any>;
  showModal(customModalDefaults: angular.ui.bootstrap.IModalSettings,
            customModalOptions: ModalOptions): angular.IPromise<any>;
  showModalSimpleWithCustomTemplate(customTemplateUrl: string): angular.IPromise<any>;
  show(customModalDefaults: angular.ui.bootstrap.IModalSettings, customModalOptions: ModalOptions):
    angular.IPromise<any>;
}

export class ModalOptions {
  closeButtonText?: string;
  actionButtonText?: string;
  headerText?: string;
  bodyText?: string;
  ok?: (result: any) => void;
  close?: () => void;
}

interface ShowControllerScope extends angular.IScope {
  modalOptions?: ModalOptions;
}

export function ModalService($uibModal: angular.ui.bootstrap.IModalProvider) {
  angular.extend(this, $uibModal);

  // http://weblogs.asp.net/dwahlin/archive/2013/09/18/building-an-angularjs-modal-service.aspx
  const modalDefaults = {
    backdrop: true,
    keyboard: true,
    modalFade: true,
    templateUrl: '/angular-app/bellows/core/modal/modal.html'
  };

  const modalOptions: ModalOptions = {
    closeButtonText: 'Close',
    actionButtonText: 'OK',
    headerText: 'Proceed?',
    bodyText: 'Perform this action?'
  };

  this.showModalSimple = function showModalSimple(headerText: string, messageText: string,
                                                  closeButtonText?: string,
                                                  actionButtonText?: string): angular.IPromise<any> {
    const options: ModalOptions = {
      headerText: headerText,
      bodyText: messageText
    };
    if (closeButtonText) options.closeButtonText = closeButtonText;
    if (actionButtonText) options.actionButtonText = actionButtonText;
    return this.showModal({}, options);
  };

  this.showModal = function showModal(customModalDefaults: angular.ui.bootstrap.IModalSettings,
                                      customModalOptions: ModalOptions): angular.IPromise<any> {
    if (!customModalDefaults) customModalDefaults = {};
    customModalDefaults.backdrop = 'static';
    return this.show(customModalDefaults, customModalOptions);
  };

  this.showModalSimpleWithCustomTemplate =
    function showModalSimpleWithCustomTemplate(customTemplateUrl: string): angular.IPromise<any> {
      const opts = {
        customTemplateUrl: customTemplateUrl
      };
      return this.show({
          templateUrl: '/angular-app/bellows/core/modal/modal-custom-template.html',
          backdrop: true
        }, opts);
    };

  this.show = function (customModalDefaults: angular.ui.bootstrap.IModalSettings,
                        customModalOptions: ModalOptions): angular.IPromise<any> {
    // Create temp objects to work with since we're in a singleton service
    let tempModalDefaults: angular.ui.bootstrap.IModalSettings = {};
    let tempModalOptions: ModalOptions = {};

    // Map angular-ui modal custom defaults to modal defaults defined in service
    angular.extend(tempModalDefaults, modalDefaults, customModalDefaults);

    // Map modal.html $scope custom properties to defaults defined in service
    angular.extend(tempModalOptions, modalOptions, customModalOptions);

    if (!tempModalDefaults.controller) {
      tempModalDefaults.controller = ['$scope', '$uibModalInstance',
        function ($scope: ShowControllerScope,
                  $modalInstance: angular.ui.bootstrap.IModalInstanceService) {
          $scope.modalOptions = tempModalOptions;
          $scope.modalOptions.ok = function (result: any) {
            $modalInstance.close(result);
          };

          $scope.modalOptions.close = function () {
            $modalInstance.dismiss('cancel');
          };
        }
      ];
    }

    return this.open(tempModalDefaults).result;
  };

}
