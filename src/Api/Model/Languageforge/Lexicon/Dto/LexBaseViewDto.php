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
        $data["interfaceConfig"]["selectLanguages"] = [
            "optionsOrder" => ["en"],
            "options" => ["en" => ["name" => "English", "option" => "English", "hasSemanticDomain" => true]],
        ];

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
