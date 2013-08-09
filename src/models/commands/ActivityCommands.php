<?php

namespace models\commands;

use models\TextModel;

use models\mapper\IdReference;

use models\ActivityModel;

use models\CommentModel;

use models\ProjectModel;
use models\QuestionModel;

class ActivityCommands
{
	
	/**
	 * 
	 * @param ProjectModel $projectModel
	 * @param string $questionId
	 * @param string $answerId
	 * @param CommentModel $commentModel
	 */
	public static function updateComment($projectModel, $questionId, $answerId, $commentModel) {
		$activity = new ActivityModel($projectModel);
		$question = new QuestionModel($questionId);
		$answer = $question->answers->data[$answerId];
		$text = new TextModel($projectModel, $question->textRef->asString());
		$activity->action = ($commentModel->id->id == '') ? ActivityModel::ADD_COMMENT : ActivityModel::UPDATE_COMMENT;
		$activity->userRef->id = $commentModel->userRef->id;
		$activity->textRef->id = $text->id->asString();
		$activity->questionRef->id = $questionId;
		$activity->addContent(ActivityModel::TEXT, $text->title);
		$activity->addContent(ActivityModel::QUESTION, $question->title);
		$activity->addContent(ActivityModel::ANSWER, $answer->content);
		$activity->addContent(ActivityModel::COMMENT, $commentModel->content);
	}
	
	/**
	 * 
	 * @param ProjectModel $projectModel
	 * @param string $questionId
	 * @param string $answerId
	 * @param AnswerModel $answerModel
	 */
	public static function updateAnswer($projectModel, $questionId, $answerModel) {
		$activity = new ActivityModel($projectModel);
		$question = new QuestionModel($questionId);
		$text = new TextModel($projectModel, $question->textRef->asString());
		$activity->action = ($answerModel->id->id == '') ? ActivityModel::ADD_ANSWER : ActivityModel::UPDATE_ANSWER;
		$activity->userRef->id = $answerModel->userRef->asString();
		$activity->textRef->id = $text->id->asString();
		$activity->questionRef->id = $questionId;
		$activity->addContent(ActivityModel::TEXT, $text->title);
		$activity->addContent(ActivityModel::QUESTION, $question->title);
		$activity->addContent(ActivityModel::ANSWER, $answer->content);
	}
	
	/**
	 * 
	 * @param ProjectModel $projectModel
	 * @param TextModel $textModel
	 */
	public static function addText($projectModel, $textModel) {
		$activity = new ActivityModel($projectModel);
		$activity->action = ActivityModel::ADD_TEXT;
		$activity->textRef->id = $textId;
		$activity->addContent(ActivityModel::TEXT, $textModel->title);
	}
	
	public static function addQuestion($projectModel, $textId, $questionId, $questionModel) {
		$activity = new ActivityModel($projectModel);
		$text = new TextModel($textId);
		$activity->action = ActivityModel::ADD_QUESTION;
		$activity->textRef->id = $textId;
		$activity->questionRef->id = $questionId;
		$activity->addContent(ActivityModel::TEXT, $text->title);
		$activity->addContent(ActivityModel::QUESTION, $questionModel->title);
	}
	
	public static function addUserToProject($projectModel, $userId) {
		$activity = new ActivityModel($projectModel);
		$activity->action = ActivityModel::ADD_USER_TO_PROJECT;
		$activity->userRef->id = $userId; // we can use the userRef in this case because we don't keep track of the user that performed this action
	}
	
	// this may only be useful to log this activity for answers on which the user has commented on or has answered him/herself
	// TODO: how do we implement this?
	public static function updateScore($projectModel, $questionId, $answerId, $userId, $mode = 'increase') {
		$activity = new ActivityModel($projectModel);
		$question = new QuestionModel($questionId);
		$text = new TextModel($projectModel, $question->textRef->asString());
		$answer = $question->answers->data[$answerId];
		$activity = new ActivityModel($projectModel);
		$activity->action = ($mode == 'increase') ? ActivityModel::INCREASE_SCORE : ActivityModel::DECREASE_SCORE;
		$activity->userRef->id = $userId;
		$activity->textRef->id = $text->id->asString();
		$activity->questionRef->id = $questionId;
		$activity->addContent(ActivityModel::TEXT, $text->title);
		$activity->addContent(ActivityModel::QUESTION, $question->title);
		$activity->addContent(ActivityModel::ANSWER, $answer->content);
	}
}

?>