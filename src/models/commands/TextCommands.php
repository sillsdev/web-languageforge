<?php

namespace models\commands;

use models\ProjectModel;
use models\TextModel;

class TextCommands
{
	
	/**
	 * @param string $projectId
	 * @param array $textIds
	 * @return int Total number of projects removed.
	 */
	public static function deleteTexts($projectId, $textIds) {
		$projectModel = new ProjectModel($projectId);
		$count = 0;
		foreach ($textIds as $textId) {
			TextModel::remove($projectModel->databaseName(), $textId);
			$count++;
		}
		return $count;
	}
	
}

?>