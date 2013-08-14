<?php

namespace models\dto;

use models\ProjectModel;

use models\QuestionAnswersListModel;


class QuestionListDto
{
	/**
	 *
	 * @param string $projectId
	 * @param string $textId
	 * @returns array - the DTO array
	 */
	public static function encode($projectId, $textId) {
		$projectModel = new ProjectModel($projectId);
		//$textModel = new TextModel($projectModel, $textId);
		$questionList = new QuestionAnswersListModel($projectModel, $textId);
		$questionList->read();

		$data = array();
		$data['count'] = $questionList->count;
		$data['entries'] = array();
		foreach ($questionList->entries as $questionData) {
			// Just want answer count, not whole list
			$questionData['answerCount'] = count($questionData['answers']);
			unset($questionData['answers']);

			$data['entries'][] = $questionData;
		}

		return $data;
	}
}

?>
