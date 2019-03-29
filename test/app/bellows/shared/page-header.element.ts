import {by, element} from 'protractor';

export class PageHeader {
  myProjects = {
    button: element(by.id('myProjectDropdownButton')),
    links: element(by.id('myProjectDropdownMenu')).all(by.className('dropdown-item'))
  };

  loginButton = element(by.partialButtonText('Login'));

  language = {
    button: element(by.id('languageDropdownButton')),
    links: element(by.id('languageDropdownMenu')).all(by.className('dropdown-item')),
    findItem: (search: string) => this.language.links.filter(elem => elem.getText().then(text => text === search))
  };
}
