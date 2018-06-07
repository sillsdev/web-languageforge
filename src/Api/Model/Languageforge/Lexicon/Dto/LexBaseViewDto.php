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
        $config['inputSystems'] = JsonEncoder::encode($project->inputSystems);
        $data['config'] = $config;

        $interfaceLanguageCode = $project->interfaceLanguageCode;
        $isUserLanguageCode = false;
        if ($user->interfaceLanguageCode) {
            $interfaceLanguageCode = $user->interfaceLanguageCode;
            $isUserLanguageCode = true;
        }

        $data['interfaceConfig'] = [
            'languageCode' => $interfaceLanguageCode,
            'isUserLanguageCode' => $isUserLanguageCode
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
        $selectSemanticDomainLanguages =  [
            'optionsOrder' => ['id', 'my', 'km', 'en', 'ko', 'ms', 'ne', 'fa', 'pt', 'ru', 'swh', 'es', 'fr', 'ur',
                'hi', 'bn', 'te', 'th', 'zh-CN'],
            'options' => [
                'id' => 'Bahasa Indonesia',
                'my' => 'Burmese',
                'km' => 'Central Khmer',
                'en' => 'English',
                'ko' => 'Korean',
                'ms' => 'Malay (macrolanguage)',
                'ne' => 'Nepali (macrolanguage)',
                'fa' => 'Persian',
                'pt' => 'Portuguese',
                'ru' => 'Russian',
                'swh' => 'Swahili',
                'es' => 'español',
                'fr' => 'français',
                'ur' => 'اُردُو',
                'hi' => 'हिन्दी',
                'bn' => 'বাংলা',
                'te' => 'తెలుగు',
                'th' => 'ภาษาไทย',
                'zh-CN' => '中文'
            ]
        ];
        $data['interfaceConfig']['selectLanguages'] = $selectSemanticDomainLanguages;
        $data['interfaceConfig']['selectSemanticDomainLanguages'] = $selectSemanticDomainLanguages;

        $optionlistListModel = new LexOptionListListModel($project);
        $optionlistListModel->read();
        $data['optionlists'] = $optionlistListModel->entries;

        if ($project->hasSendReceive()) {
            $data['sendReceive'] = [];
            $data['sendReceive']['status'] = SendReceiveCommands::getProjectStatus($projectId);
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
