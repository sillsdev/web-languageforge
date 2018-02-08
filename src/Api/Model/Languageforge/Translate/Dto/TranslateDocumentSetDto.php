<?php

namespace Api\Model\Languageforge\Translate\Dto;

use Api\Model\Languageforge\Translate\Command\TranslateDocumentSetCommands;
use Api\Model\Shared\Mapper\JsonEncoder;

class TranslateDocumentSetDto
{
    /**
     * @param string $projectId
     * @param string $userId
     * @return array - the DTO array
     */
    public static function encode($projectId, $userId)
    {
        $data = TranslateProjectDto::encode($projectId, $userId);
        $documentSetList = JsonEncoder::encode(TranslateDocumentSetCommands::listDocumentSets($projectId));
        foreach ($documentSetList['entries'] as $documentSet) {
            $data['documentSetList'][$documentSet['id']] = $documentSet;
        }

        return $data;
    }
}
