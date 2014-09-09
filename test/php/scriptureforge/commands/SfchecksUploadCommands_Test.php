<?php
use models\scriptureforge\sfchecks\commands\SfchecksUploadCommands;
use models\TextModel;
use models\mapper\Id;

require_once (dirname(__FILE__) . '/../../TestConfig.php');
require_once (SimpleTestPath . 'autorun.php');
require_once (TestPath . 'common/MongoTestEnvironment.php');

class TestSfchecksUploadCommands extends UnitTestCase
{

    function cleanupTestFiles($folderPath, $textId, $fileName, $tmpFilePath)
    {
        // cleanup test files and folders
        $filePath = SfchecksUploadCommands::mediaFilePath($folderPath, $textId, $fileName);
        if (file_exists($tmpFilePath) and ! is_dir($tmpFilePath)) {
            @unlink($tmpFilePath);
        }
        if (file_exists($filePath) and ! is_dir($filePath)) {
            @unlink($filePath);
        }
        if (file_exists($folderPath) and is_dir($folderPath)) {
            @rmdir($folderPath);
        }
    }

    function testUploadAudio_mp3File_uploadAllowed()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->appName = 'sfchecks';
        $projectId = $project->write();
        $text = new TextModel($project);
        $text->title = "Some Title";
        $textId = $text->write();

        // put a copy of the test file in tmp
        $tmpFilePath = sys_get_temp_dir() . '/CopyOfTestAudio.mp3';
        copy(TestPath . 'common/TestAudio.mp3', $tmpFilePath);

        $fileName = 'TestAudio.mp3';
        $file = array();
        $file['name'] = $fileName;
        $_FILES['file'] = $file;
        $_POST['textId'] = $textId;

        $response = SfchecksUploadCommands::uploadFile($projectId, 'audio', $tmpFilePath);

        $text->read($textId);
        $folderPath = $project->getAssetsFolderPath();
        $filePath = SfchecksUploadCommands::mediaFilePath($folderPath, $textId, $fileName);
        $projectSlug = $project->databaseName();

        $this->assertTrue($response->result);
        $this->assertPattern("/sfchecks\/$projectSlug/", $response->data->path);
        $this->assertEqual($fileName, $response->data->fileName);
        $this->assertEqual($fileName, $text->audioFileName);
        $this->assertTrue(file_exists($filePath));

