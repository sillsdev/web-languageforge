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
		$activity->action = ($commentModel->id->id == '') ? 'add_comment' : 'update_comment';
		$activity->userRef->id = $commentModel->userRef->id;
		$activity->addRef($text->id->asString());
		$activity->addRef($questionId);
		$activity->addContent($text->title);
		$activity->addContent($question->title);
		$activity->addContent($answer->content);
		$activity->addContent($commentModel->content);
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
		$activity->action = ($answerModel->id->id == '') ? 'add_answer' : 'update_answer';
		$activity->userRef->id = $answerModel->userRef->asString();
		$activity->addRef($text->id->asString());
		$activity->addRef($questionId);
		$activity->addContent($text->title);
		$activity->addContent($question->title);
		$activity->addContent($answerModel->content);
	}
	
	/**
	 * 
	 * @param ProjectModel $projectModel
	 * @param TextModel $textModel
	 */
	public static function addText($projectModel, $textModel) {
		$activity = new ActivityModel($projectModel);
		$activity->action = 'add_text';
		$activity->actionContent->append($textModel->title);
		$activity->addRef($textId);
	}
	
	public static function addQuestion($projectModel, $textId, $questionId, $questionModel) {
		$activity = new ActivityModel($projectModel);
		$text = new TextModel($textId);
		$activity->action = 'add_question';
		$activity->addContent($text->title);
		$activity->addContent($questionModel->title);
		$activity->addRef($textId);
		$activity->addRef($questionId);
	}
	
	public static function addUserToProject($projectModel, $userId) {
		$activity = new ActivityModel($projectModel);
		$activity->action = 'add_user_to_project';
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
		$activity->action = ($mode == 'increase') ? 'increase_score' : 'decrease_score';
		$activity->userRef->id = $userId;
		$activity->addRef($text->id->asString());
		$activity->addRef($questionId);
		$activity->addContent($text->title);
		$activity->addContent($question->title);
		$activity->addContent($answer->content);

?>