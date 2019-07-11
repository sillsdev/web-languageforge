<?php

use Api\Model\Scriptureforge\Sfchecks\TextListModel;
use Api\Model\Scriptureforge\Sfchecks\TextModel;
use Api\Model\Shared\Mapper\MongoStore;
use PHPUnit\Framework\TestCase;

class TextModelTest extends TestCase
{
    public function testCRUD_Works()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();
        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        // List
        $list = new TextListModel($project);
        $list->read();
        $this->assertEquals(0, $list->count);

        // Create
        $text = new TextModel($project);
        $text->title = "Some Text";
        $usx = MongoTestEnvironment::usxSample();
        $text->content = $usx;
        $id = $text->write();
        $this->assertNotNull($id);
        $this->assertIsString($id);
        $this->assertEquals($text->id->asString(), $id);

        // Read back
        $otherText = new TextModel($project, $id);
        $this->assertEquals($id, $otherText->id->asString());
        $this->assertEquals('Some Text', $otherText->title);
        $this->assertEquals($usx, $otherText->content);

        // Update
        $otherText->title = 'Other Text';
        $otherText->write();

        // Read back
        $otherText = new TextModel($project, $id);
        $this->assertEquals('Other Text', $otherText->title);

        // List
        $list->read();
        $this->assertEquals(1, $list->count);

        // Delete
        TextModel::remove($project->databaseName(), $id);

        // List
        $list->read();
        $this->assertEquals(0, $list->count);
    }

    public function testUpdateThenRemove_NewProject_CreatesThenRemovesProjectDatabase()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $databaseName = $project->databaseName();

        $project->remove();
        $this->assertEquals(0, MongoStore::countCollections($databaseName));

        $text = new TextModel($project);
        $text->title = 'Some Title';
        $text->write();

        $this->assertTrue(MongoStore::hasDB($databaseName));
        $this->assertEquals(1, MongoStore::countCollections($databaseName));

        $project->remove();

        $this->assertEquals(0, MongoStore::countCollections($databaseName));
    }
}
