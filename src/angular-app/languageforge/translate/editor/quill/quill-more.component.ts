import * as angular from 'angular';

export const QuillMoreComponent = {
  bindings: {
    qlStatus: '<',
    qlStatusOptions: '<',
    qlChangeStatus: '&'
  },
  templateUrl: '/angular-app/languageforge/translate/editor/quill/quill-more.component.html',
  controller: [function () {
    this.qlStatus = this.qlStatus || 0;

    this.selectChange = (optionKey: number) => {
      (this.qlChangeStatus || angular.noop)({ optionKey: optionKey });
    };
  }]
};
