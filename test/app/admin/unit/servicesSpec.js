'use strict';

/* See http://www.benlesh.com/2013/06/angular-js-unit-testing-services.html */

describe('service', function() {
  beforeEach(module('myApp.services'));


  describe('version', function() {
    it('should return current version', inject(function(version) {
      expect(version).toEqual('0.1');
    }));
  });
});
