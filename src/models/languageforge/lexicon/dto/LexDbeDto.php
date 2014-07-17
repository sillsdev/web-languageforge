<?php

namespace models\languageforge\lexicon\dto;

use models\languageforge\lexicon\commands\LexProjectCommands;
use models\languageforge\lexicon\config\LexiconConfigObj;
use models\languageforge\lexicon\LexEntryModel;
use models\languageforge\lexicon\LexEntryListModel;
use models\languageforge\lexicon\LexEntryWithCommentsEncoder;
use models\languageforge\lexicon\LexiconProjectModel;

class LexDbeDto {
	
	/**
	 * @param string $projectId
	 * @param string $userId
	 * @param int $iEntryStart
	 * @param int $numberOfEntries
	 */
	public static function encode($projectId, $userId, $iEntryStart = 0, $numberOfEntries = null) {
		$project = new LexiconProjectModel($projectId);
		$entriesModel = new LexEntryListModel($project);
		$entriesModel->readForDto();
		$entries = $entriesModel->entries;

        $lexemeInputSystems = $project->config->entry->fields[LexiconConfigObj::LEXEME]->inputSystems;

		usort($entries, function ($a, $b) use ($lexemeInputSystems) {
            $lexeme1 = $a[LexiconConfigObj::LEXEME];
            $lexeme1Value = '';
            foreach ($lexemeInputSystems as $ws) {
                if (array_key_exists($ws, $lexeme1)) {
                    $lexeme1Value = $lexeme1[$ws]['value'];
                    break;
                }
            }
            $lexeme2 = $b[LexiconConfigObj::LEXEME];
            $lexeme2Value = '';
            foreach ($lexemeInputSystems as $ws) {
                if (array_key_exists($ws, $lexeme2)) {
                    $lexeme2Value = $lexeme2[$ws]['value'];
                    break;
                }
            }
            return (strtolower($lexeme1Value) > strtolower($lexeme2Value)) ? 1 : -1;
		});

		$entries = array_slice($entries, $iEntryStart, $numberOfEntries);
		
		$firstEntry = new LexEntryModel($project);
		if (count($entries) > 0) {
			$firstEntry = new LexEntryModel($project, $entries[0]['id']);
		}
		
		$data = array();
		$data['entries'] = $entries;
		$data['entriesTotalCount'] = count($entriesModel->entries);
		$data['entry'] = LexEntryWithCommentsEncoder::encode($firstEntry);
		
		return $data;
	}
}

?>
