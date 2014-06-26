'use strict';

var SfProjectPage = function() {
	this.urlprefix = '/app/sfchecks';
	
	this.testData = {
			simpleUsx1 : '<usx version="2.0"> <chapter number="1" style="c" /> <verse number="1" style="v" /> <para style="q1">Blessed is the man</para> <para style="q2">who does not walk in the counsel of the wicked</para> <para style="q1">or stand in the way of sinners</para> </usx>',
			longUsx1   : '<?xml version="1.0" encoding="utf-8"?> <usx version="2.0"> <book code="JHN" style="id">43-JHN-kjv.sfm The King James Version of the Holy Bible Wednesday, October 14, 2009</book> <para style="ide">UTF-8</para> <para style="h">John</para> <para style="mt">The Gospel According to St. John</para> <chapter number="1" style="c" /> <para style="p"> <verse number="1" style="v" />In the beginning was the Word, and the Word was with God, and the Word was God. <verse number="2" style="v" />The same was in the beginning with God. <verse number="3" style="v" />All things were made by him; and without him was not any thing made that was made. <verse number="4" style="v" />In him was life; and the life was the light of men. <verse number="5" style="v" />And the light shineth in darkness; and the darkness comprehended it not.</para> <para style="p" /> <chapter number="2" style="c" /> <para style="p"> <verse number="1" style="v" />And the third day there was a marriage in Cana of Galilee; and the mother of Jesus was there: <verse number="2" style="v" />And both Jesus was called, and his disciples, to the marriage. <verse number="3" style="v" />And when they wanted wine, the mother of Jesus saith unto him, They have no wine. <verse number="4" style="v" />Jesus saith unto her, <char style="wj">Woman, what have I to do with thee? mine hour is not yet come. </char> <verse number="5" style="v" />His mother saith unto the servants, Whatsoever he saith unto you, do <char style="add">it. </char> <verse number="6" style="v" />And there were set there six waterpots of stone, after the manner of the purifying of the Jews, containing two or three firkins apiece.  </para> </usx>'
	};

	this.textLink = function(title) {
		return element(by.linkText(title));
	};
	
	this.textNames = element.all(by.repeater('text in visibleTexts').column('title'));
	this.textList = element.all(by.repeater('text in visibleTexts'));
	
	// getFirstCheckbox has to be a function because the .first() method will actually resolve the finder
	this.getFirstCheckbox = function() {
		return this.textList.first().findElement(by.css('input[type="checkbox"]'));
	};

	// Invite-a-friend feature
	this.invite = {
		showFormButton: element(by.partialButtonText('Invite a Friend')),
		emailInput:     element(by.model('email')),
		sendButton:     element(by.partialButtonText('Send Now')),
	};

	this.settingsButton = element(by.id('projectSettingsButton'));
	this.archiveTextButton = element(by.partialButtonText('Archive Texts'));

	this.newText = {
		showFormButton:	element(by.partialButtonText('Add New Text')),
		form:			element(by.name('newTextForm')),
		title:			element(by.model('title')),
		usx:			element(by.model('content')),
		saveButton:		element(by.css('form[name="newTextForm"]')).element(by.partialButtonText('Save')),
		verseRangeLink:	element(by.linkText('Select limited verse range')),
		fromChapter:	element(by.model('startCh')),
		fromVerse:		element(by.model('startVs')),
		toChapter:		element(by.model('endCh')),
		toVerse:		element(by.model('endVs')),
	};
	
	this.addNewText = function(title, usx) {
		expect(this.newText.showFormButton.isDisplayed()).toBe(true);
		this.newText.showFormButton.click();
		this.newText.title.sendKeys(title);
		this.newText.usx.sendKeys(usx);
		this.newText.saveButton.click();
	};
	
	this.clickOnProjectSettings = function() {
		element(by.id('projectSettingsButton')).click();
	};
};

module.exports = new SfProjectPage();
