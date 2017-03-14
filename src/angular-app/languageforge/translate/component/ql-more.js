'use strict';

angular.module('translate.quill')
  .component('qlMore', {
    templateUrl: '/angular-app/languageforge/translate/component/ql-more.html',
    bindings: {
      qlStatus: '<',
      qlStatusOptions: '<',
      qlChangeStatus: '&'
    },
    controller: [function () {
      this.selectChange = function selectChange(optionKey) {
        (this.qlChangeStatus || angular.noop)({ optionKey: optionKey });
      };
    }]
  })

  ;
