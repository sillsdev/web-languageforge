<?php

namespace models\dto;

use models\UserModel;

use models\TextModel;

use models\mapper\JsonEncoder;

use models\ProjectModel;

use models\QuestionModel;

class DtoEncoder extends JsonEncoder {
	
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
		$e = new DtoEncoder();
		return $e->_encode($model);
	}
}


class QuestionCommentDto
{
	/**
	 * 
	 * @param string $projectId
	 * @param string $questionId
	 * @returns array - the DTO array
	 */
	public static function encode($projectId, $questionId) {
		$projectModel = new ProjectModel($projectId);
		$questionModel = new QuestionModel($projectModel, $questionId);
		$question = DtoEncoder::encode($questionModel);
		$textId = $questionModel->textRef->asString();
		$textModel = new TextModel($projectModel, $textId);
		$text = JsonEncoder::encode($textModel);
		$data = array();
		$data['question'] = $question;
		$data['text'] = $text;
		$data['projectid'] = $projectId;
		
		return $data;
	}
}

?>