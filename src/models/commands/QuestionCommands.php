<?php

namespace models\commands;

use models\UserVoteModel;
use models\dto\QuestionCommentDto;
use models\CommentModel;
use models\AnswerModel;
use models\ProjectModel;
use models\QuestionModel;
use models\mapper\JsonDecoder;
use models\mapper\JsonEncoder;
use models\commands\ActivityCommands;

class QuestionCommands
{
	
	public static function updateQuestion($projectId, $object, $authUserId) {
		// TODO: validate $authUserId as authorized to perform this action
		$projectModel = new \models\ProjectModel($projectId);
		$questionModel = new \models\QuestionModel($projectModel);
		$isNewQuestion = ($object['id'] == '');
		if (!$isNewQuestion) {
			$questionModel->read($object['id']);
		}
		JsonDecoder::decode($questionModel, $object);
		$questionId = $questionModel->write();
		if ($isNewQuestion) {
			ActivityCommands::addQuestion($projectModel, $questionId, $questionModel);
		}
		return $questionId;
	}
	
	public static function readQuestion($projectId, $questionId, $authUserId) {
		// TODO: validate $authUserId as authorized to perform this action
		$projectModel = new \models\ProjectModel($projectId);
		$questionModel = new \models\QuestionModel($projectModel, $questionId);
		return JsonEncoder::encode($questionModel);
	}
	
	/**
	 * @param string $projectId
	 * @param array $questionIds
	 * @return int Total number of questions removed.
	 */
	public static function deleteQuestions($projectId, $questionIds, $authUserId) {
		// TODO: validate $authUserId as authorized to perform this action
		$projectModel = new ProjectModel($projectId);
		$count = 0;
		foreach ($questionIds as $questionId) {
			QuestionModel::remove($projectModel->databaseName(), $questionId);
			$count++;
		}
		return $count;
	}
	
	/* deprecated - cjh - use dto instead
	public static function listQuestions($projectId, $textId, $authUserId) {
		// TODO: validate $authUserId as authorized to perform this action
		$projectModel = new \models\ProjectModel($projectId);
		$questionListModel = new \models\QuestionListModel($projectModel, $textId);
		$questionListModel->read();
		return $questionListModel;
	}
	*/
	
	/**
	 * Creates or updates an answer for the given $questionId.
	 * @param string $projectId
	 * @param string $questionId
	 * @param array $answer	The $answer will be decoded into an AnswerModel
	 * @param string $userId
	 * @return array Returns an encoded QuestionDTO fragment for the Answer
	 * @see AnswerModel
	 */
	public static function updateAnswer($projectId, $questionId, $answer, $userId) {
		// TODO: validate $userId as authorized to perform this action
		$projectModel = new ProjectModel($projectId);
		$questionModel = new QuestionModel($projectModel, $questionId);
		$authorId = $userId;
		if ($answer['id'] != '') {
			// update existing answer
			$oldAnswer = $questionModel->readAnswer($answer['id']);
			$authorId = $oldAnswer->userRef->asString();
		}
		$answerModel = new AnswerModel();
		JsonDecoder::decode($answerModel, $answer);
		$answerModel->userRef->id = $authorId;
		$answerId = $questionModel->writeAnswer($answerModel);
		// Re-read question model to pick up new answer
		$questionModel->read($questionId);
		$newAnswer = $questionModel->readAnswer($answerId);
		if ($answer['id'] != '') {
			// TODO log the activity after we confirm that the comment was successfully updated ; cjh 2013-08
			ActivityCommands::updateAnswer($projectModel, $questionId, $newAnswer);
		} else {
			ActivityCommands::addAnswer($projectModel, $questionId, $newAnswer);
		}
		return self::encodeAnswer($newAnswer);
	}
	
	/* note: I think this is never used.  Vote up/down is used instead - cjh
	public static function updateAnswerScore($projectId, $questionId, $answerId, $score, $authUserId) {
		// TODO: validate $authUserId as authorized to perform this action
		$projectModel = new \models\ProjectModel($projectId);
		$questionModel = new QuestionModel($projectModel, $questionId);
		$answerModel = $questionModel->readAnswer($answerId);
		$lastScore = $answerModel->score;
		$currentScore = intval($score);
		$answerModel->score = $currentScore;
		$questionModel->writeAnswer($answerModel);
		if ($currentScore > $lastScore) {
			ActivityCommands::updateScore($projectModel, $questionId, $answerId, $this->_userId, 'increase');
		} else {
			ActivityCommands::updateScore($projectModel, $questionId, $answerId, $this->_userId, 'decrease');
		}
	}
	*/
	
