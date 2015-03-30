'use strict';

var SfAppFrame = function() {
  
  // TODO: this will likely change when we refactor the display of notifications - cjh 2014-06
  this.message = {
    success: element(by.css('.alert-success')),
    info:    element(by.css('.alert-info')),
    warn:    element(by.css('.alert-warn')),
    error:   element(by.css('.alert-error')),
  };
  // Alternate names for the above
  this.successMessage = this.message.success;
  this.infoMessage    = this.message.info;
  this.warnMessage    = this.message.warn;
  this.errorMessage   = this.message.error;

  this.checkMsg = function(expected, msgType) {
    msgType = msgType || "success";
    expect(this.message[msgType].getText()).toMatch(expected);
  };

};

module.exports = new SfAppFrame();