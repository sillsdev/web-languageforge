<?php
use models\scriptureforge\sfchecks\commands\SfchecksUploadCommands;
use models\TextModel;

require_once (dirname(__FILE__) . '/../../TestConfig.php');
require_once (SimpleTestPath . 'autorun.php');
require_once (TestPath . 'common/MongoTestEnvironment.php');

class TestSfchecksUploadCommands extends UnitTestCase
{

    function testUploadAudio_mp3File_uploadAllowed()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $text = new TextModel($project);
        $text->title = "Some Title";
        $textId = $text->write();

        // put a copy of the test file in tmp
        $tmpName = 'CopyOfTestAudio.mp3';
        $tmpFilePath = sys_get_temp_dir() . '/' . $tmpName;
        copy(TestPath . 'common/TestAudio.mp3', $tmpFilePath);

        $uploadType = 'audio';
        $file = array();
        $fileName = 'TestAudio.mp3';
        $file['name'] = $fileName;
        $file['type'] = 'audio/mp3';
        $_FILES['file'] = $file;
        $_POST['textId'] = $textId;

        $response = SfchecksUploadCommands::uploadFile($projectId, $uploadType, $tmpFilePath);

        $text->read($textId);
        $this->assertEqual(true, $response->result);
        $this->assertPattern("/$projectId/", $response->data->path);
        $this->assertEqual($fileName, $response->data->fileName);
        $this->assertEqual($fileName, $text->audioFileName);

        // cleanup test files and folders
        $path = 'assets/' . $projectId;
        $folderPath = APPPATH . $path;
        $filePath = $folderPath . '/' . $textId . '_' . $fileName;
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

    function testUploadAudio_mp3FileUpperCaseExt_uploadAllowed()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $text = new TextModel($project);
        $text->title = "Some Title";
        $textId = $text->write();

        // put a copy of the test file in tmp
        $tmpName = 'CopyOfTestAudio.mp3';
        $tmpFilePath = sys_get_temp_dir() . '/' . $tmpName;
        copy(TestPath . 'common/TestAudio.mp3', $tmpFilePath);

        $uploadType = 'audio';
        $file = array();
        $fileName = 'TestAudio.MP3';
        $file['name'] = $fileName;
        $file['type'] = 'AUDIO/MP3';
        $_FILES['file'] = $file;
        $_POST['textId'] = $textId;

        $response = SfchecksUploadCommands::uploadFile($projectId, $uploadType, $tmpFilePath);

        $this->assertEqual(true, $response->result);
        $this->assertEqual($fileName, $response->data->fileName);

        // cleanup test files and folders
        $path = 'assets/' . $projectId;
        $folderPath = APPPATH . $path;
        $filePath = $folderPath . '/' . $textId . '_' . $fileName;
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

    function testUploadAudio_mp4File_uploadDisallowed()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $text = new TextModel($project);
        $text->title = "Some Title";
        $textId = $text->write();

        // put a copy of the test file in tmp
        $tmpName = 'CopyOfTestAudio.mp3';
        $tmpFilePath = sys_get_temp_dir() . '/' . $tmpName;
        copy(TestPath . 'common/TestAudio.mp3', $tmpFilePath);

        $uploadType = 'audio';
        $file = array();
        $fileName = 'TestAudio.mp3';
        $file['name'] = $fileName;
        $file['type'] = 'video/mp4';
        $_FILES['file'] = $file;
        $_POST['textId'] = $textId;

        $response = SfchecksUploadCommands::uploadFile($projectId, $uploadType, $tmpFilePath);

        $this->assertEqual(false, $response->result);
        $this->assertEqual('UserMessage', $response->data->errorType);
        $this->assertPattern('/Ensure the file is an .mp3/', $response->data->errorMessage);

        $file['type'] = 'audio/mp3';
        $fileName = 'TestAudio.mp4';
        $file['name'] = $fileName;
        $_FILES['file'] = $file;
        copy(TestPath . 'common/TestAudio.mp3', $tmpFilePath);

        $response = SfchecksUploadCommands::uploadFile($projectId, $uploadType, $tmpFilePath);

        $this->assertEqual(false, $response->result);
        $this->assertEqual('UserMessage', $response->data->errorType);
        $this->assertPattern('/Ensure the file is an .mp3/', $response->data->errorMessage);

        // cleanup test files and folders
        $path = 'assets/' . $projectId;
        $folderPath = APPPATH . $path;
        $filePath = $folderPath . '/' . $textId . '_' . $fileName;
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
}
