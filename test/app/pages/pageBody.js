'use strict';

var PageBody = function() {
	this.phpError = element(by.xpath("//*[contains(.,'A PHP Error was encountered')]"));
};

module.exports = new PageBody();