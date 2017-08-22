'use strict';

angular.module('translate.services')
  .service('translateDocumentApi', ['apiService', function (api) {
    this.updateDocumentSet = api.method('translate_documentSetUpdate');
    this.listDocumentSetsDto = api.method('translate_documentSetListDto');
    this.removeDocumentSet = api.method('translate_documentSetRemove');
  }])

  ;
