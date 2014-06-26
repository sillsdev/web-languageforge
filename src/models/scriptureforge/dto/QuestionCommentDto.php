<?php

namespace models\scriptureforge\dto;

use models\shared\dto\RightsHelper;
use models\shared\rights\ProjectRoles;
use models\scriptureforge\SfchecksProjectModel;
use models\mapper\JsonEncoder;
use models\ProjectModel;
use models\QuestionModel;
use models\TextModel;
use models\UnreadActivityModel;
use models\UnreadAnswerModel;
use models\UnreadCommentModel;
use models\UserModel;
use models\UserVoteModel;

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
		$user = new UserModel($userId);
		$project = new SfchecksProjectModel($projectId);
		$question = new QuestionModel($project, $questionId);
		$textId = $question->textRef->asString();
		$text = new TextModel($project, $textId);
		if (($text->isArchived || $question->isArchived) && $project->users[$userId]->role != ProjectRoles::MANAGER) {
			throw new \Exception("This Question is no longer available.\nIf this is incorrect contact your project manager.\n");
		}
		$usxHelper = new UsxHelper($text->content);
		//echo $usxHelper->toHtml();
		//echo $text->content;
		
		$votes = new UserVoteModel($userId, $projectId, $questionId);
		$votesDto = array();
		foreach ($votes->votes as $vote) {
			$votesDto[$vote->answerRef->id] = true;
		}
		
		$unreadAnswerModel = new UnreadAnswerModel($userId, $project->id->asString(), $questionId);
		$unreadAnswers = $unreadAnswerModel->unreadItems();
		$unreadAnswerModel->markAllRead();
		$unreadAnswerModel->write();
		
		$unreadCommentModel = new UnreadCommentModel($userId, $project->id->asString(), $questionId);
		$unreadComments = $unreadCommentModel->unreadItems();
		$unreadCommentModel->markAllRead();
		$unreadCommentModel->write();
		
		$unreadActivityModel = new UnreadActivityModel($userId);
		$unreadActivity = $unreadActivityModel->unreadItems();
		
		$dto = array();
		$dto['question'] = QuestionCommentDtoEncoder::encode($question);
		$dto['votes'] = $votesDto;
		$dto['text'] = JsonEncoder::encode($text);
		$dto['text']['content'] = $usxHelper->toHtml();
		$dto['project'] = JsonEncoder::encode($project);
		$dto['rights'] = RightsHelper::encode($user, $project);
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
