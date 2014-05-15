'use strict';

var constants   = require('../../../../testConstants');

var SfActivity = function() {
	this.devElement = by.id('comments'); // Using ID "Comments" for Questions
	//this.newAnswer  = by.model('newAnswer.content');
	this.newComment = by.model('newComment.content');
	this.done       = by.id('doneBtn'); 
	
	// Select a specific object from the row of selections [texts / questions]
	this.selectObj = function(type) {
		var columnParam;
		var expectedValue;
		var repeaterKey;
		
		switch(type) {
		case 'text':
			columnParam   = '{{text.title}}';
			expectedValue = 'Chapter 3';
			repeaterKey   = 'text in visibleTexts';
			break;
		case 'question':
			columnParam   = '{{question.calculatedTitle}}';
			expectedValue = 'Who is speaking?';
			repeaterKey   = 'question in visibleQuestions';
			break;
		case 'comments':
			columnParam   = ''; //'{{comment.content}} - {{comment.userRef.username}} - {{comment.dateCreated | date:mediumdate}}';
			expectedValue = 'I dont know';
			repeaterKey   = 'comment in answer.comments';
			break;
		default :
			console.log('activity E2E: Unexpectedly looking for type ' + type);
			return;
		};
		
		// Choose the object from the list
		var rows = element.all(by.repeater(repeaterKey).column(columnParam));
		var foundLink;
		rows.map(function(column) {
			column.getText().then(function(value) {
				if (type == 'comments') {
					console.log('Comment loop: ' + column.getText());
					
				};
				
				if (value === expectedValue) {
					//textColumn.getOuterHtml().then(console.log);
					foundLink = column.findElement(by.xpath('ancestor::a'));
				};
			});
		}).then(function() {
			// expect a value to be found
			//	expect(foundLink.isPresent()).toBeTruthy();
			foundLink.getAttribute('href').then(function(url) {
				//console.log('Going to ' + url);
				browser.get(url);
			});
//		}).then(function() {
//			browser.sleep(8000);
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
	var newAnswerText  = 'Beethoven was the speaker.  ' + new Date();
	var newCommentText = 'This comment is added by test_runner_normal_user';
	
	var SfLoginPage = require('../../../pages/loginPage');
	var loginPage   = new SfLoginPage();
	
	var SfProjPage  = require('../../../pages/projectsPage');
	var projPage    = new SfProjPage();
	
	var answerPage  = require('../../../pages/answerPage');
	var commentPage = require('../../../pages/commentPage');
	
	loginPage.loginAsUser();
	
	it('should display user\'s activity', function() {
		// Perform some actions to populate the activity feed
		

		// TODO: Goal is to follow this flow
		projPage.get();
		projPage.clickOnProject('test_project');
//		textPage = new require('textPage');
//		textPage.clickOnText('text1')l
//		questionListPage = require('questionListPage');
//		questionListPage.clickOnQuestion('question1');
//		questionPage = require('questionPage');
//		answers = questionPage.answers;
		
		// deprecate these lines
		sfUserActivity.selectObj('text');
		sfUserActivity.selectObj('question');

		// Add your own answer (Put this back in once addComment works)
		answerPage.addAnswer(newAnswerText);
		
		// Add your own comment
		commentPage.addComment(newCommentText);
		
		//sfUserActivity.selectObj('comments');
		//devElement = browser.findElement(sfUserActivity.newComment);
		//devElement.$("input[type='submit']").click();
	});

});







