'use strict';

angular.module('translate.services')
  .service('translateDocumentApi', ['jsonRpc', function (jsonRpc) {
    jsonRpc.connect('/api/sf');

    this.updateDocumentSet = function updateDocumentSet(documentSet, callback) {
      jsonRpc.call('translate_documentSetUpdate', [documentSet], callback);
    };

    this.listDocumentSetsDto = function listDocumentSetsDto(callback) {
      jsonRpc.call('translate_documentSetListDto', [], callback);
    };

    this.removeDocumentSet = function removeDocumentSet(documentSetId, callback) {
      jsonRpc.call('translate_documentSetRemove', [documentSetId], callback);
    };

  }])

  ;
