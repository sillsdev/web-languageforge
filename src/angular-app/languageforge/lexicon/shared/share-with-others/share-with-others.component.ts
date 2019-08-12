import * as angular from 'angular';

export class ShareWithOthersModalInstanceController implements angular.IController {
  modalInstance: any;

  constructor() {}

  $onInit() {
  }
}

export const ShareWithOthersComponent: angular.IComponentOptions = {
  bindings: {
    modalInstance: '<',
    close: '&',
    dismiss: '&'
  },
  controller: ShareWithOthersModalInstanceController,
  templateUrl: '/angular-app/languageforge/lexicon/shared/share-with-others/share-with-others.modal.html'
};
