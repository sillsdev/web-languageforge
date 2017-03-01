<?php

namespace Api\Model\Languageforge\Translate\Command;

use Api\Model\Languageforge\Translate\TranslateDocumentSetListModel;
use Api\Model\Languageforge\Translate\TranslateDocumentSetModel;
use Api\Model\Languageforge\Translate\TranslateProjectModel;
use Api\Model\Shared\Command\ProjectCommands;
use Api\Model\Shared\Mapper\JsonEncoder;
use Palaso\Utilities\CodeGuard;

class TranslateDocumentSetCommands
{
    /**
     * Updates the given TranslateDocumentSetModel
     * @param string $projectId
     * @param array $documentSetData
     * @return bool|array<encoded TranslateDocumentSetModel>
     */
    public static function updateDocumentSet($projectId, $documentSetData)
    {
        CodeGuard::checkTypeAndThrow($documentSetData, 'array');

        $project = new TranslateProjectModel($projectId);
        ProjectCommands::checkIfArchivedAndThrow($project);
        if (array_key_exists('id', $documentSetData) && $documentSetData['id'] != '') {
            $documentSet = new TranslateDocumentSetModel($project, $documentSetData['id']);
        } else {
            $documentSet = new TranslateDocumentSetModel($project);
        }

        if (array_key_exists('name', $documentSetData)) {
            $documentSet->name = $documentSetData['name'];
        }
        $documentSet->write();

        return JsonEncoder::encode($documentSet);
    }

    /**
     * @param string $projectId
     * @return TranslateDocumentSetListModel
     */
    public static function listDocumentSets($projectId)
    {
        $project = new TranslateProjectModel($projectId);
        $documentSetList = new TranslateDocumentSetListModel($project);
        $documentSetList->readAsModels();
        return $documentSetList;
    }

    /**
     * @param string $projectId
     * @param string $documentSetId
     * @return array
     */
    public static function readDocumentSet($projectId, $documentSetId)
    {
        $project = new TranslateProjectModel($projectId);
        $documentSet = new TranslateDocumentSetModel($project, $documentSetId);
        return JsonEncoder::encode($documentSet);
    }

    /**
     * @param string $projectId
     * @param string $documentSetId
     * @return bool
     */
    public static function removeDocumentSet($projectId, $documentSetId)
    {
        $project = new TranslateProjectModel($projectId);
        $documentSet = new TranslateDocumentSetModel($project, $documentSetId);
        $documentSet->isDeleted = true;
        $documentSet->write();
        return true;
    }
}
