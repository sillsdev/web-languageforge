<?php

use Api\Model\Scriptureforge\Sfchecks\Command\TextCommands;
use Api\Model\Scriptureforge\Sfchecks\TextModel;
use PHPUnit\Framework\TestCase;

class TextCommandsTest extends TestCase
{
    /** @var MongoTestEnvironment Local store of mock test environment */
    private static $environ;

    public function setUp(): void
    {
        self::$environ = new MongoTestEnvironment();
        self::$environ->clean();
    }

    public function testDeleteTexts_1Text_1Delete()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $text = new TextModel($project);
        $text->title = 'Some Title';
        $text->write();

        $count = TextCommands::deleteTexts($project->id->asString(), array($text->id->asString()));

        $this->assertEquals(1, $count);
    }

    public function testArchiveTexts_1Text_1Removed()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $text = new TextModel($project);
        $text->title = 'Some Title';
        $text->write();

        $count = TextCommands::archiveTexts($project->id->asString(), array($text->id->asString()));

        $this->assertEquals(1, $count);
    }

    public function testArchiveTexts_2Texts_1Archived()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        $text1 = new TextModel($project);
        $text1->title = 'Some Title';
        $text1->write();
        $text2 = new TextModel($project);
        $text2->title = 'Another Title';
        $text2->write();

        $this->assertNotTrue($text1->isArchived);
        $this->assertNotTrue($text2->isArchived);

        $count = TextCommands::archiveTexts($project->id->asString(), array($text1->id->asString()));

        // Refresh texts from Mongo
        $text1 = new TextModel($project, $text1->id->asString());
        $text2 = new TextModel($project, $text2->id->asString());
        $this->assertEquals(1, $count);
        $this->assertTrue($text1->isArchived);
        $this->assertNotTrue($text2->isArchived);
    }

    public function testPublishTexts_2ArchivedTexts_1Published()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        $text1 = new TextModel($project);
        $text1->title = 'Some Title';
        $text1->isArchived = true;
        $text1->write();
        $text2 = new TextModel($project);
        $text2->title = 'Another Title';
        $text2->isArchived = true;
        $text2->write();

        $this->assertTrue($text1->isArchived);
        $this->assertTrue($text2->isArchived);

        $count = TextCommands::publishTexts($project->id->asString(), array($text1->id->asString()));

        // Refresh texts from Mongo
        $text1 = new TextModel($project, $text1->id->asString());
        $text2 = new TextModel($project, $text2->id->asString());
        $this->assertEquals(1, $count);
        $this->assertNotTrue($text1->isArchived);
        $this->assertTrue($text2->isArchived);
    }

}
