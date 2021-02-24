import {browser, by, element} from 'protractor';
import {ElementFinder} from 'protractor/built/element';

// This object handles the activity page and provides methods to access items in the activity list
export class SfActivityPage {
  activityURL = '/app/activity';
  activitiesList = element.all(by.className('activity-content'));
  activityGroups = element.all(by.className('activity-user-group'));
  filterByUser = element(by.id('filter_by_user'));

  // Navigate to the Activity page
  get() {
    return browser.get(browser.baseUrl + this.activityURL);
  }

  clickOnAllActivity() {
    return this.filterByUser.element(by.css('option:nth-child(1)')).click();
  }

  clickOnShowOnlyMyActivity() {
    return this.filterByUser.element(by.css('option:nth-child(2)')).click();
  }

  // Returns the number of items in the activity list
  //noinspection JSUnusedGlobalSymbols
  getLength() {
    return this.activitiesList.count();
  }

  // Returns the text in the activity list for a specified index
  getActivityText(index: number) {
    return this.activitiesList.get(index).getText();
  }

  getAllActivityTexts() {
    return this.activitiesList.map((elem: ElementFinder) => elem.getText());
  }

  getActivityGroup(index: number) {
    return SfActivityPage.getPartsOfActivity(this.activityGroups.get(index));
  }

  // Prints the entire activity list
  //noinspection JSUnusedGlobalSymbols
  printActivitiesNames() {
    return (this.activitiesList).each((names: ElementFinder) => {
      names.getText().then(console.log);
    });
  }

  static getPartsOfActivity(div: ElementFinder) {
    return {
      activity: div,
      user: div.element(by.className('activity-username')).getText(),
      activities: div.all(by.className('activity-content')).map((elem: ElementFinder) => elem.getText())
    };
  }
}
