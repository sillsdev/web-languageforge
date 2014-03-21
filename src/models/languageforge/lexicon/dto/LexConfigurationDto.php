<?php

namespace models\languageforge\lexicon\dto;

use models\languageforge\lexicon\commands\LexProjectCommands;
use models\languageforge\lexicon\LexEntryListModel;
use models\languageforge\lexicon\LexEntryModel;
use models\languageforge\lexicon\LexiconProjectModel;
use models\mapper\JsonEncoder;

class LexConfigurationDto
{
	public static function encode($projectId) {
		$project = new LexiconProjectModel($projectId);
		$config = JsonEncoder::encode($project->settings);
		$config['inputSystems'] = JsonEncoder::encode($project->inputSystems);
		$config['project'] = array('projectname' => $project->projectname);
		// TODO Add. fieldUseCount needs to be calculated and injected IJH 2014-03 
		return $config;
	}
}

?>
