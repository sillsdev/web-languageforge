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
     * @param bool $returnOnlyUpdates
     * @throws \Exception
     * @return array
     */
	public static function encode($projectId, $returnOnlyUpdates = true) {
		$project = new LexiconProjectModel($projectId);
		$entriesModel = new LexEntryListModel($project);
		$entriesModel->readForDto();
		$entries = $entriesModel->entries;

        $lexemeInputSystems = $project->config->entry->fields[LexiconConfigObj::LEXEME]->inputSystems;

		usort($entries, function ($a, $b) use ($lexemeInputSystems) {
            $lexeme1 = $a[LexiconConfigObj::LEXEME];
            $lexeme1Value = '';
            foreach ($lexemeInputSystems as $ws) {
                if (array_key_exists($ws, $lexeme1) && $lexeme1[$ws]['value'] != '') {
                    $lexeme1Value = $lexeme1[$ws]['value'];
                    break;
                }
            }
            $lexeme2 = $b[LexiconConfigObj::LEXEME];
            $lexeme2Value = '';
            foreach ($lexemeInputSystems as $ws) {
                if (array_key_exists($ws, $lexeme2) && $lexeme2[$ws]['value'] != '') {
                    $lexeme2Value = $lexeme2[$ws]['value'];
                    break;
                }
            }
            return (strtolower($lexeme1Value) > strtolower($lexeme2Value)) ? 1 : -1;
		});


		$data = array();
		$data['entries'] = $entries;
		$data['entriesTotalCount'] = count($entriesModel->entries);
        $data['comments'] = array(); // TODO implement comments

		return $data;
	}
}

?>
