<?php

use Api\Model\Shared\Command\ProjectCommands;
use Api\Model\Shared\Mapper\JsonEncoder;
use Api\Model\Shared\ProjectModel;
use Api\Model\Shared\Translate\Command\TranslateDocumentSetCommands;
use Api\Model\Shared\Translate\TranslateDocumentSetModel;
use Api\Model\Shared\Translate\TranslateProjectModel;
use PHPUnit\Framework\TestCase;

class TranslateDocumentSetCommandsTest extends TestCase
{
    /** @var LexiconMongoTestEnvironment Local store of mock test environment */
    private static $environ;

    public function setUp(): void
    {
        self::$environ = new MongoTestEnvironment();
        self::$environ->clean();
    }

    public static function tearDownAfterClass(): void {
        self::$environ->clean();
    }

    public function testTranslateDocumentSetCrud_CreateUpdateDeleteListOk()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $documentSet = new TranslateDocumentSetModel($project);
        $documentSet->name = 'SomeDocument';

        // List
        $dto = TranslateDocumentSetCommands::listDocumentSets($projectId);
        $this->assertEquals(0, $dto->count);

        // Create
        $documentSetData = JsonEncoder::encode($documentSet);
        $result1 = TranslateDocumentSetCommands::updateDocumentSet($projectId, $documentSetData);
        $documentSetId = $result1['id'];
        $this->assertNotNull($documentSetId);
        $this->assertEquals(24, strlen($documentSetId));

        // Read
        $result2 = TranslateDocumentSetCommands::readDocumentSet($projectId, $documentSetId);
        $this->assertNotNull($result2['id']);
        $this->assertEquals($documentSetId, $result2['id']);
        $this->assertEquals('SomeDocument', $result2['name']);

        // Update
        $result2['name'] = 'OtherDocument';
        $result3 = TranslateDocumentSetCommands::updateDocumentSet($projectId, $result2);
        $this->assertNotNull($result3);
        $this->assertEquals($documentSetId, $result3['id']);

        // Read back
        $result4 = TranslateDocumentSetCommands::readDocumentSet($projectId, $documentSetId);
        $this->assertNotNull($result4['id']);
        $this->assertEquals('OtherDocument', $result4['name']);

        // List
        $dto = TranslateDocumentSetCommands::listDocumentSets($projectId);
        $this->assertEquals(1, $dto->count);

        // Delete
        $result5 = TranslateDocumentSetCommands::removeDocumentSet($projectId, $documentSetId);
        $this->assertTrue($result5);

        // List to confirm delete
        $dto = TranslateDocumentSetCommands::listDocumentSets($projectId);
        $this->assertEquals(0, $dto->count);

        // Clean up after ourselves
        ProjectCommands::deleteProjects([$projectId], $project->ownerRef->asString());
    }

    public function testRemoveDocumentSet_IdInConfig_IdRemovedFromConfig()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->appName = TranslateProjectModel::TRANSLATE_APP;
        $projectId = $project->write();

        $documentSet = new TranslateDocumentSetModel($project);
        $documentSet->name = 'SomeDocument';

        // Create
        $documentSetData = JsonEncoder::encode($documentSet);
        $result1 = TranslateDocumentSetCommands::updateDocumentSet($projectId, $documentSetData);
        $documentSetId = $result1['id'];
        $this->assertNotNull($documentSetId);
        $this->assertEquals(24, strlen($documentSetId));

        // Add config
        /** @var TranslateProjectModel $project */
        $project = ProjectModel::getById($projectId);
        $project->config->documentSets->idsOrdered->append($documentSetId);
        $project->write();
        $this->assertCount(1, $project->config->documentSets->idsOrdered);
        $this->assertEquals($documentSetId, $project->config->documentSets->idsOrdered[0]);

        // Delete
        $result5 = TranslateDocumentSetCommands::removeDocumentSet($projectId, $documentSetId);
        $this->assertTrue($result5);
        $project = ProjectModel::getById($projectId);
        $this->assertCount(0, $project->config->documentSets->idsOrdered);

        // Clean up after ourselves. Remove the project from parent model so the machine engine remove is not called.
        // Important for running on the build server that doesn't have machine service running - IJH 2017/08
        $project = new ProjectModel($projectId);
        $project->remove();
    }

    public function testReadDocumentSet_ReadBackOk()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $documentSet = new TranslateDocumentSetModel($project);
        $documentSet->name = 'SomeDocument';
        $documentSetId = $documentSet->write();

        $newDocumentSetData = TranslateDocumentSetCommands::readDocumentSet($projectId, $documentSetId);

        $this->assertEquals('SomeDocument', $newDocumentSetData['name']);
    }

    public function testUpdateDocumentSet_DataPersists()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $documentSet = new TranslateDocumentSetModel($project);
        $documentSet->name = 'SomeDocument';
        $documentSetId = $documentSet->write();

        $documentSetData = json_decode(json_encode(TranslateDocumentSetCommands::readDocumentSet($projectId, $documentSetId)), true);
        $documentSetData['name'] = 'OtherDocument';

        TranslateDocumentSetCommands::updateDocumentSet($projectId, $documentSetData);

        $newDocumentSetData = TranslateDocumentSetCommands::readDocumentSet($projectId, $documentSetId);

        $this->assertEquals('OtherDocument', $newDocumentSetData['name']);
    }

    public function testUpdateDocumentSet_ClearedData_DataIsCleared()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $documentSet = new TranslateDocumentSetModel($project);
        $documentSet->name = 'SomeDocument';
        $documentSetId = $documentSet->write();

        $documentSetData = json_decode(json_encode(TranslateDocumentSetCommands::readDocumentSet($projectId, $documentSetId)), true);
        $documentSetData['name'] = '';

        TranslateDocumentSetCommands::updateDocumentSet($projectId, $documentSetData);

        $updatedDocumentSetData = TranslateDocumentSetCommands::readDocumentSet($projectId, $documentSetId);
        $this->assertEquals('', $updatedDocumentSetData['name']);
    }

    public function testListDocumentSets_allDocuments()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        for ($i = 0; $i < 10; $i++) {
            $documentSet = new TranslateDocumentSetModel($project);
            $documentSet->name = 'Document' . $i;
            $documentSet->write();
        }

        $dto = TranslateDocumentSetCommands::listDocumentSets($projectId);
        $this->assertEquals(10, $dto->count);
        $this->assertEquals('Document5', $dto->entries[5]->name);
    }
}
