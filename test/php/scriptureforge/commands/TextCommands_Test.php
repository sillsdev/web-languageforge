<?php

use Api\Model\Command\TextCommands;
use Api\Model\TextModel;

require_once __DIR__ . '/../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPhpPath . 'common/MongoTestEnvironment.php';

class TestTextCommands extends UnitTestCase
{
    public function testDeleteTexts_NoThrow()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $text = new TextModel($project);
        $text->title = "Some Title";
        $text->write();

        TextCommands::deleteTexts($project->id->asString(), array($text->id->asString()));
    }

    public function testArchiveTexts_1Text_1Removed()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $text = new TextModel($project);
        $text->title = "Some Title";
        $text->write();

        $count = TextCommands::archiveTexts($project->id->asString(), array($text->id->asString()));

        $this->assertEqual($count, 1);
    }

    public function testArchiveTexts_2Texts_1Archived()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        $text1 = new TextModel($project);
        $text1->title = "Some Title";
        $text1->write();
        $text2 = new TextModel($project);
        $text2->title = "Another Title";
        $text2->write();

        $this->assertEqual($text1->isArchived, false);
        $this->assertEqual($text2->isArchived, false);

        $count = TextCommands::archiveTexts($project->id->asString(), array($text1->id->asString()));

        $text1->read($text1->id->asString());
        $text2->read($text2->id->asString());
        $this->assertEqual($count, 1);
        $this->assertEqual($text1->isArchived, true);
        $this->assertEqual($text2->isArchived, false);
    }

    public function testPublishTexts_2ArchivedTexts_1Published()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        $text1 = new TextModel($project);
        $text1->title = "Some Title";
        $text1->isArchived = true;
        $text1->write();
        $text2 = new TextModel($project);
        $text2->title = "Another Title";
        $text2->isArchived = true;
        $text2->write();

        $this->assertEqual($text1->isArchived, true);
        $this->assertEqual($text2->isArchived, true);

        $count = TextCommands::publishTexts($project->id->asString(), array($text1->id->asString()));

        $text1->read($text1->id->asString());
        $text2->read($text2->id->asString());
        $this->assertEqual($count, 1);
        $this->assertEqual($text1->isArchived, false);
        $this->assertEqual($text2->isArchived, true);
    }

}
