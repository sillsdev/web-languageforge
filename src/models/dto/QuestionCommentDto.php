<?php

namespace models\dto;

use models\UserModel;

use models\TextModel;

use models\mapper\JsonEncoder;

use models\ProjectModel;

use models\QuestionModel;

class QuestionCommentDto
{
	/**
	 * Encodes a QuestionModel and related data for $questionId
	 * @param string $projectId
	 * @param string $questionId
	 * @return array - The DTO.
	 */
	public static function encode($projectId, $questionId) {
		$projectModel = new ProjectModel($projectId);
		
		$questionModel = new QuestionModel($projectModel, $questionId);
		$question = QuestionCommentDtoEncoder::encode($questionModel);
		
		$textId = $questionModel->textRef->asString();
		$textModel = new TextModel($projectModel, $textId);
		$text = 

		$dto = array();
		$dto['question'] = $question;
		$dto['text'] = JsonEncoder::encode($textModel);
		$dto['project'] = JsonEncoder::encode($projectModel);
		
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
	
}

?>