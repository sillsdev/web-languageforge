<?php

namespace models\commands;

use models\UserVoteModel;

use models\dto\QuestionCommentDto;

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
		$projectModel = new ProjectModel($projectId);
		$answerModel = new AnswerModel();
		JsonDecoder::decode($answerModel, $answer);
		$answerModel->userRef->id = $userId;
		ActivityCommands::updateAnswer($projectModel, $questionId, $answerModel);
		// TODO log the activity after we confirm that the comment was successfully updated ; cjh 2013-08
		$questionModel = new QuestionModel($projectModel, $questionId);
		$answerId = $questionModel->writeAnswer($answerModel);
		// Re-read question model to pick up new answer
		$questionModel->read($questionId);
		return self::encodeAnswer($questionModel->readAnswer($answerId));
	}
	
	/**
	 * Creates / Updates a comment on the given answer. 
	 * @param string $projectId
	 * @param string $questionId
	 * @param string $answerId
	 * @param string $comment
	 * @param string $userId
	 * @return array Dto
	 */
	public static function updateComment($projectId, $questionId, $answerId, $comment, $userId) {
		$projectModel = new ProjectModel($projectId);
		$commentModel = new CommentModel();
		JsonDecoder::decode($commentModel, $comment);
		$commentModel->userRef->id = $userId;
		ActivityCommands::updateComment($projectModel, $questionId, $answerId, $commentModel);
		// TODO log the activity after we confirm that the comment was successfully updated ; cjh 2013-08
		$commentId = QuestionModel::writeComment($projectModel->databaseName(), $questionId, $answerId, $commentModel);
		$questionModel = new QuestionModel($projectModel, $questionId);
		$newComment = $questionModel->readComment($answerId, $commentId);
		$commentDTO = QuestionCommentDto::encodeComment($newComment);

		$dto = array();
		$dto[$commentId] = $commentDTO;
		return $dto;
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
		// Return the answer dto.
		return self::encodeAnswer($answerModel);
	}
	
	public static function voteDown($userId, $projectId, $questionId, $answerId) {
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
