<?php

use Api\Model\Languageforge\Lexicon\Command\SendReceiveCommands;
use Api\Model\Languageforge\Lexicon\LexOptionListListModel;
use Api\Model\Languageforge\Lexicon\SendReceiveProjectModel;
use Api\Model\ProjectModel;
use Palaso\Utilities\FileUtilities;

require_once __DIR__ . '/../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPhpPath . 'common/MongoTestEnvironment.php';

class TestLexiconProjectModel extends UnitTestCase
{
    public function testInitializeNewProject_defaultPartOfSpeechOptionListExists()
    {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        $optionlists = new LexOptionListListModel($project);
        $optionlists->read();

        $this->assertEqual(count($optionlists->entries), 0);

        $project = ProjectModel::getById($project->id->asString());
        $project->initializeNewProject();

        $optionlists->read();

        $this->assertTrue(count($optionlists->entries) > 0);
        $this->assertEqual($optionlists->entries[0]['items'][0]['key'], 'adj');
    }

    public function testInitializeNewProject_NotSendReceiveProject_NoSymlinks()
    {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $this->assertFalse($project->hasSendReceive());

        $project->initializeNewProject();

        $assetImagePath = $project->getImageFolderPath();
        $this->assertFalse(is_link($assetImagePath));

        $assetAudioPath = $project->getAudioFolderPath();
        $this->assertFalse(is_link($assetAudioPath));
    }

    public function testInitializeNewProject_SendReceiveProject_SymlinksCreated()
    {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->sendReceiveProject = new SendReceiveProjectModel('sr_id', 'sr_name', '', 'manager');
        $project->write();
        $this->assertTrue($project->hasSendReceive());

        $project->initializeNewProject();

        $assetImagePath = $project->getImageFolderPath();
        $this->assertTrue(is_link($assetImagePath));
        @unlink($assetImagePath);

        $assetAudioPath = $project->getAudioFolderPath();
        $this->assertTrue(is_link($assetAudioPath));
        @unlink($assetAudioPath);

        $projectWorkPath = SendReceiveCommands::getLFMergePaths()->workPath . DIRECTORY_SEPARATOR . strtolower($project->projectCode);
        FileUtilities::removeFolderAndAllContents($projectWorkPath);
        FileUtilities::removeFolderAndAllContents($project->getAssetsFolderPath());
    }
}