	public static function removeAnswer($projectId, $questionId, $answerId, $authUserId) {
		// TODO: validate $authUserId as authorized to perform this action
		$projectModel = new \models\ProjectModel($projectId);
		return QuestionModel::removeAnswer($projectModel->databaseName(), $questionId, $answerId);
	}
	
	/**
	 * Creates / Updates a comment on the given answer. 
	 * @param string $projectId
	 * @param string $questionId
	 * @param string $answerId
	 * @param array $comment
	 * @param string $userId
	 * @return array Dto
	 */
	public static function updateComment($projectId, $questionId, $answerId, $comment, $userId) {
		// TODO: validate $userId as authorized to perform this action
		$projectModel = new ProjectModel($projectId);
		$questionModel = new QuestionModel($projectModel, $questionId);
		$authorId = $userId;
		if ($comment['id'] != '') {
			// update existing comment
			$oldComment = $questionModel->readComment($answerId, $comment['id']);
			$authorId = $oldComment->userRef->asString();
		}
		$commentModel = new CommentModel();
		JsonDecoder::decode($commentModel, $comment);
		$commentModel->userRef->id = $authorId;
		$commentId = QuestionModel::writeComment($projectModel->databaseName(), $questionId, $answerId, $commentModel);
		$questionModel->read($questionId);
		$newComment = $questionModel->readComment($answerId, $commentId);
		$commentDTO = QuestionCommentDto::encodeComment($newComment);
		
		if ($comment['id'] != '') {
			// TODO log the activity after we confirm that the comment was successfully updated ; cjh 2013-08
			ActivityCommands::updateComment($projectModel, $questionId, $answerId, $newComment);
		} else {
			ActivityCommands::addComment($projectModel, $questionId, $answerId, $newComment);
		}

		$dto = array();
		$dto[$commentId] = $commentDTO;
		return $dto;
	}
	
	public static function removeComment($projectId, $questionId, $answerId, $commentId, $authUserId) {
		// TODO: validate $authUserId as authorized to perform this action
		$projectModel = new \models\ProjectModel($projectId);
		return QuestionModel::removeComment($projectModel->databaseName(), $questionId, $answerId, $commentId);
	}

	/**
	 * Returns the AnswerModel as an AnswerDTO, a part of the QuestionDTO.
	 * @param AnswerModel $answerModel
	 * @return array
	 */
	private static function encodeAnswer($answerModel) {
		$answerDTO = QuestionCommentDto::encodeAnswer($answerModel);
		$answerId = $answerModel->id->asString();
		$dto = array();
		$dto[$answerId] = $answerDTO;
		return $dto;
	}
	
	/**
	 * Up votes the given answer, if permitted for the given $userId
	 * @param string $userId 
	 * @param string $projectId
	 * @param string $questionId
	 * @param string $answerId
	 */
	public static function voteUp($userId, $projectId, $questionId, $answerId) {
		// TODO: validate $userId as authorized to perform this action
		$projectModel = new ProjectModel($projectId);
		$questionModel = new QuestionModel($projectModel, $questionId);
		// Check the vote lock.
		$vote = new UserVoteModel($userId, $projectId, $questionId);
		if ($vote->hasVote($answerId)) {
			// Don't throw.  There's no harm in this, just don't increment the vote.
			return self::encodeAnswer($questionModel->readAnswer($answerId));
		}
		// If ok up vote the question and add the lock.
		$answerModel = $questionModel->readAnswer($answerId);
		$answerModel->score++;
		$questionModel->writeAnswer($answerModel);
		$vote->addVote($answerId);
		$vote->write();
		ActivityCommands::updateScore($projectModel, $questionId, $answerId, $userId);
		// Return the answer dto.
		return self::encodeAnswer($answerModel);
	}
	
	public static function voteDown($userId, $projectId, $questionId, $answerId) {
		// TODO: validate $userId as authorized to perform this action
		$projectModel = new ProjectModel($projectId);
		$questionModel = new QuestionModel($projectModel, $questionId);
		// Check the vote lock.
		$vote = new UserVoteModel($userId, $projectId, $questionId);
		if (!$vote->hasVote($answerId)) {
			// Don't throw.  There's no harm in this, just don't decrement the vote.
			return self::encodeAnswer($questionModel->readAnswer($answerId));
		}
		// If ok down vote the question and remove the lock.
		$answerModel = $questionModel->readAnswer($answerId);
		$answerModel->score--;
		$questionModel->writeAnswer($answerModel);
		$vote->removeVote($answerId);
		$vote->write();
		// Return the answer dto.
		return self::encodeAnswer($answerModel);
	}
	
}

?>
