<?php

use Api\Model\Languageforge\Lexicon\Command\SendReceiveCommands;
use Api\Model\Languageforge\Lexicon\LexOptionListListModel;
use Api\Model\Languageforge\Lexicon\SendReceiveProjectModel;
use Api\Model\Shared\ProjectModel;
use Palaso\Utilities\FileUtilities;
use PHPUnit\Framework\TestCase;

class LexProjectModelTest extends TestCase
{
    /** @var LexiconMongoTestEnvironment Local store of mock test environment */
    private static $environ;

    public function setUp(): void
    {
        self::$environ = new LexiconMongoTestEnvironment();
        self::$environ->clean();
    }

    public function testInitializeNewProject_defaultPartOfSpeechOptionListExists()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        $optionLists = new LexOptionListListModel($project);
        $optionLists->read();

        $this->assertCount(0, $optionLists->entries);

        $project = ProjectModel::getById($project->id->asString());
        $project->initializeNewProject();

        $optionLists->read();

        $this->assertTrue(count($optionLists->entries) > 0);
        $this->assertEquals('adj', $optionLists->entries[0]['items'][0]['key']);
    }

    public function testInitializeNewProject_NotSendReceiveProject_NoSymlinks()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $this->assertFalse($project->hasSendReceive());

        $project->initializeNewProject();

        $assetImagePath = $project->getImageFolderPath();
        $this->assertFalse(is_link($assetImagePath));

        $assetAudioPath = $project->getAudioFolderPath();
        $this->assertFalse(is_link($assetAudioPath));
    }

    public function testInitializeNewProject_SendReceiveProjectAndExistingTargetFile_SourceFileMovedAndSymlinksCreated()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
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

    private function assertNoException()
    {
        $this->assertTrue(true); // verify that we didn't get an exception
    }

    public function testCleanup_NonExistentState_ReturnsTrue()
    {
        // Setup
        $baseDirForSendReceive = self::$environ->setupSendReceiveEnvironment();
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->sendReceiveProjectIdentifier = 'sr_id';
        $project->sendReceiveProject = new SendReceiveProjectModel('sr_name', '', 'manager');

        // Execute
        $project->callCleanup();

        // Verify
        $this->assertNoException();
        FileUtilities::removeFolderAndAllContents($baseDirForSendReceive);
    }

    public function testCleanup_Existent_DeletesStateAndDir()
    {
        // Setup
        $baseDirForSendReceive = self::$environ->setupSendReceiveEnvironment();
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->sendReceiveProjectIdentifier = 'sr_id';
        $project->sendReceiveProject = new SendReceiveProjectModel('sr_name', '', 'manager');

        $projectStatePath = SendReceiveCommands::getLFMergePaths()->statePath . DIRECTORY_SEPARATOR . $project->projectCode . '.state';
        $projectWorkPath = SendReceiveCommands::getLFMergePaths()->workPath . DIRECTORY_SEPARATOR . $project->projectCode;
        mkdir($projectWorkPath);
        file_put_contents($projectStatePath, '{ SRState: IDLE }');
        file_put_contents($projectWorkPath . DIRECTORY_SEPARATOR . 'dummy-file', 'Just a dummy file');

        // Execute
        $project->callCleanup();

        // Verify
        $this->assertNoException();
        $this->assertFileNotExists($projectStatePath);
        $this->assertDirectoryNotExists($projectWorkPath);
        FileUtilities::removeFolderAndAllContents($baseDirForSendReceive);
    }

    public function testCleanup_FileInsteadOfDir_DeletesStateAndFile()
    {
        // Setup
        $baseDirForSendReceive = self::$environ->setupSendReceiveEnvironment();
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->sendReceiveProjectIdentifier = 'sr_id';
        $project->sendReceiveProject = new SendReceiveProjectModel('sr_name', '', 'manager');

        $projectStatePath = SendReceiveCommands::getLFMergePaths()->statePath . DIRECTORY_SEPARATOR . $project->projectCode . '.state';
        $projectWorkPath = SendReceiveCommands::getLFMergePaths()->workPath . DIRECTORY_SEPARATOR . $project->projectCode;
        file_put_contents($projectStatePath, '{ SRState: IDLE }');
        file_put_contents($projectWorkPath, 'Just a dummy file');

        // Execute
        $project->callCleanup();

        // Verify
        $this->assertNoException();
        $this->assertFileNotExists($projectStatePath);
        $this->assertDirectoryNotExists($projectWorkPath);
        $this->assertFileNotExists($projectWorkPath);
        FileUtilities::removeFolderAndAllContents($baseDirForSendReceive);
    }
}
