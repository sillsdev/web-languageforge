<?php

namespace models\languageforge\lexicon\commands;

use libraries\shared\palaso\CodeGuard;
use libraries\lfdictionary\common\UserActionDeniedException;
use models\languageforge\lexicon\config\LexConfiguration;
use models\languageforge\lexicon\config\LexiconFieldListConfigObj;
use models\languageforge\lexicon\LexiconProjectModel;
use models\languageforge\lexicon\LexEntryModel;
use models\languageforge\lexicon\LiftImport;
use models\languageforge\lexicon\LiftMergeRule;
use models\commands\ActivityCommands;
use models\mapper\ArrayOf;
use models\mapper\MapOf;
use models\mapper\JsonEncoder;
use models\mapper\JsonDecoder;
use models\rights\Domain;
use models\rights\Operation;
use models\UserModel;

class LexProjectCommands {

	public static function updateConfig($projectId, $config) {
		$project = new LexiconProjectModel($projectId);
		$configModel = new LexConfiguration();
		JsonDecoder::decode($configModel, $config);
		$project->config = $configModel;
		$decoder = new JsonDecoder();
		$decoder->decodeMapOf('', $project->inputSystems, $config['inputSystems']);
		$project->write();
	}
	
	// TODO Enhance. Add preview of import. Would minimally include metrics of import. IJH 2014-03
	
	public static function importLift($projectId, $import) {
		$allowedExtensions = array(".lift");
		
		// LIFT file
		$base64data = substr($import['file']['data'], strpos($import['file']['data'], 'base64,')+7);
		$liftXml = base64_decode($base64data);
		
		// LIFT file name
		$fileName = str_replace(array('/', '\\', '?', '%', '*', ':', '|', '"', '<', '>'), '_', $import['file']['name']);	// replace special characters with _
		$fileExt = (false === $pos = strrpos($fileName, '.')) ? '' : substr($fileName, $pos);
		if (! in_array($fileExt, $allowedExtensions)) {
			$allowedExtensionsList = "*" . implode(", *", $allowedExtensions);
			$message = "$fileName is not an allowed LIFT file. Ensure the file is one of the following types: $allowedExtensionsList.";
			if (count($allowedExtensions) == 1) {
				$message = "$fileName is not an allowed LIFT file. Ensure it is a $allowedExtensionsList file.";
			}
			throw new \Exception($message);
		}
		
		// make the Assets folder if it doesn't exist
		$project = new LexiconProjectModel($projectId);
		$folderPath = $project->getAssetsFolderPath();
		if (!file_exists($folderPath) and !is_dir($folderPath)) {
			mkdir($folderPath, 0777, true);
		};
		
		LiftImport::merge($liftXml, $project, $import['settings']['mergeRule'], $import['settings']['skipSameModTime'], $import['settings']['deleteMatchingEntry']);
		
		if (!$project->liftFilePath || $import['settings']['mergeRule'] != LiftMergeRule::IMPORT_LOSES) {
			// cleanup previous files of any allowed extension
			$cleanupFiles = glob($folderPath . '/*[' . implode(', ', $allowedExtensions) . ']');
			foreach ($cleanupFiles as $cleanupFile) {
				@unlink($cleanupFile);
			}
			
			// put the LIFT file into Assets
			$filePath =  $folderPath . '/' . $fileName;
			$moveOk = file_put_contents($filePath, $liftXml);
			
			// update database with file location
			$project->liftFilePath = '';
			if ($moveOk) {
				$project->liftFilePath = $filePath;
			}
		}
		
		$project->write();
	}
	
}

?>
