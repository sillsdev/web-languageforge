<?php

namespace models\languageforge\lexicon\commands;

use models\mapper\MapOf;

use models\languageforge\lexicon\settings\LexiconProjectSettings;

use models\languageforge\lexicon\settings\LexiconFieldListConfigObj;

use models\languageforge\lexicon\LexiconProjectModel;

use libraries\shared\palaso\CodeGuard;
use libraries\lfdictionary\common\UserActionDeniedException;
use models\commands\ActivityCommands;
use models\mapper\JsonEncoder;
use models\mapper\JsonDecoder;
use models\lex\LexEntryModel;
use models\lex\LexEntryIds;
use models\rights\Domain;
use models\rights\Operation;
use models\UserModel;
use models\mapper\ArrayOf;
use models\lex\LexEntryId;

class LexProjectCommands {

	public static function readSettings($projectId) {
		$project = new LexiconProjectModel($projectId);
		$settings = JsonEncoder::encode($project->settings);
		$settings['inputSystems'] = JsonEncoder::encode($project->inputSystems);
		// TODO Add. fieldUseCount needs to be calculated and injected IJH 2014-03 
		return $settings;
	}
	
	public static function updateSettings($projectId, $settings) {
		$project = new LexiconProjectModel($projectId);
		$settingsModel = new LexiconProjectSettings();
		JsonDecoder::decode($settingsModel, $settings);
		$project->settings = $settingsModel;
		$decoder = new JsonDecoder();
		$decoder->decodeMapOf('', $project->inputSystems, $settings['inputSystems']);
		$project->write();
	}
}

?>
