<?php
use Api\Model\Mapper\MongoStore;
use Api\Model\ProjectModel;
use Api\Model\TextListModel;
use Api\Model\TextModel;

require_once __DIR__ . '/../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPhpPath . 'common/MongoTestEnvironment.php';
require_once SourcePath . "Api/Model/TextModel.php";

class TestTextModel extends UnitTestCase
{

    public function testCRUD_Works()
    {
        $e = new MongoTestEnvironment();
        $e->clean();
        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        // List
        $list = new TextListModel($project);
        $list->read();
        $this->assertEqual(0, $list->count);

        // Create
        $text = new TextModel($project);
        $text->title = "Some Text";
        $usx = MongoTestEnvironment::usxSample();
        $text->content = $usx;
        $id = $text->write();
        $this->assertNotNull($id);
        $this->assertIsA($id, 'string');
        $this->assertEqual($id, $text->id->asString());

        // Read back
        $otherText = new TextModel($project, $id);
        $this->assertEqual($id, $otherText->id->asString());
        $this->assertEqual('Some Text', $otherText->title);
        $this->assertEqual($usx, $otherText->content);

        // Update
        $otherText->title = 'Other Text';
        $otherText->write();

        // Read back
        $otherText = new TextModel($project, $id);
        $this->assertEqual('Other Text', $otherText->title);

        // List
        $list->read();
        $this->assertEqual(1, $list->count);

        // Delete
        TextModel::remove($project->databaseName(), $id);

        // List
        $list->read();
        $this->assertEqual(0, $list->count);
    }

    public function testUpdateThenRemove_NewProject_CreatesThenRemovesProjectDatabase()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $databaseName = $project->databaseName();

        $project->remove();
        $this->assertEqual(MongoStore::countCollections($databaseName), 0);

        $text = new TextModel($project);
        $text->title = 'Some Title';
        $text->write();

        $this->assertTrue(MongoStore::hasDB($databaseName));
        $this->assertEqual(MongoStore::countCollections($databaseName), 1);

        $project->remove();

        $this->assertEqual(MongoStore::countCollections($databaseName), 0);
    }
}
