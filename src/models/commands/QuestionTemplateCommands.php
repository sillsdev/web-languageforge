<?php

namespace models\commands;

use libraries\palaso\CodeGuard;

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
}

?>
