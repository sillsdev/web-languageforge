<?php

namespace Api\Model\Languageforge\Translate\Command;

use Api\Model\Languageforge\Translate\TranslateMetricListModel;
use Api\Model\Languageforge\Translate\TranslateMetricModel;
use Api\Model\Languageforge\Translate\TranslateProjectModel;
use Api\Model\Shared\Command\ProjectCommands;
use Api\Model\Shared\Mapper\JsonDecoder;
use Api\Model\Shared\Mapper\JsonEncoder;
use Palaso\Utilities\CodeGuard;

class TranslateMetricCommands
{
    /**
     * Updates the given TranslateMetricModel
     * @param string $projectId
     * @param string $metricId
     * @param array $metricData
     * @param string $documentSetId
     * @param string $userId
     * @return string $metricId
     */
    public static function updateMetric($projectId, $metricId, $metricData, $documentSetId = '', $userId = '')
    {
        CodeGuard::checkTypeAndThrow($metricData, 'array');

        $project = new TranslateProjectModel($projectId);
        ProjectCommands::checkIfArchivedAndThrow($project);
        if ($metricId) {
            $metric = new TranslateMetricModel($project, $metricId);
        } else {
            $metric = new TranslateMetricModel($project, $metricId, $documentSetId, $userId);
        }

        JsonDecoder::decode($metric->metrics, $metricData);

        return $metric->write();
    }

    /**
     * @param string $projectId
     * @return TranslateMetricListModel
     */
    public static function listMetrics($projectId)
    {
        $project = new TranslateProjectModel($projectId);
        $metricList = new TranslateMetricListModel($project);
        $metricList->readAsModels();
        return $metricList;
    }

    /**
     * @param string $projectId
     * @param string $metricId
     * @return array
     */
    public static function readMetric($projectId, $metricId)
    {
        $project = new TranslateProjectModel($projectId);
        $metric = new TranslateMetricModel($project, $metricId);
        return JsonEncoder::encode($metric);
    }

    /**
     * @param string $projectId
     * @param string $metricId
     * @return bool
     */
    public static function removeMetric($projectId, $metricId)
    {
        $project = new TranslateProjectModel($projectId);
        TranslateMetricModel::remove($project, $metricId);
        return true;
    }

}
