<?php

use Api\Model\Languageforge\Translate\Command\TranslateMetricCommands;
use Api\Model\Languageforge\Translate\TranslateDocumentSetModel;
use Api\Model\Languageforge\Translate\TranslateMetricModel;
use Api\Model\Languageforge\Translate\TranslateMetrics;
use Api\Model\Languageforge\Translate\TranslateProjectModel;
use Api\Model\Shared\Command\ProjectCommands;
use Api\Model\Shared\Mapper\JsonEncoder;
use Api\Model\Shared\ProjectModel;
use PHPUnit\Framework\TestCase;

class TranslateMetricCommandsTest extends TestCase
{
    /** @var LexiconMongoTestEnvironment Local store of mock test environment */
    private static $environ;

    public function setUp()
    {
        self::$environ = new MongoTestEnvironment();
        self::$environ->clean();
    }

    public static function tearDownAfterClass() {
        self::$environ->clean();
    }

    public function testTranslateDocumentCrud_CreateUpdateDeleteListOk()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $metric = new TranslateMetricModel($project);
        $metric->metrics = new TranslateMetrics();
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

        $metricId = TranslateMetricCommands::updateMetric($projectId, '', $metricData, $documentSetId, $userId);

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
        $metricId2 = TranslateMetricCommands::updateMetric($projectId, $metricId, $result1['metrics']);
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
    }

}
