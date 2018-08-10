import * as angular from 'angular';

import {JsonRpcResult} from '../../../bellows/core/api/json-rpc.service';
import {CoreModule} from '../../../bellows/core/core.module';
import {NoticeModule} from '../../../bellows/core/notice/notice.module';
import {SessionService} from '../../../bellows/core/session.service';
import {ListViewModule} from '../../../bellows/shared/list-view.component';
import {SfChecksCoreModule} from '../core/sf-checks-core.module';
import {Answer, Comment, Question} from '../shared/model/text.model';
import {SfChecksSelectionModule} from '../shared/sil-selection.directive';
import {TaggingModule} from '../shared/tagging.module';

export const SfChecksQuestionModule = angular
  .module('sfchecks.question', [
    CoreModule,
    NoticeModule,
    ListViewModule,
    TaggingModule,
    SfChecksCoreModule,
    SfChecksSelectionModule
  ])
  .controller('QuestionCtrl', ['$scope', '$routeParams', 'questionService', 'sessionService',
    'utilService', 'breadcrumbService', 'silNoticeService', 'linkService', 'modalService',
  ($scope, $routeParams, questionService, sessionService: SessionService,
   util, breadcrumbService, notice, linkService, modalService) => {

    const Q_TITLE_LIMIT = 30;
    $scope.getAvatarUrl = util.constructor.getAvatarUrl;
    $scope.finishedLoading = false;
    $scope.state = 'stop';

    const questionId = $routeParams.questionId;

    $scope.votes = {};
    $scope.unreadComments = [];
    $scope.unreadAnswers = [];
    $scope.myResponses = [];

    $scope.unreadResponseCount = function unreadResponseCount(): number {
      return $scope.unreadComments.length + $scope.unreadAnswers.length;
    };

    $scope.isUnreadComment = function isUnreadComment(id: string): boolean {
      return ($scope.unreadComments.includes(id) || $scope.myResponses.includes(id));
    };

    $scope.isUnreadAnswer = function isUnreadAnswer(id: string): boolean {
      return ($scope.unreadAnswers.includes(id) || $scope.myResponses.includes(id));
    };

    questionService.read(questionId).then((result: JsonRpcResult) => {
      if (result.ok) {
        $scope.project = result.data.project;
        $scope.text = result.data.text;
        if ($scope.text.audioFileName !== '') {
          $scope.audioPlayUrl = '/assets/sfchecks/' + $scope.project.slug + '/' + $scope.text.id +
            '_' + $scope.text.audioFileName;
          $scope.audioDownloadUrl = '/download' + $scope.audioPlayUrl;
        }

        $scope.question = result.data.question;
        $scope.votes = result.data.votes;
        $scope.unreadComments = result.data.unreadComments;
        $scope.unreadAnswers = result.data.unreadAnswers;

        // Breadcrumb
        breadcrumbService.set('top', [
          { href: '/app/projects', label: 'My Projects' },
          { href: linkService.project(), label: $scope.project.projectName },
          { href: linkService.text($routeParams.textId), label: $scope.text.title },
          { href: linkService.question($routeParams.textId, $routeParams.questionId), label: $scope.question.title }
        ]);

        // Keep track of answer count so we can show or hide "There are no
        // answers" as appropriate
        $scope.question.answerCount = Object.keys($scope.question.answers).length;
        $scope.rights = result.data.rights;
        $scope.finishedLoading = true;
      }
    });

    sessionService.getSession().then(session => {
      // Rights: Answers
      $scope.rightsEditResponse = function rightsEditResponse(userId: string): boolean {
        if (session.project().isArchived) {
          return false;
        }

        return session.hasRight($scope.rights, sessionService.domain.ANSWERS, sessionService.operation.EDIT) ||
          ((userId === session.userId()) &&
          session.hasRight($scope.rights, sessionService.domain.ANSWERS, sessionService.operation.EDIT_OWN));
      };

      $scope.rightsDeleteResponse = function rightsDeleteResponse(userId: string): boolean {
        if (session.project().isArchived) {
          return false;
        }

        return session.hasRight($scope.rights, sessionService.domain.ANSWERS, sessionService.operation.DELETE) ||
          ((userId === session.userId()) &&
          session.hasRight($scope.rights, sessionService.domain.ANSWERS, sessionService.operation.DELETE_OWN));
      };

      // Rights: Question
      $scope.rightsCloseQuestion = function rightsCloseQuestion(): boolean {
        if (session.project().isArchived) {
          return false;
        }

        return session.hasRight($scope.rights, sessionService.domain.QUESTIONS, sessionService.operation.EDIT);
      };

      $scope.rightsEditQuestion = function rightsEditQuestion(): boolean {
        if (session.project().isArchived) {
          return false;
        }

        return session.hasRight($scope.rights, sessionService.domain.QUESTIONS, sessionService.operation.EDIT);
      };

      // Rights: Tags
      $scope.rightsCreateTag = function rightsCreateTag(): boolean {
        if (session.project().isArchived) {
          return false;
        }

        return session.hasRight($scope.rights, sessionService.domain.TAGS, sessionService.operation.CREATE);
      };

      $scope.rightsDeleteTag = function rightsDeleteTag(): boolean {
        if (session.project().isArchived) {
          return false;
        }

        return session.hasRight($scope.rights, sessionService.domain.TAGS, sessionService.operation.DELETE);
      };

      // Rights: Export
      $scope.rightsExport = function rightsExport(): boolean {
        return session.hasRight($scope.rights, sessionService.domain.TEXTS, sessionService.operation.EDIT);
      };

    });

    $scope.workflowStates = [{
      state: 'open',
      label: 'Open'
    }, {
      state: 'review',
      label: 'In Review'
    }, {
      state: 'closed',
      label: 'Closed'
    }];

    $scope.questionIsClosed = function questionIsClosed(): boolean {
      if ($scope.question) {
        return ($scope.question.workflowState === 'closed');
      }
    };

    $scope.editQuestionCollapsed = true;
    $scope.showQuestionEditor = function showQuestionEditor(): void {
      $scope.editQuestionCollapsed = false;
    };

    $scope.hideQuestionEditor = function hideQuestionEditor(): void {
      $scope.editQuestionCollapsed = true;
    };

    $scope.toggleQuestionEditor = function toggleQuestionEditor(): void {
      $scope.editQuestionCollapsed = !$scope.editQuestionCollapsed;
    };

    $scope.$watch('editQuestionCollapsed', (newVal: boolean) => {
      if (newVal) {
        return;
      }

      // Question editor not collapsed? Then set up initial values
      $scope.editedQuestion = {
        id: $scope.question.id,
        title: $scope.question.title,
        description: $scope.question.description,
        workflowState: $scope.question.workflowState

        // Do we need to copy the other values? Let's check:
        // dateCreated: $scope.question.dateCreated,
        // textRef: $scope.question.textRef,
        // answers: $scope.question.answers,
        // answerCount: $scope.question.answerCount,
      };
    });

    $scope.questionTitleCalculated = '';
    $scope.$watch('question.title', () => {
      if ($scope.question) {
        $scope.questionTitleCalculated = questionService.util
          .calculateTitle($scope.question.title, $scope.question.description, Q_TITLE_LIMIT);
        breadcrumbService.updateCrumb('top', 3, {
          label: $scope.questionTitleCalculated
        });
      }
    });

    $scope.$watch('question.description', () => {
      if ($scope.question) {
        $scope.questionTitleCalculated = questionService.util
          .calculateTitle($scope.question.title, $scope.question.description, Q_TITLE_LIMIT);
        breadcrumbService.updateCrumb('top', 3, {
          label: $scope.questionTitleCalculated
        });
      }
    });

    $scope.updateQuestion = function updateQuestion(newQuestion: Question): void {
      questionService.update(newQuestion).then((updateResult: JsonRpcResult) => {
        if (updateResult.ok) {
          notice.push(notice.SUCCESS, 'The question was updated successfully');
          questionService.read(newQuestion.id).then((readResult: JsonRpcResult) => {
            if (readResult.ok) {
              $scope.question = readResult.data.question;

              // Recalculate answer count since the DB doesn't store it
              $scope.question.answerCount = Object.keys($scope.question.answers).length;
            }
          });
        }
      });
    };

    $scope.openEditors = {
      answerId: null,
      commentId: null
    };

    $scope.showAnswerEditor = function showAnswerEditor(answerId: string): void {
      $scope.openEditors.answerId = answerId;
    };

    $scope.hideAnswerEditor = function hideAnswerEditor(): void {
      $scope.openEditors.answerId = null;
    };

    $scope.$watch('openEditors.answerId', (newVal: string) => {
      if (newVal == null) {
        return;
      }

      // Set up the values needed by the new editor
      const answer = $scope.question.answers[newVal];
      if (answer == null) {
        return;
      }

      $scope.editedAnswer = {
        id: newVal,
        comments: {},
        content: answer.content,

        // TODO: Figure out what format I should be passing this in. RM 2013-08
        // dateEdited: Date.now(), // Commented out for now because the model wasn't happy with a Javascript date.
        score: answer.score,
        textHighlight: answer.textHighlight,
        userRef: answer.userRef
      };
      for (const id of Object.keys(answer.comments)) {
        const comment = answer.comments[id];
        $scope.editedAnswer.comments[id] = {
          id: comment.id,
          content: comment.content,
          dateCreated: comment.dateCreated,
          dateEdited: comment.dateEdited,
          userRef: comment.userRef.userid
        } as Comment;
      }
    });

    $scope.answerEditorVisible = function answerEditorVisible(answerId: string): boolean {
      return (answerId === $scope.openEditors.answerId);
    };

    $scope.showCommentEditor = function showCommentEditor(commentId: string): void {
      $scope.openEditors.commentId = commentId;
    };

    $scope.hideCommentEditor = function hideCommentEditor(): void {
      $scope.openEditors.commentId = null;
    };

    $scope.$watch('openEditors.commentId', (newVal: string) => {
      if (newVal == null) {
        return;
      }

      // We're in the question-level scope, and we need to find a specific commentId without knowing which answer it
      // belongs to, because all we have to work with is the new value of the commentId (the old value won't help us).
      let comment: Comment;
      searchLoop: for (const answerId of Object.keys($scope.question.answers)) {
        const answer = $scope.question.answers[answerId];
        for (const commentId of Object.keys(answer.comments)) {
          if (commentId === newVal) {
            comment = answer.comments[commentId];
            break searchLoop;
          }
        }
      }

      // Set up the values needed by the new editor
      if (comment == null) {
        return;
      }

      $scope.editedComment = {
        id: newVal,
        content: comment.content,

        // TODO: Figure out what format I should be passing this in. RM 2013-08
        // dateEdited: Date.now(), // Commented out for now because the model wasn't happy with a Javascript date.

        // Do we really need to copy this over? Or will the PHP model code take care of that for us?
        userRef: comment.userRef
      };
    });

    $scope.commentEditorVisible = function commentEditorVisible(commentId: string): boolean {
      return (commentId === $scope.openEditors.commentId);
    };

    $scope.newComment = {
      content: ''
    };

    $scope.newAnswer = {
      content: '',
      textHighlight: ''
    };

    $scope.updateComment = function updateComment(answerId: string, answer: Answer, newComment: Comment): void {
      questionService.updateComment(questionId, answerId, newComment).then((result: JsonRpcResult) => {
        if (result.ok) {
          if (newComment.id === '') {
            notice.push(notice.SUCCESS, 'The comment was submitted successfully');
          } else {
            notice.push(notice.SUCCESS, 'The comment was updated successfully');
          }

          for (const id of Object.keys(result.data)) {
            // There should be one, and only one, record in result.data
            newComment = result.data[id];
          }

          $scope.question.answers[answerId].comments[newComment.id] = newComment;
          $scope.myResponses.push(newComment.id);
        }
      });
    };

    $scope.submitComment = function submitComment(answerId: string, answer: Answer): void {
      const newComment = {
        id: '',
        content: $scope.newComment.content
      } as Comment;
      $scope.updateComment(answerId, answer, newComment);
      $scope.newComment.content = '';
      $scope.newComment.textHighlight = '';
    };

    $scope.editComment = function editComment(answerId: string, answer: Answer, comment: Comment): void {
      if ($scope.rightsEditResponse(comment.userRef.userid)) {
        $scope.updateComment(answerId, answer, comment);
      }

      $scope.hideCommentEditor();
    };

    $scope.commentDelete = function commentDelete(answer: Answer, commentId: string): void {
      const message = 'Are you sure you want to delete this Comment?';
      const modalOptions = {
        closeButtonText: 'Cancel',
        actionButtonText: 'Delete',
        headerText: 'Delete Comment?',
        bodyText: message
      };
      modalService.showModal({}, modalOptions).then(() => {
        questionService.removeComment(questionId, answer.id, commentId).then((result: JsonRpcResult) => {
          if (result.ok) {
            notice.push(notice.SUCCESS, 'The comment was removed successfully');

            // Delete locally
            delete answer.comments[commentId];
          }
        });
      }, () => {});
    };

    function afterUpdateAnswer(answersDto: Answer): void {
      for (const id of Object.keys(answersDto)) {
        $scope.question.answers[id] = answersDto[id];
        $scope.myResponses.push(id);
      }

      // Recalculate answer count as it might have changed
      $scope.question.answerCount = Object.keys($scope.question.answers).length;
    }

    $scope.voteUp = function voteUp(answerId: string): void {
      if ($scope.votes[answerId] === true || $scope.questionIsClosed()) {
        return;
      }

      questionService.answerVoteUp(questionId, answerId).then((result: JsonRpcResult) => {
        if (result.ok) {
          $scope.votes[answerId] = true;
          afterUpdateAnswer(result.data);
        }
      });
    };

    $scope.voteDown = function voteDown(answerId: string): void {
      if ($scope.votes[answerId] !== true || $scope.questionIsClosed()) {
        return;
      }

      questionService.answerVoteDown(questionId, answerId).then((result: JsonRpcResult) => {
        if (result.ok) {
          delete $scope.votes[answerId];
          afterUpdateAnswer(result.data);
        }
      });
    };

    function updateAnswer(answer: Answer): void {
      questionService.updateAnswer(questionId, answer).then((result: JsonRpcResult) => {
        if (result.ok) {
          if (answer.id === '') {
            notice.push(notice.SUCCESS, 'The answer was submitted successfully');
          } else {
            notice.push(notice.SUCCESS, 'The answer was updated successfully');
          }

          afterUpdateAnswer(result.data);
        }
      });
    }

    $scope.submitAnswer = function submitAnswer(): void {
      const answer = {
        id: '',
        content: $scope.newAnswer.content,
        textHighlight: $scope.newAnswer.textHighlight
      };
      updateAnswer(answer);
      $scope.newAnswer.content = '';
      $scope.newAnswer.textHighlight = '';
      $scope.selectedText = '';
    };

    $scope.editAnswer = function editAnswer(answer: Answer): void {
      if ($scope.rightsEditResponse(answer.userRef.userid)) {
        updateAnswer(answer);
      }

      $scope.hideAnswerEditor();
    };

    $scope.answerDelete = function answerDelete(answerId: string): void {
      const message = 'Are you sure you want to delete this Answer?';
      const modalOptions = {
        closeButtonText: 'Cancel',
        actionButtonText: 'Delete',
        headerText: 'Delete Answer?',
        bodyText: message
      };
      modalService.showModal({}, modalOptions).then(() => {
        questionService.removeAnswer(questionId, answerId).then((result: JsonRpcResult) => {
          if (result.ok) {
            notice.push(notice.SUCCESS, 'The answer was removed successfully');

            // Delete locally
            delete $scope.question.answers[answerId];

            // Recalculate answer count as it just changed
            $scope.question.answerCount = Object.keys($scope.question.answers).length;
          }
        });
      }, () => {});
    };

    $scope.selectedText = '';
    $scope.$watch('selectedText', (newVal: string) => {
      $scope.newAnswer.textHighlight = newVal;
    });

    // TAGS
    function mergeArrays(a: string[], b: string[]) {
      // From http://stackoverflow.com/a/13847481/2314532
      const set: { [item: string]: boolean; } = {};
      const result = [];

      for (const item of a) {
        if (!set[item]) { // O(1) lookup
          set[item] = true;
          result.push(item);
        }
      }

      for (const item of b) {
        if (!set[item]) { // O(1) lookup
          set[item] = true;
          result.push(item);
        }
      }

      return result;
    }

    $scope.addTags = function addTags(tags: string[], answer: Answer): void {
      answer.tags = mergeArrays(tags, answer.tags);
      questionService.updateAnswerTags(questionId, answer.id, answer.tags).then((result: JsonRpcResult) => {
        if (result.ok) {
          notice.push(notice.SUCCESS, 'The answer tag was added successfully');
        }
      });
    };

    $scope.deletedTags = function deletedTags(answer: Answer): void {
      questionService.updateAnswerTags(questionId, answer.id, answer.tags).then((result: JsonRpcResult) => {
        if (result.ok) {
          notice.push(notice.SUCCESS, 'The answer tags were deleted successfully');
        }
      });
    };

    $scope.flagForExport = function flagForExport(answer: Answer): void {
      answer.isToBeExported = !answer.isToBeExported;
      questionService.updateAnswerExportFlag(questionId, answer.id, answer.isToBeExported)
        .then((result: JsonRpcResult) => {
          if (result.ok) {
            if (answer.isToBeExported) {
              notice.push(notice.SUCCESS, 'The answer was flagged for export successfully');
            } else {
              notice.push(notice.SUCCESS, 'The answer was cleared from export successfully');
            }
          }
        }
      );
    };

  }])
  .name;
