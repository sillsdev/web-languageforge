<?php

namespace Api\Model\Languageforge\Lexicon\Dto;

use Api\Model\Languageforge\Lexicon\Command\SendReceiveCommands;
use Api\Model\Languageforge\Lexicon\LexProjectModel;
use Api\Model\Languageforge\Lexicon\LexOptionListListModel;
use Api\Model\Shared\Mapper\JsonEncoder;
use Api\Model\Shared\UserModel;

class LexBaseViewDto
{
    /**
     * @param string $projectId
     * @param string $userId
     * @return array - the DTO array
     */
    public static function encode($projectId, $userId)
    {
        $data = [];
        $user = new UserModel($userId);
        $project = new LexProjectModel($projectId);

        $config = JsonEncoder::encode($project->config);
        $config["inputSystems"] = JsonEncoder::encode($project->inputSystems);
        $data["config"] = $config;

        $interfaceLanguageCode = $project->interfaceLanguageCode;
        $isUserLanguageCode = false;
        if ($user->interfaceLanguageCode && $user->interfaceLanguageCode != $project->interfaceLanguageCode) {
            $interfaceLanguageCode = $user->interfaceLanguageCode;
            $isUserLanguageCode = true;
        }

        $data["interfaceConfig"] = [
            "languageCode" => $interfaceLanguageCode,
            "isUserLanguageCode" => $isUserLanguageCode,
        ];

        // comment out at the moment until a refactor can be done that is more efficient (language data in the database?)
        /*
        $codes = ['bn', 'en', 'es', 'fa', 'fr', 'hi', 'id', 'km', 'ko', 'ms', 'my', 'ne', 'pt', 'ru', 'swh', 'te', 'th',
         'ur', 'zh'];
        $options = self::getLanguages($codes);
        asort($options);    // sort by language name
        $selectSemanticDomainLanguages = [
            'optionsOrder' => array_keys($options),
            'options' => $options
        ];
        var_dump($selectSemanticDomainLanguages);
        */

        // a stand in for the code above - all Semantic Domain languages
        // ToDo: translate 'semantic domain only' for each language below. IJH 2018-06
        $selectSemanticDomainLanguages = [
            "optionsOrder" => ["id", "km", "en", "es", "fr"],
            "options" => [
                "id" => [
                    "name" => "Bahasa Indonesia",
                    "option" => "Bahasa Indonesia - semantic domain only",
                    "hasSemanticDomain" => true,
                ],
                "km" => [
                    "name" => "Central Khmer",
                    "option" => "Central Khmer - semantic domain only",
                    "hasSemanticDomain" => true,
                ],
                "en" => ["name" => "English", "option" => "English", "hasSemanticDomain" => true],
                "es" => [
                    "name" => "español",
                    "option" => "español - semantic domain only",
                    "hasSemanticDomain" => true,
                ],
                "fr" => [
                    "name" => "français",
                    "option" => "français - semantic domain only",
                    "hasSemanticDomain" => true,
                ],
            ],
        ];
        $data["interfaceConfig"]["selectLanguages"] = $selectSemanticDomainLanguages;

        $optionlistListModel = new LexOptionListListModel($project);
        $optionlistListModel->read();
        $data["optionlists"] = $optionlistListModel->entries;

        if ($project->hasSendReceive()) {
            $data["sendReceive"] = [];
            $data["sendReceive"]["status"] = SendReceiveCommands::getProjectStatus($projectId);
        }

        return $data;
    }

    // comment out at the moment until a refactor can be done that is more efficient (language data in the database?)
    /*
    private static function getLanguages($codes)
    {
        $result = [];
        $languageData = new LanguageData();
        foreach ($codes as $code) {
            $result[$code] = $languageData[$code]->name;
        }

        return  $result;
    }
    */
}
