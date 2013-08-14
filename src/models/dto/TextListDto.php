<?php

namespace models\dto;

use models\ProjectModel;

use models\TextListModel;

use models\TextModel;


class TextListDto
{
	/**
	 *
	 * @param string $projectId
	 * @returns array - the DTO array
	 */
	public static function encode($projectId) {
		$projectModel = new ProjectModel($projectId);
		$textList = new TextListModel($projectModel);
		$textList->read();

		$data = array();
		$data['count'] = $textList->count;
		$data['entries'] = array();
		foreach ($textList->entries as $entry) {
			$textModel = new TextModel($projectModel, $entry['id']);
			$questionList = $textModel->listQuestions();
			// Just want question count, not whole list
			$entry['questionCount'] = $questionList->count;

			$data['entries'][] = $entry;
		}

		return $data;
	}
}

?>
