<?php

namespace Api\Model\Shared\Translate\Dto;

use Api\Model\Shared\Mapper\JsonEncoder;
use Api\Model\Shared\Translate\Command\TranslateDocumentSetCommands;

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
