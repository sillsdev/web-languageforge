<?php

namespace models\languageforge\lexicon\dto;

use models\languageforge\lexicon\LexiconProjectModel;
use models\mapper\JsonEncoder;
use models\shared\dto\RightsHelper;
use models\ProjectModel;
use models\UserProfileModel;
use libraries\shared\LanguageData;

class LexBaseViewDto {
	
	/**
	 * @param string $projectId
	 * @param string $userId
	 * @return array - the DTO array
	 */
	public static function encode($projectId, $userId) {
		$user = new UserProfileModel($userId);
		$project = new LexiconProjectModel($projectId);

		$config = JsonEncoder::encode($project->config);
		$config['inputSystems'] = JsonEncoder::encode($project->inputSystems);
		
		$interfaceLanguageCode = $project->interfaceLanguageCode;
		if ($user->interfaceLanguageCode) {
			$interfaceLanguageCode = $user->interfaceLanguageCode;
		}
		
		$options = self::getInterfaceLanguages(APPPATH . 'angular-app/languageforge/lexicon/lang');
		asort($options);	// sort by language name
		$selectInterfaceLanguages = array(
			'optionsOrder' => array_keys($options),
			'options' => $options
		);
		
		$data = array();
		$data['config'] = $config;
		$data['project'] = array('projectName' => $project->projectName);
		$data['interfaceConfig'] = array('userLanguageCode' => $interfaceLanguageCode);
		$data['interfaceConfig']['selectLanguages'] = $selectInterfaceLanguages;
		$data['rights'] = RightsHelper::encode($user, $project);
		
		return $data;
	}
	
	private static function getInterfaceLanguages($dir) {
		$result = array();
		$languageData = new LanguageData();
		if (is_dir($dir) && ($handle = opendir($dir))) {
			while ($filename = readdir($handle)) {
				$filepath = $dir . '/' . $filename;
				if (is_file($filepath)) {
					if (pathinfo($filename, PATHINFO_EXTENSION) == 'json') {
						$code = pathinfo($filename, PATHINFO_FILENAME);
						$languageName = $languageData[$code]->name;
						$result[$code] = $languageName;
					}
				}
			}
			closedir($handle);
		}
		
		return  $result;
	}
	
}

?>
