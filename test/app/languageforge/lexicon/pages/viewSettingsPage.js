'use strict';

module.exports = new ViewSettingsPage();

function ViewSettingsPage() {
  var expectedCondition = protractor.ExpectedConditions;
  var CONDITION_TIMEOUT = 3000;

  this.settingsMenuLink = element(by.id('settingsDropdownButton'));
  this.viewSettingsLink = element(by.id('dropdown-view-settings'));
  this.get = function get() {
    browser.wait(expectedCondition.visibilityOf(this.settingsMenuLink), CONDITION_TIMEOUT);
    this.settingsMenuLink.click();
    browser.wait(expectedCondition.visibilityOf(this.viewSettingsLink), CONDITION_TIMEOUT);
    this.viewSettingsLink.click();
  };

  this.tabDivs = element.all(by.repeater('tab in tabs'));
  this.applyButton = element(by.id('view-settings-apply-btn'));

  this.getTabByName = function getTabByName(tabName) {
    return element(by.css('ul.nav.nav-tabs')).element(by.partialLinkText(tabName));
  };

  this.tabs = {
    observer: {
      go: function () {
        this.getTabByName('Observer').click();
      }.bind(this)
    },
    contributor: {
      go: function () {
        this.getTabByName('Contributor').click();
      }.bind(this)
    },
    manager: {
      // Might want better way to access this button, maybe Chris will know
      showAllFieldsBtn: this.tabDivs.get(3).element(by.buttonText('Show All Fields')),
      go: function () {
        this.getTabByName('Manager').click();
      }.bind(this)
    }
  };

  this.activePane = element(by.css('div.tab-pane.ng-scope.active'));

  this.accordionDiv = this.activePane.element(by.css('uib-accordion'));
  this.accordionEnabledFields = this.accordionDiv
    .element(by.css('a.accordion-toggle'));

  //noinspection JSUnusedGlobalSymbols
  this.accordionEnabledTasks = this.accordionDiv
    .element(by.elemMatches('div.accordion-heading a', '^Enabled Tasks'));

  //noinspection JSUnusedGlobalSymbols
  this.entryFields = this.activePane.all(by.repeater('fieldName in fieldOrder.entry'));

  //noinspection JSUnusedGlobalSymbols
  this.senseFields = this.activePane.all(by.repeater('fieldName in fieldOrder.senses'));

  //noinspection JSUnusedGlobalSymbols
  this.exampleFields = this.activePane.all(by.repeater('fieldName in fieldOrder.examples'));

  /** Second parameter is optional, default false. If true, fieldName will be considered
   * a regular expression that should not be touched. If false or unspecified, fieldName
   * will be considered an exact match (so "Etymology" should not match "Etymology Comment").
   */
  this.getFieldByName = function getFieldByName(fieldName, treatAsRegex) {
    var fieldRegex = (treatAsRegex ? fieldName : '^' + fieldName + '$');
    return element(by.css('div.tab-pane.active dl.picklists'))
      .element(by.elemMatches('div[data-ng-repeat]', fieldRegex));
  };

  this.getFieldByNameIconClass = function getFieldByNameIconClass(fieldName, treatAsRegex) {
    return this.getFieldByName(fieldName, treatAsRegex).element(by.css('i')).getAttribute('class');
  };

  this.showField = this.activePane.element(by.id('showFieldCheckbox'));
  this.overrideInputSystems = this.activePane.element(by.id('overrideInputSystemCheckbox'));

  this.usersWithViewSettings = this.activePane.element(by.id('userSelectList'));
  this.addViewSettingsForMember = function addViewSettingsForMember(memberName) {
    this.activePane.element(by.id('typeaheadInput')).sendKeys(memberName);
    this.activePane.element(by.id('typeaheadInput')).sendKeys(protractor.Key.ENTER);

    // Trying to click by name in the typeahead is flaky because the list visibility depends
    // where the mouse happens to be hovering.  Just directly add the name
    //this.activePane.element(by.css('div.typeahead')).all(by.repeater('user in typeahead.users'))
    //  .first().click();
    this.activePane.element(by.id('view-settings-add-member-btn')).click();
  };

  this.pickMemberWithViewSettings = function pickMemberWithViewSettings(memberName) {
    this.usersWithViewSettings
      .element(by.elemMatches('div.picklists > ul.list-unstyled > li', memberName)).click();
  };

  //noinspection JSUnusedGlobalSymbols
  this.selectMemberBtn = this.activePane.element(by.id('view-settings-select-member-btn'));

  //noinspection JSUnusedGlobalSymbols
  this.removeMemberViewSettingsBtn = this.activePane.element(by.id('view-settings-remove-member-btn'));
}
