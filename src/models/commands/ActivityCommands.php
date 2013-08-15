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
	public static function updateComment($projectModel, $questionId, $answerId, $commentModel, $mode = "update") {
		$activity = new ActivityModel($projectModel);
		$question = new QuestionModel($projectModel, $questionId);
		$answer = $question->readAnswer($answerId);
		$text = new TextModel($projectModel, $question->textRef->asString());
		$activity->action = ($mode == 'update') ? ActivityModel::UPDATE_COMMENT : ActivityModel::ADD_COMMENT;
		$activity->userRef->id = $commentModel->userRef->id;
		$activity->userRef2->id = $answer->userRef->id;
		$activity->textRef->id = $text->id->asString();
		$activity->questionRef->id = $questionId;
		$activity->addContent(ActivityModel::TEXT, $text->title);
		$activity->addContent(ActivityModel::QUESTION, $question->title);
		$activity->addContent(ActivityModel::ANSWER, $answer->content);
		$activity->addContent(ActivityModel::COMMENT, $commentModel->content);
		$activity->write();
	}
	
	public static function addComment($projectModel, $questionId, $answerId, $commentModel) {
		ActivityCommands::updateComment($projectModel, $questionId, $answerId, $commentModel, "add");
	}
	
	/**
	 * 
	 * @param ProjectModel $projectModel
	 * @param string $questionId
	 * @param string $answerId
	 * @param AnswerModel $answerModel
	 */
	public static function updateAnswer($projectModel, $questionId, $answerModel, $mode = "update") {
		$activity = new ActivityModel($projectModel);
		$question = new QuestionModel($projectModel, $questionId);
		$text = new TextModel($projectModel, $question->textRef->asString());
		$activity->action = ($mode == "update") ? ActivityModel::UPDATE_ANSWER : ActivityModel::ADD_ANSWER;
		$activity->userRef->id = $answerModel->userRef->asString();
		$activity->textRef->id = $text->id->asString();
		$activity->questionRef->id = $questionId;
		$activity->addContent(ActivityModel::TEXT, $text->title);
		$activity->addContent(ActivityModel::QUESTION, $question->title);
		$activity->addContent(ActivityModel::ANSWER, $answerModel->content);
		$activity->write();
	}
	
	public static function addAnswer($projectModel, $questionId, $answerModel) {
		ActivityCommands::updateAnswer($projectModel, $questionId, $answerModel, 'add');
	}
	
	/**
	 * 
	 * @param ProjectModel $projectModel
	 * @param TextModel $textModel
	 */
	public static function addText($projectModel, $textId, $textModel) {
		$activity = new ActivityModel($projectModel);
		$activity->action = ActivityModel::ADD_TEXT;
		$activity->textRef->id = $textId;
		$activity->addContent(ActivityModel::TEXT, $textModel->title);
		$activity->write();
	}
	
	/**
	 * @param ProjectModel $projectModel
	 * @param string $questionId
	 * @param QuestionModel $questionModel
	 */
	public static function addQuestion($projectModel, $questionId, $questionModel) {
		$activity = new ActivityModel($projectModel);
		$text = new TextModel($projectModel, $questionModel->textRef->asString());
		$activity->action = ActivityModel::ADD_QUESTION;
		$activity->textRef->id = $questionModel->textRef->asString();
		$activity->questionRef->id = $questionId;
		$activity->addContent(ActivityModel::TEXT, $text->title);
		$activity->addContent(ActivityModel::QUESTION, $questionModel->title);
		$activity->write();
	}
	
	/**
	 * 
	 * @param ProjectModel $projectModel
	 * @param string $userId
	 */
	public static function addUserToProject($projectModel, $userId) {
		$activity = new ActivityModel($projectModel);
		$activity->action = ActivityModel::ADD_USER_TO_PROJECT;
		$activity->userRef->id = $userId; // we can use the userRef in this case because we don't keep track of the user that performed this action
		$activity->write();
	}
	
	// this may only be useful to log this activity for answers on which the user has commented on or has answered him/herself
	// TODO: how do we implement this?
	/**
	 * 
	 * @param ProjectModel $projectModel
	 * @param string $questionId
	 * @param string $answerId
	 * @param string $userId
	 * @param string $mode
	 */
	public static function updateScore($projectModel, $questionId, $answerId, $userId, $mode = 'increase') {
		$activity = new ActivityModel($projectModel);
		$question = new QuestionModel($projectModel, $questionId);
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
		$activity->write();
	}
}

?>