        $this->cleanupTestFiles($folderPath, $textId, $fileName, $tmpFilePath);
    }

    function testUploadAudio_mp3FileUpperCaseExt_uploadAllowed()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->appName = 'sfchecks';
        $projectId = $project->write();
        $text = new TextModel($project);
        $text->title = "Some Title";
        $textId = $text->write();

        // put a copy of the test file in tmp
        $tmpFilePath = sys_get_temp_dir() . '/CopyOfTestAudio.mp3';
        copy(TestPath . 'common/TestAudio.mp3', $tmpFilePath);

        $fileName = 'TestAudio.MP3';
        $file = array();
        $file['name'] = $fileName;
        $_FILES['file'] = $file;
        $_POST['textId'] = $textId;

        $response = SfchecksUploadCommands::uploadFile($projectId, 'audio', $tmpFilePath);

        $this->assertTrue($response->result);
        $this->assertEqual($fileName, $response->data->fileName);

        $this->cleanupTestFiles($project->getAssetsFolderPath(), $textId, $fileName, $tmpFilePath);
    }

    function testUploadAudio_WavFile_uploadDisallowed()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->appName = 'sfchecks';
        $projectId = $project->write();
        $text = new TextModel($project);
        $text->title = "Some Title";
        $textId = $text->write();

        // put a copy of the test file in tmp
        $tmpFilePath = sys_get_temp_dir() . '/CopyOfTestAudio.mp3';
        copy(TestPath . 'common/TestAudio.wav', $tmpFilePath);

        $fileName = 'TestAudio.mp3';
        $file = array();
        $file['name'] = $fileName;
        $_FILES['file'] = $file;
        $_POST['textId'] = $textId;

        $response = SfchecksUploadCommands::uploadFile($projectId, 'audio', $tmpFilePath);

        $this->assertFalse($response->result);
        $this->assertEqual('UserMessage', $response->data->errorType);
        $this->assertPattern('/Ensure the file is an .mp3/', $response->data->errorMessage);

        $fileName = 'TestAudio.wav';
        $file['name'] = $fileName;
        $_FILES['file'] = $file;
        copy(TestPath . 'common/TestAudio.mp3', $tmpFilePath);

        $response = SfchecksUploadCommands::uploadFile($projectId, 'audio', $tmpFilePath);

        $this->assertFalse($response->result);
        $this->assertEqual('UserMessage', $response->data->errorType);
        $this->assertPattern('/Ensure the file is an .mp3/', $response->data->errorMessage);

        $this->cleanupTestFiles($project->getAssetsFolderPath(), $textId, $fileName, $tmpFilePath);
    }

    function testUploadAudio_SpecialCharInFileName_SpecialCharReplaced()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->appName = 'sfchecks';
        $projectId = $project->write();
        $text = new TextModel($project);
        $text->title = "Some Title";
        $textId = $text->write();

        // put a copy of the test file in tmp
        $tmpFilePath = sys_get_temp_dir() . '/CopyOfTestAudio.mp3';
        copy(TestPath . 'common/TestAudio.mp3', $tmpFilePath);

        $fileName = '/\\?%*:|"<>.mp3';
        $file = array();
        $file['name'] = $fileName;
        $_FILES['file'] = $file;
        $_POST['textId'] = $textId;

        $response = SfchecksUploadCommands::uploadFile($projectId, 'audio', $tmpFilePath);

        $text->read($textId);
        $fileName = '__________.mp3';
        $this->assertTrue($response->result);
        $this->assertEqual($fileName, $text->audioFileName);

        $this->cleanupTestFiles($project->getAssetsFolderPath(), $textId, $fileName, $tmpFilePath);
    }

    function testCleanupFiles_4Files2Allowed_2Removed()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->appName = 'sfchecks';
        $projectId = $project->write();
        $text = new TextModel($project);
        $text->title = "Some Title";
        $textId = $text->write();
        $fakeId  = new Id();
        $fakeTextId = $fakeId->asString();

        $folderPath = $project->getAssetsFolderPath();
        if (! file_exists($folderPath) and ! is_dir($folderPath)) {
            mkdir($folderPath, 0777, true);
        }
        $allowedExtensions = array(
            ".mp2",
            ".mp3"
        );

        // put a copy of the test files in the folderPath
        $fileName1 = 'TestAudio1.mp1';
        $filePath1 = SfchecksUploadCommands::mediaFilePath($folderPath, $textId, $fileName1);
        copy(TestPath . 'common/TestAudio.mp3', $filePath1);
        $fileName2 = 'TestAudio2.mp2';
        $filePath2 = SfchecksUploadCommands::mediaFilePath($folderPath, $textId, $fileName2);
        copy(TestPath . 'common/TestAudio.mp3', $filePath2);
        $fileName3 = 'TestAudio3.mp3';
        $filePath3 = SfchecksUploadCommands::mediaFilePath($folderPath, $textId, $fileName3);
        copy(TestPath . 'common/TestAudio.mp3', $filePath3);
        $fileName4 = 'TestAudio4.mp3';
        $filePath4 = SfchecksUploadCommands::mediaFilePath($folderPath, $fakeTextId, $fileName4);
        copy(TestPath . 'common/TestAudio.mp3', $filePath4);

        $this->assertTrue(file_exists($filePath1));
        $this->assertTrue(file_exists($filePath2));
        $this->assertTrue(file_exists($filePath3));
        $this->assertTrue(file_exists($filePath4));

        SfchecksUploadCommands::cleanupFiles($folderPath, $textId, $allowedExtensions);

        $this->assertTrue(file_exists($filePath1));
        $this->assertFalse(file_exists($filePath2));
        $this->assertFalse(file_exists($filePath3));
        $this->assertTrue(file_exists($filePath4));

        $this->cleanupTestFiles($folderPath, $textId, $fileName1, '');
        $this->cleanupTestFiles($folderPath, $textId, $fileName2, '');
        $this->cleanupTestFiles($folderPath, $textId, $fileName3, '');
        $this->cleanupTestFiles($folderPath, $fakeTextId, $fileName4, '');
    }
}
