'use strict';

/* See http://www.benlesh.com/2013/05/angularjs-unit-testing-controllers.html */

describe('Questions page (questions.js)', function() {
	var scope;
	var rootScope;
	var ctrl;

	var testQuestions = {
		count: 2,
		entries: [
			{id: "101", answerCount: 5, title: "Who is speaking?", description: "Who is telling the story in this text?"},
			{id: "102", answerCount: 3, title: "Where is the storyteller?", description: "The person telling this story has just arrived somewhere. Where is he?"},
		],
		rights: [], // TODO: Fill this in with numeric rights values if needed
		text: {
			audioUrl: '',
			// Any other properties needed?
		},
		project: {
			name: 'Test Project',
		},
	};

	var testJsonResult = {
		id: 1,
		ok: true,
		status: 200,
		data: testQuestions,
	};

	var mockQuestionService = {
		list: function(textId, callback) {
			// Ignore project and text IDs for this mock
			callback(testJsonResult);
		},
		util: {
			calculateTitle: function(title, description, charLimit) {
				return title;
			},
		},
	};

	beforeEach(module('sfchecks.questions'));

	beforeEach(inject(function($rootScope, $controller) {
		// Keep the root scope around for the test functions to use
		rootScope = $rootScope;

		// Create a fresh scope for each test to use
		scope = $rootScope.$new();

		// Set up the controller with that fresh scope
		ctrl = $controller('QuestionsCtrl', {
			$scope: scope,
			questionService: mockQuestionService,
		});
	}));

	it('should load questions from the question service', function() {
		expect(scope.questions.length).toBe(0);
		scope.queryQuestions();
		expect(scope.questions.length).toBe(2);
		expect(scope.questions[0].title).toBe("Who is speaking?");
		expect(scope.questions[1].title).toBe("Where is the storyteller?");
		expect(scope.questions[0].answerCount).toBe(5);
		expect(scope.questions[1].answerCount).toBe(3);
	});

	// TODO: Rewrite this with spyOn(func) and expect(func).toHaveBeenCalled() RM 2013-08

});
