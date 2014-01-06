<?php

namespace models\commands;

use models\ProjectModel;
use models\TextModel;
use models\dto\UsxTrimHelper;
use models\mapper\JsonDecoder;
use models\commands\ActivityCommands;

class TextCommands
{
	
	private static function hasRange($object) {
		if (isset($object['startCh'])) {
			$sc = (int)$object['startCh'];
		} else {
			$sc = 0;
		}
		if (isset($object['startVs'])) {
			$sv = (int)$object['startVs'];
		} else {
			$sv = 0;
		}
		if (isset($object['endCh'])) {
			$ec = (int)$object['endCh'];
		} else {
			$ec = 0;
		}
		if (isset($object['endVs'])) {
			$ev = (int)$object['endVs'];
		} else {
			$ev = 0;
		}
		return ($sc || $sv || $ec || $ev);
	}

	/**
	 * @param string $projectId
	 * @param JSON $object
	 * @return ID of text updated/added
	 */
	public static function updateText($projectId, $object, $authUserId) {
		// TODO: validate $authUserId as authorized to perform this action
		$projectModel = new \models\ProjectModel($projectId);
		$textModel = new \models\TextModel($projectModel);
		$isNewText = ($object['id'] == '');
		if (!$isNewText) {
			$textModel->read($object['id']);
		}
		JsonDecoder::decode($textModel, $object);
		if (TextCommands::hasRange($object)) {
			$usxTrimHelper = new UsxTrimHelper(
				$textModel->content,
				$object['startCh'],
				$object['startVs'],
				$object['endCh'],
				$object['endVs']
			);
			$textModel->content = $usxTrimHelper->trimUsx();
		}
		$textId = $textModel->write();
		if ($isNewText) {
			ActivityCommands::addText($projectModel, $textId, $textModel);
		}
		return $textId;
	}
	
	/**
	 * 
	 * @param string $projectId
	 * @param string $textId
	 * @param string $authUserId - the admin user's id performing the update (for auth purposes)
	 */
	public static function readText($projectId, $textId, $authUserId) {
		// TODO: validate $authUserId as authorized to perform this action
		$projectModel = new \models\ProjectModel($projectId);
		$textModel = new \models\TextModel($projectModel, $textId);
		return JsonEncoder::encode($textModel);
	}

	/**
	 * @param string $projectId
	 * @param array $textIds
	 * @param string $authUserId - the admin user's id performing the update (for auth purposes)
	 * @return int Total number of projects removed.
	 */
	public static function deleteTexts($projectId, $textIds, $authUserId) {
		// TODO: validate $authUserId as authorized to perform this action
		$projectModel = new ProjectModel($projectId);
		$count = 0;
		foreach ($textIds as $textId) {
			TextModel::remove($projectModel->databaseName(), $textId);
			$count++;
		}
		return $count;
	}
	
	/**
	 * 
	 * @param string $projectId
	 * @param string $authUserId - the admin user's id performing the update (for auth purposes)
	 * @return \models\TextListModel
	 */
	public static function listTexts($projectId, $authUserId) {
		// TODO: validate $authUserId as authorized to perform this action
		$projectModel = new \models\ProjectModel($projectId);
		$textListModel = new \models\TextListModel($projectModel);
		$textListModel->read();
		return $textListModel;
	}
	
}

?>
