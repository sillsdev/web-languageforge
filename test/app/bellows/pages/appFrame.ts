import {by, element} from 'protractor';

export class SfAppFrame {

  // TODO: this will likely change when we refactor the display of notifications - cjh 2014-06
  message = {
    success: element(by.css('.alert-success')),
    info:    element(by.css('.alert-info')),
    warn:    element(by.css('.alert-warning')),
    error:   element.all(by.css('.alert-danger')).first()
  };

  // Alternate names for the above
  successMessage = this.message.success;
  infoMessage    = this.message.info;
  warnMessage    = this.message.warn;
  errorMessage   = this.message.error;

  checkMsg(expected: string, msgType: string) {
    msgType = msgType || 'success';
    expect(this.message[msgType].getText()).toMatch(expected);
  }

}
