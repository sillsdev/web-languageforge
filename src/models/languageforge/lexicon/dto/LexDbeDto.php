<?php

namespace models\languageforge\lexicon\dto;

use models\languageforge\lexicon\commands\LexProjectCommands;
use models\languageforge\lexicon\LexEntryModel;
use models\languageforge\lexicon\LexEntryListModel;
use models\languageforge\lexicon\LexiconProjectModel;
use models\mapper\JsonEncoder;

class LexDbeDto {
	
	/**
	 * @param string $projectId
	 * @param string $userId
	 * @returns array - the DTO array
	 */
	public static function encode($projectId, $userId, $entryLoadStart, $entryLoadLength) {
		$data = LexBaseViewDto::encode($projectId, $userId);
		
		$project = new LexiconProjectModel($projectId);
		
		$entriesModel = new LexEntryListModel($project);
		$entriesModel->read();
		$entries = $entriesModel->entries;
		
		$lexemeWritingSystems = $data['config']['entry']['fields']['lexeme']['inputSystems'];
		if (count($lexemeWritingSystems) > 0) {
			// sort by lexeme (first writing system)
			$ws = $lexemeWritingSystems[0];
			usort($entries, function ($a, $b) use ($ws) { 
				if (array_key_exists('lexeme', $a) && 
					array_key_exists('lexeme', $b) &&
					array_key_exists($ws, $a['lexeme']) &&
					array_key_exists($ws, $b['lexeme'])
				) {
					return ($a['lexeme'][$ws]['value'] > $b['lexeme'][$ws]['value']) ? 1 : -1;
				} else {
					return 0;
				}
			});
		}

		$firstEntry = new LexEntryModel($project);
		$entriesCount = count($entries);
		if ($entriesCount > 0) {
			$firstEntry = new LexEntryModel($project, $entries[0]['id']);
		}
		
		$data['entries'] = $entries;
		$data['entriesCount'] = $entriesCount;
		$data['entry'] = JsonEncoder::encode($firstEntry);
		
		return $data;
	}
}

?>
