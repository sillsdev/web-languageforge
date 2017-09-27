<?php

namespace Api\Model\Languageforge\Translate\Command;

use Api\Model\Languageforge\Translate\TranslateMetricListModel;
use Api\Model\Languageforge\Translate\TranslateMetricModel;
use Api\Model\Languageforge\Translate\TranslateProjectModel;
use Api\Model\Shared\Command\ProjectCommands;
use Api\Model\Shared\Mapper\JsonDecoder;
use Api\Model\Shared\Mapper\JsonEncoder;
use Api\Model\Shared\ProjectModel;
use Elasticsearch\Client;
use Elasticsearch\ClientBuilder;
use Palaso\Utilities\CodeGuard;

class TranslateMetricCommands
{
    public static function updateMetric(
        string $projectId,
        string $metricId,
        array $metricData,
        $documentSetId = '',
        $userId = '',
        Client $client = null
    ): string
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

        $id = $metric->write();
        self::indexMetricDoc($project, $metric, ENVIRONMENT !== 'production', $client);

        return $id;
    }

    public static function listMetrics(string $projectId): TranslateMetricListModel
    {
        $project = new TranslateProjectModel($projectId);
        $metricList = new TranslateMetricListModel($project);
        $metricList->readAsModels();
        return $metricList;
    }

    public static function readMetric(string $projectId, string $metricId): array
    {
        $project = new TranslateProjectModel($projectId);
        $metric = new TranslateMetricModel($project, $metricId);
        return JsonEncoder::encode($metric);
    }

    public static function removeMetric(string $projectId, string $metricId): bool
    {
        $project = new TranslateProjectModel($projectId);
        TranslateMetricModel::remove($project, $metricId);
        return true;
    }

    public static function indexMetricDoc(
        ProjectModel $project,
        TranslateMetricModel $metric,
        $isTestData = false,
        Client $client = null
    ): array
    {
        $metricData = JsonEncoder::encode($metric);
        unset($metricData['id']);
        $metricData['isTestData'] = $isTestData;

        return self::indexElasticSearchDoc('cat_metrics', $project->projectCode, $metricData,
            $metric->id->asString(), $isTestData, $client);
    }

    public static function deleteMetricDoc(ProjectModel $project, TranslateMetricModel $metric, Client $client = null): array
    {
        return self::deleteElasticSearchDoc('cat_metrics', $project->projectCode, $metric->id->asString(), $client);
    }

    private static function indexElasticSearchDoc(
        string $index,
        string $type,
        array $body,
        $id = '',
        $isTestData = false,
        Client $client = null
    ): array
    {
        $wasClientOriginallyNull = is_null($client);
        if ($wasClientOriginallyNull) {
            $client = self::createElasticSearchClient();
        }

        $params = [
            'index' => $index,
            'type' => $type,
            'body' => $body
        ];

        if ($id) {
            $params['id'] = $id;
        }

        $response = [];
        try {
            $response = $client->index($params);
        } catch (\Exception $e) {
            if ($wasClientOriginallyNull && !$isTestData) {
                throw new \Exception($e->getMessage(), $e->getCode(), $e);
            }
        }

        return $response;
    }

    private static function deleteElasticSearchDoc(string $index, string $type, string $id, Client $client = null): array
    {
        if (is_null($client)) {
            $client = self::createElasticSearchClient();
        }

        $params = [
            'index' => $index,
            'type' => $type,
            'id' => $id
        ];

        return $client->delete($params);
    }

    private static function createElasticSearchClient(): Client
    {
        $hosts = [
            [
                'host' => 'es_401',
                'port' => '9200',
                'scheme' => 'http'
            ]
        ];
        $client = ClientBuilder::create()
            ->setHosts($hosts)
            ->build();
        return $client;
    }

}
