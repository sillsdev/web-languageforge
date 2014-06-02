<?php

namespace models\commands;

use libraries\shared\palaso\CodeGuard;
use models\QuestionTemplateModel;
use models\mapper\JsonDecoder;
use models\mapper\JsonEncoder;
use models\QuestionTemplateListModel;

class QuestionTemplateCommands
{
	/**
	 * @param array $questionTemplateIds
	 * @return int Total number of questionTemplate questions removed.
	 */
	public static function deleteQuestionTemplates($questionTemplateIds) {
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
	
	public static function updateTemplate($params) {
		$questionTemplate = new \models\QuestionTemplateModel();
		JsonDecoder::decode($questionTemplate, $params);
		$result = $questionTemplate->write();
		return $result;
	}
	
	public static function readTemplate($id) {
		$questionTemplate = new \models\QuestionTemplateModel($id);
		return JsonEncoder::encode($questionTemplate);
	}
	
	public static function listTemplates() {
		$list = new \models\QuestionTemplateListModel();
		$list->read();
		return $list;
	}
}

?>
