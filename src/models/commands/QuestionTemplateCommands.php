<?php

namespace models\commands;

use models\ProjectModel;

use Palaso\Utilities\CodeGuard;
use models\scriptureforge\sfchecks\QuestionTemplateModel;
use models\mapper\JsonDecoder;
use models\mapper\JsonEncoder;
use models\scriptureforge\sfchecks\QuestionTemplateListModel;

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
