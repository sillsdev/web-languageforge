'use strict';

var PageHeader = function() {
	
	this.myProjects = {
		button:		element(by.id('myProjects')),
		links:		element(by.id('myProjects')).all(by.css('ul li'))
	};
	
	this.loginButton = element(by.partialButtonText('Login'));

};

module.exports = new PageHeader();
