<?php

namespace models\languageforge\lexicon\dto;

use models\languageforge\lexicon\LexEntryListModel;

use models\languageforge\lexicon\LexiconProjectModel;

class LexDbeDto
{
	/**
	 *
	 * @param string $projectId
	 * @param string $textId
	 * @param string $userId
	 * @returns array - the DTO array
	 */

	public static function encode($projectId) {
		
		$project = new LexiconProjectModel($projectId);
		
		$entries = new LexEntryListModel($project);
		$entries->read();
		
		/*
		 * to encode:
		 * 
		 * entries
		 * config
		 * first entry (for display)
		 */
		
	}
}

?>
