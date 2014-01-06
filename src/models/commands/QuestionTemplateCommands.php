<?php

namespace models\commands;

use libraries\palaso\CodeGuard;

class QuestionTemplateCommands
{
	/**
	 * @param array $questionTemplateIds
	 * @return int Total number of questionTemplate questions removed.
	 */
	public static function deleteQuestionTemplates($questionTemplateIds, $authUserId) {
		// TODO: validate $authUserId as authorized to perform this action
		CodeGuard::checkTypeAndThrow($questionTemplateIds, 'array');
		$count = 0;
		foreach ($questionTemplateIds as $questionTemplateId) {
			CodeGuard::checkTypeAndThrow($questionTemplateId, 'string');
			$questionTemplate = new \models\QuestionTemplateModel($questionTemplateId);
			$questionTemplate->remove($questionTemplateId);
			$count++;
		}
		return $count;
	}
	
	public static function updateTemplate($params, $authUserId) {
		// TODO: validate $authUserId as authorized to perform this action
		$questionTemplate = new \models\QuestionTemplateModel();
		JsonDecoder::decode($questionTemplate, $params);
		$result = $questionTemplate->write();
		return $result;
	}
	
	public static function readTemplate($id, $authUserId) {
		// TODO: validate $authUserId as authorized to perform this action
		$questionTemplate = new \models\QuestionTemplateModel($id);
		return JsonEncoder::encode($questionTemplate);
	}
	
	public static function listTemplates($authUserId) {
		// TODO: validate $authUserId as authorized to perform this action
		$list = new \models\QuestionTemplateListModel();
		$list->read();
		return $list;
	}
}

?>
