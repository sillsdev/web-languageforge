import {by, element} from 'protractor';

export class MockUploadElement {
  enableButton = element(by.id('showMockUploadButton'));
  fileNameInput = element(by.id('mockFileName'));
  fileSizeInput = element(by.id('mockFileSize'));
  uploadButton = element(by.id('mockUploadButton'));
}
