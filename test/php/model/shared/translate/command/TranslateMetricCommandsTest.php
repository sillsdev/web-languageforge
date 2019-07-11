<?php

use Api\Model\Shared\Command\ProjectCommands;
use Api\Model\Shared\Mapper\JsonEncoder;
use Api\Model\Shared\Translate\Command\TranslateMetricCommands;
use Api\Model\Shared\Translate\TranslateDocumentSetModel;
use Api\Model\Shared\Translate\TranslateMetricModel;
use Elasticsearch\ClientBuilder;
use GuzzleHttp\Ring\Client\MockHandler;
use PHPUnit\Framework\TestCase;

class TranslateMetricCommandsTest extends TestCase
{
    /** @var LexiconMongoTestEnvironment Local store of mock test environment */
    private static $environ;

    public function setUp(): void
    {
        self::$environ = new MongoTestEnvironment();
        self::$environ->clean();
    }

    public static function tearDownAfterClass(): void
    {
        self::$environ->clean();
    }

    /**
     * This test is intentionally EXCLUDED from PHP unit tests.
     * It is intended to be run manually (explicitly)
     * @group explicit
     */
    public function testElasticSearchDoc_CRUD_CreateAndDeleteOk()
    {
        $valid = @fsockopen('es_401', 9200, $errno, $errstr, 30);
        if (!$valid) {
            $this->markTestSkipped('Test skipped, http://es_401:9200 not responding');
        }

        // Create
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $userId = self::$environ->createUser('User', 'Name', 'name@example.com');
        $documentSet = new TranslateDocumentSetModel($project);
        $documentSet->name = 'SomeDocument';
        $documentSetId = $documentSet->write();
        $metric = new TranslateMetricModel($project, '', $documentSetId, $userId);
        $metric->metrics->mouseClickCount = 1;
        $metric->write();
        $ipAddress = '110.77.202.231';
        $_SERVER['REMOTE_ADDR'] = $ipAddress;

        $response = TranslateMetricCommands::indexMetricDoc($project, $metric, true);

        $this->assertNotNull($response);
        $this->assertEquals(TranslateMetricCommands::ELASTIC_SEARCH_METRICS_INDEX, $response['_index']);
        $this->assertEquals(TranslateMetricCommands::getElasticSearchMetricType(), $response['_type']);
        $this->assertEquals($metric->id->asString(), $response['_id']);
        $this->assertEquals(1, $response['_version']);
        $this->assertEquals(1, $response['created']);

        // Delete
        $response2 = TranslateMetricCommands::deleteMetricDoc($metric);

        $this->assertNotNull($response2);
        $this->assertEquals(1, $response2['found']);
        $this->assertEquals(TranslateMetricCommands::ELASTIC_SEARCH_METRICS_INDEX, $response2['_index']);
        $this->assertEquals(TranslateMetricCommands::getElasticSearchMetricType(), $response2['_type']);
        $this->assertEquals($metric->id->asString(), $response2['_id']);
        $this->assertEquals(2, $response2['_version']);
    }

    const esCreatedResponse = <<<EOD
{
  "_index": "cat_metrics_2",
  "_type": "cat_metric",
  "_id": "59ce24b8a07ed541a8341195",
  "_version": 1,
  "result": "created",
  "_shards": {
    "total": 2,
    "successful": 1,
    "failed": 0
  },
  "created": true
}
EOD;

    public function testTranslateDocument_CRUD_CreateUpdateDeleteListOk()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $metric = new TranslateMetricModel($project);
        $metric->metrics->mouseClickCount = 1;

        // List
        $dto = TranslateMetricCommands::listMetrics($projectId);
        $this->assertEquals(0, $dto->count);

        // Create
        $documentSet = new TranslateDocumentSetModel($project);
        $documentSet->name = 'SomeDocument';
        $documentSetId = $documentSet->write();
        $userId = self::$environ->createUser('User', 'Name', 'name@example.com');
        $metricData = JsonEncoder::encode($metric->metrics);
        $ipAddress = '110.77.202.231';
        $_SERVER['REMOTE_ADDR'] = $ipAddress;

        $bodyFilePath = sys_get_temp_dir() . DIRECTORY_SEPARATOR .'testTranslateDocumentCRUDBody.json';
        file_put_contents($bodyFilePath, self::esCreatedResponse);
        $mockHandler = new MockHandler([
            'status' => 200,
            'transfer_stats' => [
                'total_time' => 100
            ],
            'body' => fopen($bodyFilePath, 'r')
        ]);
        $client = ClientBuilder::create()
            ->setHosts(['somehost'])
            ->setHandler($mockHandler)
            ->build();

        $metricId = TranslateMetricCommands::updateMetric($projectId, '', $metricData, $documentSetId, $userId, $client);

        $this->assertNotNull($metricId);
        $this->assertEquals(24, strlen($metricId));

        // Read
        $result1 = TranslateMetricCommands::readMetric($projectId, $metricId);
        $this->assertNotNull($result1['id']);
        $this->assertEquals($metricId, $result1['id']);
        $this->assertEquals($userId, $result1['userRef']);
        $this->assertEquals($documentSetId, $result1['documentSetIdRef']);
        $this->assertEquals(1, $result1['metrics']['mouseClickCount']);

        // Update
        $result1['metrics']['mouseClickCount'] = 2;
        $mockHandler = new MockHandler([
            'status' => 200,
            'transfer_stats' => [
                'total_time' => 100
            ],
            'body' => fopen($bodyFilePath, 'r')
        ]);
        $client = ClientBuilder::create()
            ->setHosts(['somehost'])
            ->setHandler($mockHandler)
            ->build();

        $metricId2 = TranslateMetricCommands::updateMetric($projectId, $metricId, $result1['metrics'], '', '', $client);

        $this->assertNotNull($metricId2);
        $this->assertEquals($metricId, $metricId2);

        // Read back
        $result2 = TranslateMetricCommands::readMetric($projectId, $metricId);
        $this->assertNotNull($result2['id']);
        $this->assertEquals($metricId, $result2['id']);
        $this->assertEquals($userId, $result2['userRef']);
        $this->assertEquals($documentSetId, $result2['documentSetIdRef']);
        $this->assertEquals(2, $result2['metrics']['mouseClickCount']);

        // List
        $dto = TranslateMetricCommands::listMetrics($projectId);
        $this->assertEquals(1, $dto->count);

        // Delete
        $result5 = TranslateMetricCommands::removeMetric($projectId, $metricId);
        $this->assertTrue($result5);

        // List to confirm delete
        $dto = TranslateMetricCommands::listMetrics($projectId);
        $this->assertEquals(0, $dto->count);

        // Clean up after ourselves
        ProjectCommands::deleteProjects([$projectId], $project->ownerRef->asString());
        @unlink($bodyFilePath);
    }

}
