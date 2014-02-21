<?php

namespace models\scriptureforge\dto;

use models\shared\dto\RightsHelper;

use models\UnreadActivityModel;

use models\UnreadAnswerModel;
use models\UnreadCommentModel;

use models\UserVoteModel;

use models\ProjectModel;
use models\QuestionModel;
use models\TextModel;
use models\UserModel;
use models\mapper\JsonEncoder;

class QuestionCommentDto
{
	/**
	 * Encodes a QuestionModel and related data for $questionId
	 * @param string $projectId
	 * @param string $questionId
	 * @param string $userId
	 * @return array - The DTO.
	 */
	public static function encode($projectId, $questionId, $userId) {
		$userModel = new UserModel($userId);
		$projectModel = new ProjectModel($projectId);
		
		$questionModel = new QuestionModel($projectModel, $questionId);
		$question = QuestionCommentDtoEncoder::encode($questionModel);
		
		$textId = $questionModel->textRef->asString();
		$textModel = new TextModel($projectModel, $textId);
		$usxHelper = new UsxHelper($textModel->content);
		//echo $usxHelper->toHtml();
		//echo $textModel->content;
		
		$votes = new UserVoteModel($userId, $projectId, $questionId);
		$votesDto = array();
		foreach ($votes->votes as $vote) {
			$votesDto[$vote->answerRef->id] = true;
		}
		
		$unreadAnswerModel = new UnreadAnswerModel($userId, $projectModel->id->asString(), $questionId);
		$unreadAnswers = $unreadAnswerModel->unreadItems();
		$unreadAnswerModel->markAllRead();
		$unreadAnswerModel->write();
		
		$unreadCommentModel = new UnreadCommentModel($userId, $projectModel->id->asString(), $questionId);
		$unreadComments = $unreadCommentModel->unreadItems();
		$unreadCommentModel->markAllRead();
		$unreadCommentModel->write();
		
		$unreadActivityModel = new UnreadActivityModel($userId);
		$unreadActivity = $unreadActivityModel->unreadItems();
		
		$dto = array();
		$dto['question'] = $question;
		$dto['votes'] = $votesDto;
		$dto['text'] = JsonEncoder::encode($textModel);
		$dto['text']['content'] = $usxHelper->toHtml();
		$dto['project'] = JsonEncoder::encode($projectModel);
		$dto['rights'] = RightsHelper::encode($userModel, $projectModel);
		$dto['unreadAnswers'] = $unreadAnswers;
		$dto['unreadComments'] = $unreadComments;
		$dto['unreadActivityCount'] = count($unreadActivity);

		return $dto;
	}
	
	/**
	 * Encodes a $answerModel in the same method as returned by the 
	 * @param AnswerModel $answerModel
	 * @return array - The DTO.
	 */
	public static function encodeAnswer($answerModel) {
		$dto = QuestionCommentDtoEncoder::encode($answerModel);
		return $dto;
	}
	
	/**
	 * Encodes a $commentModel in the same method as returned by the 
	 * @param CommentModel $commentModel
	 * @return array - The DTO.
	 */
	public static function encodeComment($commentModel) {
		$dto = QuestionCommentDtoEncoder::encode($commentModel);
		return $dto;
	}
	
}

?>
