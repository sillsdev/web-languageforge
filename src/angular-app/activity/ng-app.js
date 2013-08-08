'use strict';

// Declare app level module which depends on filters, and services
angular.module('activity', 
		[
		 'sf.services',
		 'ui.bootstrap'
		])
	.controller('ActivityCtrl', ['$scope', 'activityService', function($scope, activityService) {
		$scope.activities = [
			{
				'type': 'global',
				'action': 'message',
				'date': 1375947520,
				'content': {
					'message': 'Notice: scriptureforge.org will be unavailable Sunday morning for routine server maintenance'
				}
			},
			{
				'type': 'project',
				'action': 'add_question',
				'date': 1375947810,
				'userRef': '',
				'projectRef': '123445',
				'textRef': '12345',
				'questionRef':'12345',
				'content': {
					'project':'Northern Thai',
					'text':'Psalm 56',
					'question':'What is the perceived tone of this chapter?'
				}
			},
			{
				'type': 'project',
				'action': 'add_text',
				'date': 1375947810,
				'userRef': '',
				'projectRef': '123445',
				'textRef': '12345',
				'questionRef':'',
				'content': {
					'project':'Island Creole',
					'text':'Revelation 1'
				}
			},
			{
				'type': 'project',
				'action': 'add_comment',
				'date': 1375948400,
				'userRef': {
					'id': '123345',
					'avatar_ref': '/images/avatar/HotPink-frog-128x128.png',
					'username': 'Jon'
				},
				'userRef2': {
					'id': '123345',
					'avatar_ref': '/images/avatar/anonymoose.png',
					'username': 'Chris'
				},
				'projectRef': '123445',
				'textRef': '12345',
				'questionRef':'12345',
				'content': {
					'project':'Jamaican Scripture',
					'text':'Psalm 109',
					'question': 'Please comment on the use of the word "man"',
					'answer':'The word "man" is used too often in this context',
					'comment': 'I agree',
				}
			},
			{
				'type': 'project',
				'action': 'add_answer',
				'date': 1375948400,
				'userRef': {
					'id': '123345',
					'avatar_ref': '/images/avatar/chocolate4-cow-128x128.png',
					'username': 'James'
				},
				'projectRef': '123445',
				'textRef': '12345',
				'questionRef':'12345',
				'content': {
					'project':'Jamaican Scripture',
					'text':'Psalm 109',
					'question': 'Please comment on the use of the word "man"',
					'answer':'The word "man" is used too often in this context',
					'comment': 'I agree',
				}
			},
			{
				'type': 'project',
				'action': 'increase_score',
				'filter': 'me',
				'date': 1375949526,
				'userRef': {
					'id': '123345',
					'avatar_ref': '/images/avatar/LightYellow-gorilla-128x128.png',
					'username': 'Joshua'
				},
				'projectRef': '123445',
				'textRef': '12345',
				'questionRef':'12345',
				'content': {
					'project':'Jamaican Scripture',
					'text':'Psalm 109',
					'question': 'Please comment on the use of the word "man"',
					'answer':'The word "man" is used too often in this context',
				}
			}
		];
		/*
		activityService.list_activity(0, 50, function(result) {
			if (result.ok) {
				$scope.activities = result.data.entries;
			} else {
				// error condition
				console.log("error loading activity")
			}
		});
		*/
		
		$scope.filterAllActivity = function() {
			console.log("filterAllActivity()");
			
		};
		
		$scope.filterMyActivity = function() {
			console.log("filterMyActivity()");
			
		};
	}])
	;
