<?php

namespace models\languageforge\lexicon\dto;

use libraries\shared\LanguageData;
use models\languageforge\lexicon\LexiconProjectModel;
use models\languageforge\lexicon\LexOptionListListModel;
use models\shared\dto\RightsHelper;
use models\mapper\JsonEncoder;
use models\ProjectModel;
use models\UserProfileModel;

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

        $optionlistListModel = new LexOptionListListModel($project);
        $optionlistListModel->read();
		
		$data = array();
		$data['config'] = $config;
        $data['optionlists'] = $optionlistListModel->entries;
		$data['interfaceConfig'] = array('userLanguageCode' => $interfaceLanguageCode);
		$data['interfaceConfig']['selectLanguages'] = $selectInterfaceLanguages;
		
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
