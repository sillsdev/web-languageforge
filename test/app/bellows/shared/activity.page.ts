import {browser, by, element} from 'protractor';
import {ElementFinder} from 'protractor/built/element';

// This object handles the activity page and provides methods to access items in the activity list
export class SfActivityPage {
  activityURL = '/app/activity';
  activitiesList = element.all(by.repeater('item in $ctrl.filteredActivities'));

  // Navigate to the Activity page
  async get() {
    await browser.driver.get(browser.baseUrl + this.activityURL);
  }

  static async clickOnAllActivity() {
    await element(by.id('activity-showAllActivityButton')).click();
  }

  static async clickOnShowOnlyMyActivity() {
    await element(by.id('activity-showOnlyMyActivityButton')).click();
  }

  // Returns the number of items in the activity list
  //noinspection JSUnusedGlobalSymbols
  async getLength() {
    return await this.activitiesList.count();
  }

  // Returns the text in the activity list for a specified index
  async getActivityText(index: number) {
    return await this.activitiesList.get(index).getText();
  }

  async getAllActivityTexts() {
    return await this.activitiesList.map((elem: ElementFinder) => elem.getText());
  }

  // Prints the entire activity list
  //noinspection JSUnusedGlobalSymbols
  async printActivitiesNames() {
    (this.activitiesList).each(async(names: ElementFinder) => {
      await names.getText().then(console.log);
    });
  }
}
