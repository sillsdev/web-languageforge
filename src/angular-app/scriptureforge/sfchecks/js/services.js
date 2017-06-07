'use strict';

// Services
// ScriptureForge common services
angular.module('sfchecks.services', ['bellows.services'])
  .service('sfchecksProjectService', ['apiService', function (api) {
    this.read = api.method('project_read');
    this.update = api.method('project_update');
    this.projectSettings = api.method('project_settings');
    this.updateSettings = api.method('project_updateSettings');
    this.readSettings = api.method('project_readSettings');
    this.pageDto = api.method('project_pageDto');
  }])
  .service('messageService', ['apiService', function (api) {
    this.markRead = api.method('message_markRead');
    this.send = api.method('message_send');
  }])
  .service('textService', ['apiService', function (api) {
    this.read = api.method('text_read');
    this.update = api.method('text_update');
    this.archive = api.method('text_archive');
    this.publish = api.method('text_publish');
    this.settingsDto = api.method('text_settings_dto');
    this.exportComments = api.method('text_exportComments');  }])
  .service('questionService', ['apiService', function (api) {
    this.read = api.method('question_comment_dto');
    this.update = api.method('question_update');
    this.archive = api.method('question_archive');
    this.publish = api.method('question_publish');
    this.list = api.method('question_list_dto');
    this.updateAnswer = api.method('question_update_answer');
    this.updateAnswerExportFlag = api.method('question_update_answerExportFlag');
    this.updateAnswerTags = api.method('question_update_answerTags');
    this.removeAnswer = api.method('question_remove_answer');
    this.updateComment = api.method('question_update_comment');
    this.removeComment = api.method('question_remove_comment');
    this.answerVoteUp = api.method('answer_vote_up');
    this.answerVoteDown = api.method('answer_vote_down');

    // Utility functions
    this.util = {};
    this.util.calculateTitle = function (title, description, charLimit) {
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
  .service('questionTemplateService', ['apiService', function (api) {
    this.read = api.method('questionTemplate_read');
    this.update = api.method('questionTemplate_update');
    this.remove = api.method('questionTemplate_delete');
    this.list = api.method('questionTemplate_list');
  }]);
