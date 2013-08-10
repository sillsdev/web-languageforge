<?php

namespace models\dto;

use models\UserModel;

use models\TextModel;

use models\mapper\JsonEncoder;

use models\ProjectModel;

use models\QuestionModel;

class QuestionCommentDtoEncoder extends JsonEncoder {
	
	public function encodeIdReference($key, $model) {
		if ($key == 'userRef') {
			$user = new UserModel($model->id);
			return array(
					'userid' => $user->id->asString(),
					'avatar_ref' => $user->avatar_ref,
					'username' => $user->username);
		} else {
			$result = $model->id;
			return $result;
		}
	}
	
	public static function encode($model) {
		$e = new QuestionCommentDtoEncoder();
		return $e->_encode($model);
	}
}


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
		$text = JsonEncoder::encode($textModel);

		$dto = array();
		$dto['question'] = $question;
		$dto['text'] = $text;
		$dto['projectid'] = $projectId;
		
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