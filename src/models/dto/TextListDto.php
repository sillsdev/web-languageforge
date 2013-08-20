<?php

namespace models\dto;

use models\UserModel;

use models\ProjectModel;

use models\TextListModel;

use models\TextModel;


class TextListDto
{
	/**
	 *
	 * @param string $projectId
	 * @param string $userId
	 * @returns array - the DTO array
	 */
	public static function encode($projectId, $userId) {
		$userModel = new UserModel($userId);
		$projectModel = new ProjectModel($projectId);
		$textList = new TextListModel($projectModel);
		$textList->read();

		$data = array();
		$data['rights'] = RightsHelper::encode($userModel, $projectModel);
		$data['count'] = $textList->count;
		$data['project'] = array(
				'name' => $projectModel->projectname,
				'id' => $projectId);
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
