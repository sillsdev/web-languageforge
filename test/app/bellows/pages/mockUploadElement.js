'use strict';

var MockUploadElement = function() {

  this.enableButton = element(by.id('showMockUploadButton'));
  this.fileNameInput = element(by.id('mockFileName'));
  this.fileSizeInput = element(by.id('mockFileSize'));
  this.uploadButton = element(by.id('mockUploadButton'));
  
};

module.exports = new MockUploadElement();
