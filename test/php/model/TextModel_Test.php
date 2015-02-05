<?php
use models\mapper\MongoStore;
use models\ProjectModel;
use models\TextListModel;
use models\TextModel;

require_once dirname(__FILE__) . '/../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPath . 'common/MongoTestEnvironment.php';
require_once SourcePath . "models/TextModel.php";

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
        $this->assertFalse(MongoStore::hasDB($databaseName));

        $text = new TextModel($project);
        $text->title = 'Some Title';
        $text->write();

        $this->assertTrue(MongoStore::hasDB($databaseName));

        $project->remove();

        $this->assertFalse(MongoStore::hasDB($databaseName));
    }
}
