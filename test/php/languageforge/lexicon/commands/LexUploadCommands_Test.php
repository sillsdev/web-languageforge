<?php
use models\languageforge\lexicon\commands\LexUploadCommands;
use models\languageforge\lexicon\LiftMergeRule;
use models\mapper\Id;

require_once (dirname(__FILE__) . '/../../../TestConfig.php');
require_once (SimpleTestPath . 'autorun.php');
require_once (TestPath . 'common/MongoTestEnvironment.php');

class TestLexUploadCommands extends UnitTestCase
{
    public function testUploadImageFile_JpgFile_UploadAllowed()
    {
        $environ = new LexiconMongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $fileName = 'TestImage.jpg';
        $tmpFilePath = $environ->uploadFile(TestPath . "common/$fileName", $fileName);

        $response = LexUploadCommands::uploadImageFile($projectId, 'sense-image', $tmpFilePath);

        $assetsFolderPath = $project->getAssetsFolderPath();
        $folderPath = LexUploadCommands::imageFolderPath($assetsFolderPath);
        $filePath = $folderPath . '/' . $response->data->fileName;
        $projectSlug = $project->databaseName();

        $this->assertTrue($response->result, 'Import should succeed');
        $this->assertPattern("/lexicon\/$projectSlug\/pictures/", $response->data->path, 'Imported LIFT file path should be in the right location');
        $this->assertPattern("/$fileName/", $response->data->fileName, 'Imported LIFT fileName should contain the original fileName');
        $this->assertTrue(file_exists($filePath), 'Imported LIFT file should exist');

        $environ->cleanupTestFiles($assetsFolderPath);
    }

    public function testUploadImageFile_JpgFileUpperCaseExt_UploadAllowed()
    {
        $environ = new LexiconMongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $fileName = 'TestImage.JPG';
        $tmpFilePath = $environ->uploadFile(TestPath . "common/TestImage.jpg", $fileName);

        $response = LexUploadCommands::uploadImageFile($projectId, 'sense-image', $tmpFilePath);

        $assetsFolderPath = $project->getAssetsFolderPath();
        $folderPath = LexUploadCommands::imageFolderPath($assetsFolderPath);
        $filePath = $folderPath . '/' . $response->data->fileName;

        $this->assertTrue($response->result, 'Import should succeed');
        $this->assertPattern("/$fileName/", $response->data->fileName, 'Imported LIFT fileName should contain the original fileName');
        $this->assertPattern("/(?<!\d)\d{14}(?!\d)/", $response->data->fileName, 'Imported LIFT fileName should have a timestamp fileName prefix');
        $this->assertTrue(file_exists($filePath), 'Imported LIFT file should exist');

        $environ->cleanupTestFiles($assetsFolderPath);
    }

    public function testUploadImageFile_TifFile_UploadDisallowed()
    {
        $environ = new LexiconMongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $tmpFilePath = $environ->uploadFile(TestPath . 'common/TestImage.tif', 'TestImage.jpg');

        $response = LexUploadCommands::uploadImageFile($projectId, 'sense-image', $tmpFilePath);

        $this->assertFalse($response->result, 'Import should fail');
        $this->assertEqual('UserMessage', $response->data->errorType, 'Error response should be a user message');
        $this->assertPattern('/not an allowed image file/', $response->data->errorMessage, 'Error message should match the error');

        $tmpFilePath = $environ->uploadFile(TestPath . 'common/TestImage.jpg', 'TestImage.tif');

        $response = LexUploadCommands::uploadImageFile($projectId, 'sense-image', $tmpFilePath);

        $this->assertFalse($response->result, 'Import should fail');
        $this->assertEqual('UserMessage', $response->data->errorType, 'Error response should be a user message');
        $this->assertPattern('/not an allowed image file/', $response->data->errorMessage, 'Error message should match the error');

        $environ->cleanupTestFiles($project->getAssetsFolderPath());
    }

