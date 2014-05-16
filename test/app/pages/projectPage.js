'use strict';

var SfProjectPage = function() {
	this.urlprefix = '/app/sfchecks';
	
	this.testData = {
			simpleUsx1 : '<usx version="2.0"> <chapter number="1" style="c" /> <verse number="1" style="v" /> <para style="q1">Blessed is the man</para> <para style="q2">who does not walk in the counsel of the wicked</para> <para style="q1">or stand in the way of sinners</para> </usx>'
	};
	
	

	this.get = function(projectId) {
		browser.get(this.urlprefix + '#/p/' + projectId);
	};
	
	this.clickOnText = function(textTitle) {
		element(by.linkText(textTitle)).click();
	};
	
	this.textNames = element.all(by.repeater('text in visibleTexts').column('title'));
	this.newText = {
		showFormButton: element(by.partialButtonText('Add New Text')),
		form: element(by.name('newTextForm')),
		title: element(by.model('title')),
		usx: element(by.model('content'))
	};
	
	this.addNewText = function(title, usx) {
		expect(this.newText.showFormButton.isDisplayed()).toBe(true);
		this.newText.showFormButton.click();
		browser.driver.sleep(500); // wait for animation to finish
		this.newText.title.sendKeys(title);
		this.newText.usx.sendKeys(usx);
		this.form.submit();
	};
	
	this.clickOnProjectSettings = function() {
		element(by.id('projectSettingsButton')).click();
	};
	
};

module.exports = new SfProjectPage();