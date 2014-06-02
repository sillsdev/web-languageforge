<?php

namespace models\languageforge\lexicon\dto;

use models\languageforge\lexicon\commands\LexProjectCommands;
use models\languageforge\lexicon\LexEntryModel;
use models\languageforge\lexicon\LexEntryListModel;
use models\languageforge\lexicon\LexEntryWithCommentsEncoder;
use models\languageforge\lexicon\LexiconProjectModel;
use models\mapper\JsonEncoder;

class LexDbeDto {
	
	/**
	 * @param string $projectId
	 * @param string $userId
	 * @param int $iEntryStart
	 * @param int $numberOfEntries
	 */
	public static function encode($projectId, $userId, $iEntryStart = 0, $numberOfEntries = null) {
		$data = LexBaseViewDto::encode($projectId, $userId);
		
		$project = new LexiconProjectModel($projectId);
		
		$entriesModel = new LexEntryListModel($project);
		$entriesModel->readForDto();
		$entries = $entriesModel->entries;
		
		usort($entries, function ($a, $b) { 
			if (array_key_exists('lexeme', $a) && 
				array_key_exists('lexeme', $b)
			) {
				return (strtolower($a['lexeme']) > strtolower($b['lexeme'])) ? 1 : -1;
			} else {
				return 0;
			}
		});
		
		$entries = array_slice($entries, $iEntryStart, $numberOfEntries);
		
		$firstEntry = new LexEntryModel($project);
		if (count($entries) > 0) {
			$firstEntry = new LexEntryModel($project, $entries[0]['id']);
		}
		
		$data['entries'] = $entries;
		$data['entriesTotalCount'] = count($entriesModel->entries);
		$data['entry'] = LexEntryWithCommentsEncoder::encode($firstEntry);
		
		return $data;
	}
}

?>
