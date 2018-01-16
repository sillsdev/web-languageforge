import {browser, element, by, By, $, $$, ExpectedConditions, Key} from 'protractor';

class ViewSettingsPage {
  private readonly CONDITION_TIMEOUT = 3000;

  settingsMenuLink = element(by.id('settingsDropdownButton'));
  viewSettingsLink = element(by.id('dropdown-view-settings'));
  get() {
    browser.wait(ExpectedConditions.visibilityOf(this.settingsMenuLink), this.CONDITION_TIMEOUT);
    this.settingsMenuLink.click();
    browser.wait(ExpectedConditions.visibilityOf(this.viewSettingsLink), this.CONDITION_TIMEOUT);
    this.viewSettingsLink.click();
  };

  tabDivs = element.all(by.repeater('tab in tabs'));
  applyButton = element(by.id('view-settings-apply-btn'));

  getTabByName(tabName: string) {
    return element(by.css('ul.nav.nav-tabs')).element(by.partialLinkText(tabName));
  };

  tabs = {
    observer: {
      go() {
        this.getTabByName('Observer').click();
      }
    },
    contributor: {
      go() {
        this.getTabByName('Contributor').click();
      }
    },
    manager: {
      // unsure if there is a better way to access this button - Mark W 2018-01-11
      showAllFieldsBtn: this.tabDivs.get(3).element(by.buttonText('Show All Fields')),
      go() {
        this.getTabByName('Manager').click();
      }
    }
  };

  activePane = element(by.css('div.tab-pane.ng-scope.active'));

  accordionDiv = this.activePane.element(by.css('uib-accordion'));
  accordionEnabledFields = this.accordionDiv
    .element(by.css('a.accordion-toggle'));

  //noinspection JSUnusedGlobalSymbols
  accordionEnabledTasks = this.accordionDiv
    .element(by.elemMatches('div.accordion-heading a', '^Enabled Tasks'));

  //noinspection JSUnusedGlobalSymbols
  entryFields = this.activePane.all(by.repeater('fieldName in fieldOrder.entry'));

  //noinspection JSUnusedGlobalSymbols
  senseFields = this.activePane.all(by.repeater('fieldName in fieldOrder.senses'));

  //noinspection JSUnusedGlobalSymbols
  exampleFields = this.activePane.all(by.repeater('fieldName in fieldOrder.examples'));

  /** Second parameter is optional, default false. If true, fieldName will be considered
   * a regular expression that should not be touched. If false or unspecified, fieldName
   * will be considered an exact match (so "Etymology" should not match "Etymology Comment").
   */
  getFieldByName(fieldName: string, treatAsRegex: boolean) {
    var fieldRegex = (treatAsRegex ? fieldName : '^' + fieldName + '$');
    return element(by.css('div.tab-pane.active dl.picklists'))
      .element(by.elemMatches('div[data-ng-repeat]', fieldRegex));
  };

  getFieldByNameIconClass(fieldName: string, treatAsRegex: boolean) {
    return this.getFieldByName(fieldName, treatAsRegex).element(by.css('i')).getAttribute('class');
  };

  showField = this.activePane.element(by.id('showFieldCheckbox'));
  overrideInputSystems = this.activePane.element(by.id('overrideInputSystemCheckbox'));

  usersWithViewSettings = this.activePane.element(by.id('userSelectList'));
  addViewSettingsForMember(memberName: string) {
    this.activePane.element(by.id('typeaheadInput')).sendKeys(memberName);
    this.activePane.element(by.id('typeaheadInput')).sendKeys(Key.ENTER);

    // Trying to click by name in the typeahead is flaky because the list visibility depends
    // where the mouse happens to be hovering.  Just directly add the name
    //this.activePane.element(by.css('div.typeahead')).all(by.repeater('user in typeahead.users'))
    //  .first().click();
    this.activePane.element(by.id('view-settings-add-member-btn')).click();
  };

  pickMemberWithViewSettings(memberName: string) {
    this.usersWithViewSettings
      .element(by.elemMatches('div.picklists > ul.list-unstyled > li', memberName)).click();
  };

  //noinspection JSUnusedGlobalSymbols
  selectMemberBtn = this.activePane.element(by.id('view-settings-select-member-btn'));

  //noinspection JSUnusedGlobalSymbols
  removeMemberViewSettingsBtn = this.activePane.element(by.id('view-settings-remove-member-btn'));
}

module.exports = new ViewSettingsPage();
