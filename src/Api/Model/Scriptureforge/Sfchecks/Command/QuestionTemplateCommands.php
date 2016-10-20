<?php

namespace Api\Model\Scriptureforge\Sfchecks\Command;

use Api\Model\Shared\Command\ProjectCommands;
use Api\Model\Scriptureforge\Sfchecks\QuestionTemplateListModel;
use Api\Model\Scriptureforge\Sfchecks\QuestionTemplateModel;
use Api\Model\Shared\Mapper\JsonDecoder;
use Api\Model\Shared\Mapper\JsonEncoder;
use Api\Model\Shared\ProjectModel;
use Palaso\Utilities\CodeGuard;

class QuestionTemplateCommands
{
    /**
     * @param array $questionTemplateIds
     * @return int Total number of questionTemplate questions removed.
     */
    public static function deleteQuestionTemplates($projectId, $questionTemplateIds)
    {
        CodeGuard::checkTypeAndThrow($questionTemplateIds, 'array');
        $count = 0;
        $projectModel = new ProjectModel($projectId);
        ProjectCommands::checkIfArchivedAndThrow($projectModel);
        foreach ($questionTemplateIds as $questionTemplateId) {
            CodeGuard::checkTypeAndThrow($questionTemplateId, 'string');
            $questionTemplate = new QuestionTemplateModel($projectModel, $questionTemplateId);
            $questionTemplate->remove();
            $count++;
        }

        return $count;
    }

    public static function updateTemplate($projectId, $params)
    {
        $projectModel = new ProjectModel($projectId);
        ProjectCommands::checkIfArchivedAndThrow($projectModel);
        $questionTemplate = new QuestionTemplateModel($projectModel);
        JsonDecoder::decode($questionTemplate, $params);
        $result = $questionTemplate->write();

        return $result;
    }

    public static function readTemplate($projectId, $id)
    {
        $projectModel = new ProjectModel($projectId);
        $questionTemplate = new QuestionTemplateModel($projectModel, $id);

        return JsonEncoder::encode($questionTemplate);
    }

    public static function listTemplates($projectId)
    {
        $projectModel = new ProjectModel($projectId);
        $list = new QuestionTemplateListModel($projectModel);
        $list->read();

        return $list;
    }
}
