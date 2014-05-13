'use strict';

var SfActivity = function() {
	// Get Questions page to add/edit/delete answers and comments
	this.getQuestion = function() {
		this.questionURL = browser.baseUrl ;
		
		browser.driver.get(this.questionURL);
	}
	
	// Select a specific object from the row of selections [texts / questions]
	this.selectObj = function(type) {
		var columnParam;
		var expectedValue;
		var repeaterKey;
		
		if (type == 'text') {
			columnParam   = '{{text.title}}';
			expectedValue = 'Chapter 3';
			repeaterKey   = 'text in visibleTexts';
		} else if (type == 'question') {
			columnParam   = '{{question.calculatedTitle}}';
			expectedValue = 'Who is speaking?';
			repeaterKey   = 'question in visibleQuestions'
		};
		
		// Choose the object from the list
		var rows = element.all(by.repeater(repeaterKey).column(columnParam));
		var foundLink;
		rows.map(function(column) {
			column.getText().then(function(value) {
				if (value === expectedValue) {
					//textColumn.getOuterHtml().then(console.log);
					foundLink = column.findElement(by.xpath('ancestor::a'));
				};
			});
		}).then(function() {
			// expect a value to be found
			//	expect(foundLink.isPresent()).toBeTruthy();
			foundLink.getAttribute('href').then(function(url) {
				browser.get(url);
			});
		});
	}
	
	// Get Activity feed
	this.getActivity = function() {
		this.activityURL = browser.baseUrl + '/app/activity';

		browser.driver.get(this.activityURL);
	}
};

describe('E2E testing: User Activity page', function() {
	var sfUserActivity = new SfActivity();
	
	var SfLoginPage = require('../../../pages/loginPage');
	var loginPage   = new SfLoginPage();
	
	var SfProjPage  = require('../../../pages/projectsPage');
	var projPage    = new SfProjPage();
	
	var constants   = require('../../../../testConstants');

	loginPage.loginAsUser();
	
	it('should display user\'s activity', function() {
		projPage.get();
		projPage.findProject('test_project').then(function(projectRow) {
			var link = projectRow.$('a');
			link.getAttribute('href').then(function(url) {
				browser.get(url);
			});
			
			// Select the text and question according to role
			sfUserActivity.selectObj('text');
			sfUserActivity.selectObj('question');
			
		});
		

	});

});
