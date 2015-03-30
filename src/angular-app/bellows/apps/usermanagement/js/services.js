'use strict';

// Services
// ScriptureForge common services
angular.module('sfchecks.services', ['jsonRpc'])
  .service('sfchecksProjectService', ['jsonRpc', function(jsonRpc) {
    jsonRpc.connect('/api/sf'); // Note this doesn't actually 'connect', it simply sets the connection url.
    this.read = function(callback) {
      jsonRpc.call('project_read', [], callback);
    };
    this.update = function(model, callback) {
      jsonRpc.call('project_update', [model], callback);
    };
    this.projectSettings = function(callback) {
      jsonRpc.call('project_settings', [], callback);
    };
    this.updateSettings = function(smsSettings, emailSettings, callback) {
      jsonRpc.call('project_updateSettings', [smsSettings, emailSettings], callback);
    };
    this.readSettings = function(callback) {
      jsonRpc.call('project_readSettings', [], callback);
    };
    this.pageDto = function(callback) {
      jsonRpc.call('project_pageDto', [], callback);
    };
  }])
  .service('messageService', ['jsonRpc', function(jsonRpc) {
    jsonRpc.connect('/api/sf'); // Note this doesn't actually 'connect', it simply sets the connection url.
    this.markRead = function(textId) {
      jsonRpc.call('message_markRead', [textId], function() {});
    };
    this.send = function(userIds, subject, emailTemplate, smsTemplate, callback) {
      jsonRpc.call('message_send', [userIds, subject, emailTemplate, smsTemplate], callback);
    };
  }])
  .service('textService', ['jsonRpc', function(jsonRpc) {
    jsonRpc.connect('/api/sf'); // Note this doesn't actually 'connect', it simply sets the connection url.
    this.read = function(textId, callback) {
      jsonRpc.call('text_read', [textId], callback);
    };
    this.update = function(model, callback) {
      jsonRpc.call('text_update', [model], callback);
    };
    this.archive = function(textIds, callback) {
      jsonRpc.call('text_archive', [textIds], callback);
    };
    this.publish = function(textIds, callback) {
      jsonRpc.call('text_publish', [textIds], callback);
    };
    this.list = function(callback) {
      jsonRpc.call('text_list_dto', [], callback);
    };
    this.settings_dto = function(textId, callback) {
      jsonRpc.call('text_settings_dto', [textId], callback);
    };
    this.exportComments = function(params, callback) {
      jsonRpc.call('text_exportComments', [params], callback);
    };
  }])
  .service('questionService', ['jsonRpc', function(jsonRpc) {
    jsonRpc.connect('/api/sf');
    this.read = function(questionId, callback) {
      jsonRpc.call('question_comment_dto', [questionId], callback);
    };
    this.update = function(model, callback) {
      jsonRpc.call('question_update', [model], callback);
    };
    this.archive = function(questionIds, callback) {
      jsonRpc.call('question_archive', [questionIds], callback);
    };
    this.publish = function(questionIds, callback) {
      jsonRpc.call('question_publish', [questionIds], callback);
    };
    this.list = function(textId, callback) {
      jsonRpc.call('question_list_dto', [textId], callback);
    };
    this.update_answer = function(questionId, model, callback) {
      jsonRpc.call('question_update_answer', [questionId, model], callback);
    };
    this.update_answerExportFlag = function(questionId, answerId, isToBeExported, callback) {
      jsonRpc.call('question_update_answerExportFlag', [questionId, answerId, isToBeExported], callback);
    };
    this.update_answerTags = function(questionId, answerId, tags, callback) {
      jsonRpc.call('question_update_answerTags', [questionId, answerId, tags], callback);
    };
    this.remove_answer = function(questionId, answerId, callback) {
      jsonRpc.call('question_remove_answer', [questionId, answerId], callback);
    };
    this.update_comment = function(questionId, answerId, model, callback) {
      jsonRpc.call('question_update_comment', [questionId, answerId, model], callback);
    };
    this.remove_comment = function(questionId, answerId, commentId, callback) {
      jsonRpc.call('question_remove_comment', [questionId, answerId, commentId], callback);
    };
    this.answer_voteUp = function(questionId, answerId, callback) {
      jsonRpc.call('answer_vote_up', [questionId, answerId], callback);
    };
    this.answer_voteDown = function(questionId, answerId, callback) {
      jsonRpc.call('answer_vote_down', [questionId, answerId], callback);
    };
    
    // Utility functions
    this.util = {};
    this.util.calculateTitle = function(title, description, charLimit) {
      charLimit = charLimit || 50;
      var questionTitleCalculated;
      if (!title || title == '') {
        var spaceIndex = description.indexOf(' ', charLimit);
        var shortTitle;
        if (spaceIndex > -1) {
          shortTitle = description.slice(0, spaceIndex) + '...';
        } else {
          shortTitle = description;
        }
        questionTitleCalculated = shortTitle;
      } else {
        questionTitleCalculated = title;
      }
      return questionTitleCalculated;
    };
  }])
  .service('questionTemplateService', ['jsonRpc', function(jsonRpc) {
    jsonRpc.connect('/api/sf');
    this.read = function(questionTemplateId, callback) {
      jsonRpc.call('questionTemplate_read', [questionTemplateId], callback);
    };
    this.update = function(questionTemplate, callback) {
      jsonRpc.call('questionTemplate_update', [questionTemplate], callback);
    };
    this.remove = function(questionTemplateIds, callback) {
      jsonRpc.call('questionTemplate_delete', [questionTemplateIds], callback);
    };
    this.list = function(callback) {
      jsonRpc.call('questionTemplate_list', [], callback);
    };
  }])
  ;
