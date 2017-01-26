'use strict';

module.exports = new PageHeader();

function PageHeader() {
  this.myProjects = {
    button:    element(by.id('myProjectDropdown')),
    links:    element(by.className('dropdown-menu')).all(by.className('dropdown-item'))
  };

  this.loginButton = element(by.partialButtonText('Login'));
}
