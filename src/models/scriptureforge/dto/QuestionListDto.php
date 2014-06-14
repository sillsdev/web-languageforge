<?php

namespace models\scriptureforge\dto;

use models\shared\dto\RightsHelper;
use models\shared\rights\ProjectRoles;
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
		$project = new SfchecksProjectModel($projectId);
		$text = new TextModel($project, $textId);
		$user = new UserModel($userId);
		if ($text->isArchived && $project->users[$userId]->role != ProjectRoles::MANAGER) {
			throw new \Exception("This Text is no longer available.\nIf this is incorrect contact your project manager.\n");
		}
		$questionList = new QuestionAnswersListModel($project, $textId);
		$questionList->read();

		$data = array();
		$data['rights'] = RightsHelper::encode($user, $project);
		$data['entries'] = array();
		$data['project'] = array(
				'name' => $project->projectname,
				'allowAudioDownload' => $project->allowAudioDownload,
				'id' => $projectId);
		$data['text'] = JsonEncoder::encode($text);
		$usxHelper = new UsxHelper($text->content);
		$data['text']['content'] = $usxHelper->toHtml();
		foreach ($questionList->entries as $questionData) {
			$question = new QuestionModel($project, $questionData['id']);
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
