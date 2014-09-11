<?php
use models\languageforge\lexicon\commands\LexUploadCommands;
use models\mapper\Id;

require_once (dirname(__FILE__) . '/../../../TestConfig.php');
require_once (SimpleTestPath . 'autorun.php');
require_once (TestPath . 'common/MongoTestEnvironment.php');

class TestLexUploadCommands extends UnitTestCase
{

    function cleanupTestFiles($assetsFolderPath, $folderPath, $filePath, $tmpFilePath)
    {
        // cleanup test files and folders
        if (file_exists($tmpFilePath) and ! is_dir($tmpFilePath)) {
            @unlink($tmpFilePath);
        }
        if (file_exists($filePath) and ! is_dir($filePath)) {
            @unlink($filePath);
        }
        if (file_exists($folderPath) and is_dir($folderPath)) {
            @rmdir($folderPath);
        }
        if (file_exists($assetsFolderPath) and is_dir($assetsFolderPath)) {
            @rmdir($assetsFolderPath);
        }
    }

    function testUploadImageFile_JpgFile_UploadAllowed()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->appName = 'lexicon';
        $projectId = $project->write();

        // put a copy of the test file in tmp
        $tmpFilePath = sys_get_temp_dir() . '/CopyOfTestImage.jpg';
        copy(TestPath . 'common/TestImage.jpg', $tmpFilePath);

        $fileName = 'TestImage.jpg';
        $file = array();
        $file['name'] = $fileName;
        $_FILES['file'] = $file;

        $response = LexUploadCommands::uploadImageFile($projectId, 'sense-image', $tmpFilePath);

        $assetsFolderPath = $project->getAssetsFolderPath();
        $folderPath = LexUploadCommands::mediaFolderPath($assetsFolderPath);
        $filePath = $folderPath . '/' . $response->data->fileName;
        $projectSlug = $project->databaseName();

        $this->assertTrue($response->result);
        $this->assertPattern("/lexicon\/$projectSlug\/pictures/", $response->data->path);
        $this->assertPattern("/$fileName/", $response->data->fileName);
        $this->assertTrue(file_exists($filePath));

        $this->cleanupTestFiles($assetsFolderPath, $folderPath, $filePath, $tmpFilePath);
    }

    function testUploadImageFile_JpgFileUpperCaseExt_UploadAllowed()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->appName = 'lexicon';
        $projectId = $project->write();

        // put a copy of the test file in tmp
        $tmpFilePath = sys_get_temp_dir() . '/CopyOfTestImage.jpg';
        copy(TestPath . 'common/TestImage.jpg', $tmpFilePath);

        $fileName = 'TestImage.JPG';
        $file = array();
        $file['name'] = $fileName;
        $_FILES['file'] = $file;

        $response = LexUploadCommands::uploadImageFile($projectId, 'sense-image', $tmpFilePath);

        $assetsFolderPath = $project->getAssetsFolderPath();
        $folderPath = LexUploadCommands::mediaFolderPath($assetsFolderPath);
        $filePath = $folderPath . '/' . $response->data->fileName;
        $projectSlug = $project->databaseName();

        $this->assertTrue($response->result);
        $this->assertPattern("/$fileName/", $response->data->fileName);
        $this->assertPattern("/(?<!\d)\d{14}(?!\d)/", $response->data->fileName);
        $this->assertTrue(file_exists($filePath));

        $this->cleanupTestFiles($assetsFolderPath, $folderPath, $filePath, $tmpFilePath);
    }

    function testUploadImageFile_TifFile_UploadDisallowed()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->appName = 'lexicon';
        $projectId = $project->write();

        // put a copy of the test file in tmp
        $tmpFilePath = sys_get_temp_dir() . '/CopyOfTestImage.jpg';
        copy(TestPath . 'common/TestImage.tif', $tmpFilePath);

        $fileName = 'TestImage.jpg';
        $file = array();
        $file['name'] = $fileName;
        $_FILES['file'] = $file;

        $response = LexUploadCommands::uploadImageFile($projectId, 'sense-image', $tmpFilePath);

        $assetsFolderPath = $project->getAssetsFolderPath();
        $folderPath = LexUploadCommands::mediaFolderPath($assetsFolderPath);
        $projectSlug = $project->databaseName();

        $this->assertFalse($response->result);
        $this->assertEqual('UserMessage', $response->data->errorType);
        $this->assertPattern('/not an allowed image file/', $response->data->errorMessage);

        $fileName = 'TestImage.tif';
        $file['name'] = $fileName;
        $_FILES['file'] = $file;
        copy(TestPath . 'common/TestImage.jpg', $tmpFilePath);

        $response = LexUploadCommands::uploadImageFile($projectId, 'sense-image', $tmpFilePath);

        $this->assertFalse($response->result);
        $this->assertEqual('UserMessage', $response->data->errorType);
        $this->assertPattern('/not an allowed image file/', $response->data->errorMessage);

        $this->cleanupTestFiles($assetsFolderPath, $folderPath, '', $tmpFilePath);
    }

    function testUploadAudio_SpecialCharInFileName_SpecialCharReplaced()
    {
        $e = new MongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->appName = 'lexicon';
        $projectId = $project->write();

        // put a copy of the test file in tmp
        $tmpFilePath = sys_get_temp_dir() . '/CopyOfTestImage.jpg';
        copy(TestPath . 'common/TestImage.jpg', $tmpFilePath);

        $fileName = '/\\?%*:|"<>.jpg';
        $file = array();
        $file['name'] = $fileName;
        $_FILES['file'] = $file;

        $response = LexUploadCommands::uploadImageFile($projectId, 'sense-image', $tmpFilePath);

        $assetsFolderPath = $project->getAssetsFolderPath();
        $folderPath = LexUploadCommands::mediaFolderPath($assetsFolderPath);
        $filePath = $folderPath . '/' . $response->data->fileName;
        $projectSlug = $project->databaseName();
        $fileName = '__________.jpg';

        $this->assertTrue($response->result);
        $this->assertPattern("/$fileName/", $response->data->fileName);

        $this->cleanupTestFiles($assetsFolderPath, $folderPath, $filePath, $tmpFilePath);
    }
}
