'use strict';

var PageHeader = function() {
	
	this.myProjects = {
		button:		element(by.id('myProjects')),
		links:		element(by.id('myProjects')).element.all(by.css('ul li'))
	};

};

module.exports = new PageHeader();
