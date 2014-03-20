<?php

namespace models\languageforge\lexicon\dto;

use models\languageforge\lexicon\LexEntryModel;

use models\mapper\JsonEncoder;

use models\languageforge\lexicon\commands\LexProjectCommands;

use models\languageforge\lexicon\LexEntryListModel;

use models\languageforge\lexicon\LexiconProjectModel;

class LexProjectSettingsDto
{
	public static function encode($projectId) {
		$project = new LexiconProjectModel($projectId);
		$settings = JsonEncoder::encode($project->settings);
		$settings['inputSystems'] = JsonEncoder::encode($project->inputSystems);
		$settings['project'] = array('projectname' => $project->projectname);
		// TODO Add. fieldUseCount needs to be calculated and injected IJH 2014-03 
		return $settings;
	}
}

?>
