<?php

namespace models\scriptureforge\dto;

use models\shared\dto\RightsHelper;
use models\scriptureforge\SfchecksProjectModel;
use models\mapper\JsonEncoder;
use models\ProjectModel;
use models\QuestionAnswersListModel;
use models\QuestionModel;
use models\TextModel;
use models\UserModel;

class QuestionListDto
{
	/**
	 *
	 * @param string $projectId
	 * @param string $textId
	 * @param string $userId
	 * @returns array - the DTO array
	 */
	public static function encode($projectId, $textId, $userId) {
		$userModel = new UserModel($userId);
		$projectModel = new SfchecksProjectModel($projectId);
		$questionList = new QuestionAnswersListModel($projectModel, $textId);
		$questionList->read();

		$data = array();
		$data['rights'] = RightsHelper::encode($userModel, $projectModel);
		$data['entries'] = array();
		$data['project'] = array(
				'name' => $projectModel->projectname,
				'allowAudioDownload' => $projectModel->allowAudioDownload,
				'id' => $projectId);
		$textModel = new TextModel($projectModel, $textId);
		$data['text'] = JsonEncoder::encode($textModel);
		$usxHelper = new UsxHelper($textModel->content);
		$data['text']['content'] = $usxHelper->toHtml();
		foreach ($questionList->entries as $questionData) {
			$question = new QuestionModel($projectModel, $questionData['id']);
			if (! $question->isArchived) {
				// Just want answer count, not whole list
				$questionData['answerCount'] = count($questionData['answers']);
				$responseCount = 0; // "Reponses" = answers + comments
				foreach ($questionData['answers'] as $a) {
					$commentCount = count($a['comments']);
					$responseCount += $commentCount+1; // +1 for this answer
				}
				$questionData['responseCount'] = $responseCount;
				unset($questionData['answers']);

				$data['entries'][] = $questionData;
			}
		}
		$data['count'] = count($data['entries']);

		return $data;
	}
}

?>
