<?php

namespace models\scriptureforge\dto;

use libraries\shared\Website;
use models\mapper\JsonEncoder;
use models\scriptureforge\SfchecksProjectModel;
use models\shared\dto\RightsHelper;
use models\TextListModel;
use models\TextModel;
use models\UserModel;
use models\ProjectModel;

class ProjectSettingsDto
{
	/**
	 * @param string $projectId
	 * @param string $userId
	 * @returns array - the DTO array
	 */
	public static function encode($projectId, $userId) {
		$userModel = new UserModel($userId);
		$projectModel = new SfchecksProjectModel($projectId);
		$textList = new TextListModel($projectModel);
		$textList->read();

		$list = $projectModel->listUsers();
		// remove unvalidated entries, e.g. unvalidated "Invite a friend"
		foreach ($list->entries as $key => $entry) {
			if (!array_key_exists('username', $entry) || !$entry['username']) {
				unset($list->entries[$key]);
			}
		}
		
		$data = array();
		$data['count'] = count($list->entries);
		$data['entries'] = array_values($list->entries);	// re-index array
		$data['project'] = JsonEncoder::encode($projectModel);
		unset($data['project']['users']);

		$data['archivedTexts'] = array();
		foreach ($textList->entries as $entry) {
			$textModel = new TextModel($projectModel, $entry['id']);
			if ($textModel->isArchived) {
				$questionList = $textModel->listQuestionsWithAnswers();
				// Just want count of questions and responses, not whole list
				$entry['questionCount'] = $questionList->count;
				$responseCount = 0; // "Responses" = answers + comments
				foreach ($questionList->entries as $q) {
					foreach ($q['answers'] as $a) {
						$commentCount = count($a['comments']);
						$responseCount += ($commentCount+1); // +1 for this answer
					}
				}
				$entry['responseCount'] = $responseCount;
				$entry['dateModified'] = $textModel->dateModified->format(\DateTime::RFC2822);

				$data['archivedTexts'][] = $entry;
			}
		}

		$data['rights'] = RightsHelper::encode($userModel, $projectModel);
		$data['bcs'] = BreadCrumbHelper::encode('settings', $projectModel, null, null);
		return $data;
	}
}

?>
