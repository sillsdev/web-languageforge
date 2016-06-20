<?php
use Api\Model\Scriptureforge\Sfchecks\Command\SfchecksUploadCommands;
use Api\Model\TextModel;
use Api\Model\Mapper\Id;
use Palaso\Utilities\FileUtilities;

require_once (__DIR__ . '/../../TestConfig.php');
require_once (SimpleTestPath . 'autorun.php');
require_once (TestPhpPath . 'common/MongoTestEnvironment.php');

class TestSfchecksUploadCommands extends UnitTestCase
{
    function testUploadAudio_mp3File_uploadAllowed()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $text = new TextModel($project);
        $textId = $text->write();
        $fileName = 'TestAudio.mp3';
        $tmpFilePath = $environ->uploadTextAudioFile(TestPhpPath . "common/$fileName", $fileName, $textId);

        $response = SfchecksUploadCommands::uploadFile($projectId, 'audio', $tmpFilePath);

        $text->read($textId);
        $assetsFolderPath = $project->getAssetsFolderPath();
        $filePath = SfchecksUploadCommands::mediaFilePath($assetsFolderPath, $textId, $fileName);
        $projectSlug = $project->databaseName();

        $this->assertTrue($response->result, 'Import should succeed');
        $this->assertPattern("/sfchecks\/$projectSlug/", $response->data->path, 'Imported audio file path should be in the right location');
        $this->assertEqual($fileName, $response->data->fileName, 'Imported audio fileName should have the original fileName');
        $this->assertEqual($fileName, $text->audioFileName, 'Imported audio fileName should be stored in the Text');
        $this->assertTrue(file_exists($filePath), 'Imported audio file should exist');

        $environ->cleanupTestFiles($assetsFolderPath);
    }

    function testUploadAudio_mp3FileUpperCaseExt_uploadAllowed()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->write();
        $text = new TextModel($project);
        $textId = $text->write();
        $fileName = 'TestAudio.MP3';
        $tmpFilePath = $environ->uploadTextAudioFile(TestPhpPath . 'common/TestAudio.mp3', $fileName, $textId);

        $response = SfchecksUploadCommands::uploadFile($projectId, 'audio', $tmpFilePath);

        $this->assertTrue($response->result, 'Import should succeed');
        $this->assertEqual($fileName, $response->data->fileName, 'Imported audio fileName should have the original fileName');

        $environ->cleanupTestFiles($project->getAssetsFolderPath());
    }

    function testUploadAudio_WavFile_uploadDisallowed()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->write();
        $text = new TextModel($project);
        $textId = $text->write();
        $tmpFilePath = $environ->uploadTextAudioFile(TestPhpPath . 'common/TestAudio.wav', 'TestAudio.mp3', $textId);

        $response = SfchecksUploadCommands::uploadFile($projectId, 'audio', $tmpFilePath);

        $this->assertFalse($response->result, 'Import should fail');
        $this->assertEqual('UserMessage', $response->data->errorType, 'Error response should be a user message');
        $this->assertPattern('/Ensure the file is a .mp3/', $response->data->errorMessage, 'Error message should match the error');

        $tmpFilePath = $environ->uploadTextAudioFile(TestPhpPath . 'common/TestAudio.mp3', 'TestAudio.wav', $textId);

        $response = SfchecksUploadCommands::uploadFile($projectId, 'audio', $tmpFilePath);

        $this->assertFalse($response->result, 'Import should fail');
        $this->assertEqual('UserMessage', $response->data->errorType, 'Error response should be a user message');
        $this->assertPattern('/Ensure the file is a .mp3/', $response->data->errorMessage, 'Error message should match the error');

        $environ->cleanupTestFiles($project->getAssetsFolderPath());
    }

    function testCleanupFiles_4Files2Allowed_2Removed()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->write();
        $text = new TextModel($project);
        $textId = $text->write();
        $fakeId  = new Id();
        $fakeTextId = $fakeId->asString();

        $folderPath = $project->getAssetsFolderPath();
        FileUtilities::createAllFolders($folderPath);

        $allowedExtensions = array(
            ".mp2",
            ".mp3"
        );

        // put a copy of the test files in the folderPath
        $fileName1 = 'TestAudio1.mp1';
        $filePath1 = SfchecksUploadCommands::mediaFilePath($folderPath, $textId, $fileName1);
        copy(TestPhpPath . 'common/TestAudio.mp3', $filePath1);
        $fileName2 = 'TestAudio2.mp2';
        $filePath2 = SfchecksUploadCommands::mediaFilePath($folderPath, $textId, $fileName2);
        copy(TestPhpPath . 'common/TestAudio.mp3', $filePath2);
        $fileName3 = 'TestAudio3.mp3';
        $filePath3 = SfchecksUploadCommands::mediaFilePath($folderPath, $textId, $fileName3);
        copy(TestPhpPath . 'common/TestAudio.mp3', $filePath3);
        $fileName4 = 'TestAudio4.mp3';
        $filePath4 = SfchecksUploadCommands::mediaFilePath($folderPath, $fakeTextId, $fileName4);
        copy(TestPhpPath . 'common/TestAudio.mp3', $filePath4);

        $this->assertTrue(file_exists($filePath1), 'File should exist before cleanup');
        $this->assertTrue(file_exists($filePath2), 'File should exist before cleanup');
        $this->assertTrue(file_exists($filePath3), 'File should exist before cleanup');
        $this->assertTrue(file_exists($filePath4), 'File should exist before cleanup');

        SfchecksUploadCommands::cleanupFiles($folderPath, $textId, $allowedExtensions);

        $this->assertTrue(file_exists($filePath1), 'File should exist after cleanup');
        $this->assertFalse(file_exists($filePath2), 'File should not exist after cleanup');
        $this->assertFalse(file_exists($filePath3), 'File should not exist after cleanup');
        $this->assertTrue(file_exists($filePath4), 'File should exist after cleanup');

        $environ->cleanupTestFiles($folderPath);
    }
}
