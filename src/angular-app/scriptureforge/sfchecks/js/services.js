'use strict';

// Services
// ScriptureForge common services
angular.module('sfchecks.services', ['jsonRpc'])
	.service('sfchecksProjectService', ['jsonRpc', function(jsonRpc) {
		jsonRpc.connect('/api/sf'); // Note this doesn't actually 'connect', it simply sets the connection url.
		this.read = function(projectId, callback) {
			jsonRpc.call('project_read', [projectId], callback);
		};
		this.update = function(model, callback) {
			jsonRpc.call('project_update', [model], callback);
		};
		this.projectSettings = function(projectId, callback) {
			jsonRpc.call('project_settings', [projectId], callback);
		};
		this.updateSettings = function(projectId, smsSettings, emailSettings, callback) {
			jsonRpc.call('project_updateSettings', [projectId, smsSettings, emailSettings], callback);
		};
		this.readSettings = function(projectId, callback) {
			jsonRpc.call('project_readSettings', [projectId], callback);
		};
		this.pageDto = function(projectId, callback) {
			jsonRpc.call('project_pageDto', [projectId], callback);
		};
	}])
	.service('messageService', ['jsonRpc', function(jsonRpc) {
		jsonRpc.connect('/api/sf'); // Note this doesn't actually 'connect', it simply sets the connection url.
		this.markRead = function(projectId, textId) {
			jsonRpc.call('message_markRead', [projectId, textId], function() {});
		};
		this.send = function(projectId, userIds, subject, emailTemplate, smsTemplate, callback) {
			jsonRpc.call('message_send', [projectId, userIds, subject, emailTemplate, smsTemplate], callback);
		};
	}])
	.service('textService', ['jsonRpc', function(jsonRpc) {
		jsonRpc.connect('/api/sf'); // Note this doesn't actually 'connect', it simply sets the connection url.
		this.read = function(projectId, textId, callback) {
			jsonRpc.call('text_read', [projectId, textId], callback);
		};
		this.update = function(projectId, model, callback) {
			jsonRpc.call('text_update', [projectId, model], callback);
		};
		this.remove = function(projectId, textIds, callback) {
			jsonRpc.call('text_delete', [projectId, textIds], callback);
		};
		this.list = function(projectId, callback) {
			jsonRpc.call('text_list_dto', [projectId], callback);
		};
		this.settings_dto = function(projectId, textId, callback) {
			jsonRpc.call('text_settings_dto', [projectId, textId], callback);
		};
		this.exportComments = function(projectId, params, callback) {
			jsonRpc.call('text_exportComments', [projectId, params], callback);
		};
	}])
	.service('questionsService', ['jsonRpc', function(jsonRpc) {
		jsonRpc.connect('/api/sf'); // Note this doesn't actually 'connect', it simply sets the connection url.
		this.read = function(projectId, questionId, callback) {
			jsonRpc.call('question_read', [projectId, questionId], callback);
		};
		this.update = function(projectId, model, callback) {
			jsonRpc.call('question_update', [projectId, model], callback);
		};
		this.remove = function(projectId, questionIds, callback) {
			jsonRpc.call('question_delete', [projectId, questionIds], callback);
		};
		this.list = function(projectId, textId, callback) {
			jsonRpc.call('question_list_dto', [projectId, textId], callback);
		};
	}])
	.service('questionService', ['jsonRpc', function(jsonRpc) {
		jsonRpc.connect('/api/sf');
		this.read = function(projectId, questionId, callback) {
			jsonRpc.call('question_comment_dto', [projectId, questionId], callback);
		};
		this.update = function(projectId, model, callback) {
			jsonRpc.call('question_update', [projectId, model], callback);
		};
		this.update_answer = function(projectId, questionId, model, callback) {
			jsonRpc.call('question_update_answer', [projectId, questionId, model], callback);
		};
		this.remove_answer = function(projectId, questionId, answerId, callback) {
			jsonRpc.call('question_remove_answer', [projectId, questionId, answerId], callback);
		};
		this.update_comment = function(projectId, questionId, answerId, model, callback) {
			jsonRpc.call('question_update_comment', [projectId, questionId, answerId, model], callback);
		};
		this.remove_comment = function(projectId, questionId, answerId, commentId, callback) {
			jsonRpc.call('question_remove_comment', [projectId, questionId, answerId, commentId], callback);
		};
		this.answer_voteUp = function(projectId, questionId, answerId, callback) {
			jsonRpc.call('answer_vote_up', [projectId, questionId, answerId], callback);
		};
		this.answer_voteDown = function(projectId, questionId, answerId, callback) {
			jsonRpc.call('answer_vote_down', [projectId, questionId, answerId], callback);
		};
	}])
	.service('questionTemplateService', ['jsonRpc', function(jsonRpc) {
		jsonRpc.connect('/api/sf');
		this.read = function(questionTemplateId, callback) {
			jsonRpc.call('questionTemplate_read', [questionTemplateId], callback);
		};
		this.update = function(projectId, questionTemplate, callback) {
			jsonRpc.call('questionTemplate_update', [projectId, questionTemplate], callback);
		};
		this.remove = function(questionTemplateIds, callback) {
			jsonRpc.call('questionTemplate_delete', [questionTemplateIds], callback);
		};
		this.list = function(callback) {
			jsonRpc.call('questionTemplate_list', [], callback);
		};
	}])
	;
