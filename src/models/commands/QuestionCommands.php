<?php

namespace models\commands;

use models\CommentModel;
use models\AnswerModel;
use models\ProjectModel;
use models\QuestionModel;
use models\mapper\JsonDecoder;

class QuestionCommands
{
	
	/**
	 * @param string $projectId
	 * @param array $questionIds
	 * @return int Total number of questions removed.
	 */
	public static function deleteQuestions($projectId, $questionIds) {
		$projectModel = new ProjectModel($projectId);
		$count = 0;
		foreach ($questionIds as $questionId) {
			QuestionModel::remove($projectModel->databaseName(), $questionId);
			$count++;
		}
		return $count;
	}
	
	public static function updateAnswer($projectId, $questionId, $answer) {
		$projectModel = new ProjectModel($projectId);
		$answerModel = new AnswerModel();
		JsonDecoder::decode($answerModel, $answer);
		//ActivityCommands::updateAnswer($projectModel, $questionId, $answerModel);
		// TODO log the activity after we confirm that the comment was successfully updated ; cjh 2013-08
		return QuestionModel::writeAnswer($projectModel->databaseName(), $questionId, $answerModel);
	}
	
	public static function updateComment($projectId, $questionId, $answerId, $comment) {
		$projectModel = new ProjectModel($projectId);
		$commentModel = new CommentModel();
		JsonDecoder::decode($commentModel, $comment);
		ActivityCommands::updateComment($projectModel, $questionId, $answerId, $comment);
		// TODO log the activity after we confirm that the comment was successfully updated ; cjh 2013-08
		return QuestionModel::writeComment($projectModel->databaseName(), $questionId, $answerId, $commentModel);
	}
	
}

?>