    public function testDeleteImageFile_JpgFile_FileDeleted()
    {
        $environ = new LexiconMongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $fileName = 'TestImage.jpg';
        $tmpFilePath = $environ->uploadFile(TestPath . "common/$fileName", $fileName);

        $response = LexUploadCommands::uploadImageFile($projectId, 'sense-image', $tmpFilePath);

        $this->assertTrue($response->result, 'Import should succeed');

        $assetsFolderPath = $project->getAssetsFolderPath();
        $folderPath = LexUploadCommands::imageFolderPath($assetsFolderPath);
        $fileName = $response->data->fileName;
        $filePath = $folderPath . '/' . $fileName;

        $this->assertTrue(file_exists($filePath), 'Imported LIFT file should exist');

        $response = LexUploadCommands::deleteMediaFile($projectId, 'sense-image', $fileName);

        $this->assertTrue($response->result, 'Import should succeed');
        $this->assertFalse(file_exists($filePath), 'Imported LIFT file should be deleted');

        $environ->cleanupTestFiles($assetsFolderPath);
    }

    public function testDeleteImageFile_UnsupportedMediaType_Throw()
    {
        $environ = new LexiconMongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $environ->inhibitErrorDisplay();
        $this->expectException();
        $response = LexUploadCommands::deleteMediaFile($projectId, 'bogusMediaType', '');
        $environ->restoreErrorDisplay();
    }

    public function testUploadProjectZip_ZipFile_UploadAllowed()
    {
        $environ = new LexiconMongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $fileName = 'TestLexProject.zip';
        $tmpFilePath = $environ->uploadFile(TestPath . "common/$fileName", $fileName);

        $response = LexUploadCommands::uploadProjectZip($projectId, 'lex-project', $tmpFilePath);

        $assetsFolderPath = $project->getAssetsFolderPath();
        $filePath = $assetsFolderPath . '/' . $response->data->fileName;
        $projectSlug = $project->databaseName();

        $this->assertTrue($response->result, 'Import should succeed');
        $this->assertPattern("/lexicon\/$projectSlug/", $response->data->path, 'Uploaded zip file path should be in the right location');
        $this->assertEqual($fileName, $response->data->fileName, 'Uploaded zip fileName should have the original fileName');
        $this->assertTrue(file_exists($filePath), 'Uploaded zip file should exist');

        $environ->cleanupTestFiles($assetsFolderPath);
    }

    public function testUploadProjectZip_JpgFile_UploadDisallowed()
    {
        $environ = new LexiconMongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $tmpFilePath = $environ->uploadFile(TestPath . 'common/TestImage.jpg', 'TestLexProject.zip');

        $response = LexUploadCommands::uploadProjectZip($projectId, 'lex-project', $tmpFilePath);

        $this->assertFalse($response->result, 'Import should fail');
        $this->assertEqual('UserMessage', $response->data->errorType, 'Error response should be a user message');
        $this->assertPattern('/not an allowed compressed file/', $response->data->errorMessage, 'Error message should match the error');

        $tmpFilePath = $environ->uploadFile(TestPath . 'common/TestLexProject.zip', 'TestImage.jpg');

        $response = LexUploadCommands::uploadProjectZip($projectId, 'lex-project', $tmpFilePath);

        $this->assertFalse($response->result, 'Import should fail');
        $this->assertEqual('UserMessage', $response->data->errorType, 'Error response should be a user message');
        $this->assertPattern('/not an allowed compressed file/', $response->data->errorMessage, 'Error message should match the error');

        $environ->cleanupTestFiles($project->getAssetsFolderPath());
    }

    const liftOneEntryV0_13 = <<<EOD
<?xml version="1.0" encoding="utf-8"?>
<lift
	version="0.13"
	producer="WeSay 1.0.0.0">
	<entry
		id="chùuchìi mǔu rɔ̂ɔp_dd15cbc4-9085-4d66-af3d-8428f078a7da"
		dateCreated="2008-11-03T06:17:24Z"
		dateModified="2011-10-26T01:41:19Z"
		guid="dd15cbc4-9085-4d66-af3d-8428f078a7da">
		<lexical-unit>
			<form
				lang="th-fonipa">
				<text>chùuchìi mǔu krɔ̂ɔp</text>
			</form>
		</lexical-unit>
	</entry>
</lift>
EOD;

