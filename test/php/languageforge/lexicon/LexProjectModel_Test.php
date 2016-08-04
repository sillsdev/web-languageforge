<?php

use Api\Model\Languageforge\Lexicon\LexOptionListListModel;
use Api\Model\Languageforge\Lexicon\SendReceiveProjectModel;
use Api\Model\ProjectModel;
use Api\Model\Shared\Rights\Operation;
use Api\Model\Shared\Rights\Domain;
use Api\Model\Shared\Rights\ProjectRoles;
use Palaso\Utilities\FileUtilities;

require_once __DIR__ . '/../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPhpPath . 'common/MongoTestEnvironment.php';

class TestLexProjectModel extends UnitTestCase
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

    public function testInitializeNewProject_SendReceiveProjectAndExistingTargetFile_SourceFileMovedAndSymlinksCreated()
    {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->sendReceiveProjectIdentifier = 'sr_id';
        $project->sendReceiveProject = new SendReceiveProjectModel('sr_name', '', 'manager');
        $project->write();
        $this->assertTrue($project->hasSendReceive());

        $projectWorkPath = $project->getSendReceiveWorkFolder();
        $srImagePath = $projectWorkPath . DIRECTORY_SEPARATOR . 'LinkedFiles' . DIRECTORY_SEPARATOR . 'Pictures';
        FileUtilities::createAllFolders($srImagePath);
        $srTestImageFilePath = $srImagePath . DIRECTORY_SEPARATOR . 'existingTargetImage.jpg';
        touch($srTestImageFilePath);
        $this->assertTrue(file_exists($srTestImageFilePath));

        $assetImagePath = $project->getImageFolderPath();
        $filenameToMove = 'existingSourceImage.jpg';
        $filePathToMove = $assetImagePath . DIRECTORY_SEPARATOR . $filenameToMove;
        touch($filePathToMove);
        $this->assertTrue(file_exists($filePathToMove));

        $project->initializeNewProject();

        $this->assertTrue(is_link($assetImagePath));
        $this->assertTrue(file_exists($srTestImageFilePath));
        $this->assertTrue(file_exists($filePathToMove));
        $this->assertTrue(file_exists($srImagePath . DIRECTORY_SEPARATOR . $filenameToMove));

        $assetAudioPath = $project->getAudioFolderPath();
        $this->assertTrue(is_link($assetAudioPath));

        $project->initializeNewProject();

        $this->assertTrue(is_link($assetImagePath));
        $this->assertTrue(file_exists($srTestImageFilePath));
        $this->assertTrue(file_exists($filePathToMove));
        $this->assertTrue(file_exists($srImagePath . DIRECTORY_SEPARATOR . $filenameToMove));
        $this->assertTrue(is_link($assetAudioPath));

        FileUtilities::removeFolderAndAllContents($project->getAssetsFolderPath());
        FileUtilities::removeFolderAndAllContents($projectWorkPath);
    }

}
