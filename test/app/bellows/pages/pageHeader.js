'use strict';

module.exports = new PageHeader();

function PageHeader() {
  this.myProjects = {
    button:    element(by.id('myProjectDropdown')),
    links:    element(by.id('myProjectDropdown')).all(by.css('ul li'))
  };

  this.loginButton = element(by.partialButtonText('Login'));
}