    public function testImportLift_EachDuplicateSetting_LiftFileAddedOk()
    {
        $environ = new LexiconMongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $projectSlug = $project->databaseName();

        $fileName = 'OneEntryV0_13.lift';

        // no LIFT file initially
        $filePath = $project->getAssetsFolderPath() . '/' . $fileName;
        $this->assertFalse(file_exists($filePath), 'Imported LIFT file should not exist');

        // importLoses: LIFT file added
        $tmpFilePath =  $environ->uploadLiftFile(self::liftOneEntryV0_13, $fileName, LiftMergeRule::IMPORT_LOSES);
        $response = LexUploadCommands::importLiftFile($projectId, 'import-lift', $tmpFilePath);
        $this->assertTrue($response->result, 'Import should succeed');
        $this->assertPattern("/lexicon\/$projectSlug/", $response->data->path);
        $this->assertPattern("/$fileName/", $response->data->fileName);
        $this->assertTrue(file_exists($filePath), 'Imported LIFT file should be in expected location');

        // create another LIFT file
        $filePathOther = $project->getAssetsFolderPath() . '/other-' . $fileName;
        @rename($filePath, $filePathOther);
        $this->assertTrue(file_exists($filePathOther), 'Other LIFT file should exist');
        $this->assertFalse(file_exists($filePath), 'Imported LIFT file should not exist');

        // importLoses: LIFT file not added, other still exists
        $tmpFilePath =  $environ->uploadLiftFile(self::liftOneEntryV0_13, $fileName, LiftMergeRule::IMPORT_LOSES);
        $response = LexUploadCommands::importLiftFile($projectId, 'import-lift', $tmpFilePath);
        $this->assertTrue($response->result, 'Import should succeed');
        $this->assertTrue(file_exists($filePathOther), 'Other LIFT file should exist');
        $this->assertFalse(file_exists($filePath), 'Imported LIFT file should not exist');

        // importWins: LIFT file added, other removed
        $tmpFilePath =  $environ->uploadLiftFile(self::liftOneEntryV0_13, $fileName, LiftMergeRule::IMPORT_WINS);
        $response = LexUploadCommands::importLiftFile($projectId, 'import-lift', $tmpFilePath);
        $this->assertFalse(file_exists($filePathOther), 'Other LIFT file should not exist');
        $this->assertTrue(file_exists($filePath), 'Imported LIFT file should exist');

        // create another LIFT file
        $filePathOther = $project->getAssetsFolderPath() . '/other-' . $fileName;
        @rename($filePath, $filePathOther);
        $this->assertTrue(file_exists($filePathOther), 'Other LIFT file should exist');
        $this->assertFalse(file_exists($filePath), 'Imported LIFT file should not exist');

        // createDuplicates: LIFT file added, other removed
        $tmpFilePath =  $environ->uploadLiftFile(self::liftOneEntryV0_13, $fileName, LiftMergeRule::CREATE_DUPLICATES);
        $response = LexUploadCommands::importLiftFile($projectId, 'import-lift', $tmpFilePath);
        $this->assertFalse(file_exists($filePathOther), 'Other LIFT file should not exist');
        $this->assertTrue(file_exists($filePath), 'Imported LIFT file should exist');

        $environ->cleanupTestUploadFiles();
    }

    public function testImportLift_JpgFile_UploadDisallowed()
    {
        $environ = new LexiconMongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $tmpFilePath =  $environ->uploadLiftFile(self::liftOneEntryV0_13, 'OneEntryV0_13.jpg', LiftMergeRule::IMPORT_LOSES);

        $response = LexUploadCommands::importLiftFile($projectId, 'import-lift', $tmpFilePath);

        $this->assertFalse($response->result, 'Import should fail');
        $this->assertEqual('UserMessage', $response->data->errorType, 'Error response should be a user message');
        $this->assertPattern('/not an allowed LIFT file/', $response->data->errorMessage, 'Error message should match the error');

        $tmpFilePath = $environ->uploadFile(TestPath . 'common/TestImage.jpg', 'TestImage.lift');

        $response = LexUploadCommands::importLiftFile($projectId, 'import-lift', $tmpFilePath);

        $this->assertFalse($response->result, 'Import should fail');
        $this->assertEqual('UserMessage', $response->data->errorType, 'Error response should be a user message');
        $this->assertPattern('/not an allowed LIFT file/', $response->data->errorMessage, 'Error message should match the error');

        $environ->cleanupTestFiles($project->getAssetsFolderPath());
    }
}
