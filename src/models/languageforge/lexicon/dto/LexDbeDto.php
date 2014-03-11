<?php

namespace models\languageforge\lexicon\dto;

use models\languageforge\lexicon\LexEntryModel;

use models\mapper\JsonEncoder;

use models\languageforge\lexicon\commands\LexProjectCommands;

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
		
		$entriesModel = new LexEntryListModel($project);
		$entriesModel->read();
		$entries = $entriesModel->entries;
		
		$config = LexProjectCommands::readSettings($projectId);
		
		$lexemeWritingSystems = $config['entry']['fields']['lexeme']['inputSystems'];
		if (count($lexemeWritingSystems) > 0) {
			// sort by lexeme (first writing system)
			$ws = $lexemeWritingSystems[0];
			function lexeme_cmp($a, $b) { return ($a['lexeme'][$ws]['value'] > $b['lexeme'][$ws]['value']) ? 1 : -1;	}
			usort($entries, "lexeme_cmp");
		}

		$firstEntry = new LexEntryModel($projectModel);
		if ($entriesModel->count > 0) {
			$firstEntry = new LexEntryModel($entriesModel->entries[0]['id']);
		}
		
		return array(
			'entries' => $entries,
			'config' => $config,
			'entry' => JsonEncoder::encode($firstEntry)
		);
	}
}

?>
