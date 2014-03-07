<?php

namespace models\languageforge\lexicon\commands;

use libraries\shared\palaso\CodeGuard;
use libraries\lfdictionary\common\UserActionDeniedException;
use models\languageforge\lexicon\settings\LexiconProjectSettings;
use models\languageforge\lexicon\settings\LexiconFieldListConfigObj;
use models\languageforge\lexicon\LexiconProjectModel;
use models\commands\ActivityCommands;
use models\mapper\ArrayOf;
use models\mapper\MapOf;
use models\mapper\JsonEncoder;
use models\mapper\JsonDecoder;
use models\lex\LexEntryModel;
use models\lex\LexEntryId;
use models\lex\LexEntryIds;
use models\rights\Domain;
use models\rights\Operation;
use models\UserModel;

class LexProjectCommands {

	const DUPLICATES_IMPORTLOSES = 'importLoses';
	const DUPLICATES_IMPORTWINS = 'importWins';
	const DUPLICATES_ALLOW = 'createDuplicates';
	
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
	
	// TODO Enhance. Add preview of import. Would minimally include metrics of import. IJH 2014-03
	
	public static function importLift($projectId, $import) {
		$allowedExtensions = array(".lift");
		
		// LIFT file and file name
		$base64data = substr($import['file']['data'], 13);
		$liftXml = base64_decode($base64data);
		$fileName = str_replace(array('/', '\\', '?', '%', '*', ':', '|', '"', '<', '>'), '_', $import['file']['name']);	// replace special characters with _
		$fileExt = (false === $pos = strrpos($fileName, '.')) ? '' : substr($fileName, $pos);
		
		if (! in_array($fileExt, $allowedExtensions)) {
			$message = "$fileName is not an allowed LIFT file. Ensure the file is one of the following types: $allowedExtensionsStr.";
			if (count($allowedExtensions) == 1) {
				$message = "$fileName is not an allowed LIFT file. Ensure the file is a $allowedExtensionsStr.";
			}
			throw new \Exception($message);
		}
		
		// TODO Enhance. Validate LIFT file, throw exception if invalid. IJH 2014-03
		
		// make the folder if it doesn't exist
		$project = new LexiconProjectModel($projectId);
		$folderPath = $project->getAssetsFolderPath();
		if (!file_exists($folderPath) and !is_dir($folderPath)) {
			mkdir($folderPath, 0777, true);
		};
		
		if ($import['settings']['duplicates'] != self::DUPLICATES_IMPORTLOSES || !$project->liftFilePath) {
			// cleanup previous files of any allowed extension
			$cleanupFiles = glob($folderPath . '/*[' . implode(', ', $allowedExtensions) . ']');
			foreach ($cleanupFiles as $cleanupFile) {
				@unlink($cleanupFile);
			}
			
			// put the LIFT file into assets
			$filePath =  $folderPath . '/' . $fileName;
			$moveOk = file_put_contents($filePath, $liftXml);
	
			// update database with file location
			if ($moveOk) {
				$project->liftFilePath = $filePath;
			} else {
				$project->liftFilePath = '';
			}
			$project->write();
		}
			
	}
	
}

?>
