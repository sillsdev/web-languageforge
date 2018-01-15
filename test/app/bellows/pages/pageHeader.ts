import {browser, element, by, By, $, $$, ExpectedConditions} from 'protractor';


export class PageHeader {
  myProjects = {
    button:    element(by.id('myProjectDropdown')),
    links:    element(by.className('dropdown-menu')).all(by.className('dropdown-item'))
  }

  loginButton = element(by.partialButtonText('Login'));
}
