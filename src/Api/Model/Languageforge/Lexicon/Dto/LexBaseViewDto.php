<?php

namespace Api\Model\Languageforge\Lexicon\Dto;

use Api\Model\Languageforge\Lexicon\Command\SendReceiveCommands;
use Api\Model\Languageforge\Lexicon\LexProjectModel;
use Api\Model\Languageforge\Lexicon\LexOptionListListModel;
use Api\Model\Mapper\JsonEncoder;
use Api\Model\UserProfileModel;

class LexBaseViewDto
{
    /**
     * @param string $projectId
     * @param string $userId
     * @return array - the DTO array
     */
    public static function encode($projectId, $userId)
    {
        $data = array();
        $user = new UserProfileModel($userId);
        $project = new LexProjectModel($projectId);

        $config = JsonEncoder::encode($project->config);
        $config['inputSystems'] = JsonEncoder::encode($project->inputSystems);
        $data['config'] = $config;

        // comment out at the moment until a refactor can be done that is more efficient (language data in the database?)
        /*
        $interfaceLanguageCode = $project->interfaceLanguageCode;
        if ($user->interfaceLanguageCode) {
            $interfaceLanguageCode = $user->interfaceLanguageCode;
        }
        $options = self::getInterfaceLanguages(APPPATH . 'angular-app/languageforge/lexicon/lang');
        asort($options);    // sort by language name
        $selectInterfaceLanguages = array(
            'optionsOrder' => array_keys($options),
            'options' => $options
        );
        $data['interfaceConfig'] = array('userLanguageCode' => $interfaceLanguageCode);
        $data['interfaceConfig']['selectLanguages'] = $selectInterfaceLanguages;
        */
        // a stand in for the code above
        $data['interfaceConfig'] = array('userLanguageCode' => 'en', 'selectLanguages' => array('options' => array('en' => 'English'), 'optionsOrder' => array('en')));

        $optionlistListModel = new LexOptionListListModel($project);
        $optionlistListModel->read();
        $data['optionlists'] = $optionlistListModel->entries;

        if ($project->hasSendReceive()) {
            $data['sendReceive'] = array();
            $data['sendReceive']['status'] = SendReceiveCommands::getProjectStatus($projectId);
        }

        return $data;
    }

    // comment out at the moment until a refactor can be done that is more efficient (language data in the database?)
    /*
    private static function getInterfaceLanguages($dir)
    {
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
    */

}
