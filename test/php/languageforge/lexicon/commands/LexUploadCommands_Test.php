<?php
use models\languageforge\lexicon\commands\LexUploadCommands;
use models\languageforge\lexicon\LiftMergeRule;
use models\mapper\Id;

require_once (dirname(__FILE__) . '/../../../TestConfig.php');
require_once (SimpleTestPath . 'autorun.php');
require_once (TestPath . 'common/MongoTestEnvironment.php');

class TestLexUploadCommands extends UnitTestCase
{

    public function __construct() {
        $this->environ = new LexiconMongoTestEnvironment();
        $this->environ->clean();
        parent::__construct();
    }

    /**
     * Local store of mock test environment
     *
     * @var LexiconMongoTestEnvironment
     */
    private $environ;

    /**
     * Cleanup test lift files
     */
    public function tearDown()
    {
        $this->environ->clean();
        $this->environ->cleanupTestFiles($this->environ->project->getAssetsFolderPath());
    }

    public function testUploadImageFile_JpgFile_UploadAllowed()
    {
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $fileName = 'TestImage.jpg';
        $tmpFilePath = $this->environ->uploadFile(TestPath . "common/$fileName", $fileName);

        $response = LexUploadCommands::uploadImageFile($projectId, 'sense-image', $tmpFilePath);

        $folderPath = LexUploadCommands::imageFolderPath($project->getAssetsFolderPath());
        $filePath = $folderPath . '/' . $response->data->fileName;
        $projectSlug = $project->databaseName();

        $this->assertTrue($response->result, 'Import should succeed');
        $this->assertPattern("/lexicon\/$projectSlug\/pictures/", $response->data->path, 'Imported LIFT file path should be in the right location');
        $this->assertPattern("/$fileName/", $response->data->fileName, 'Imported LIFT fileName should contain the original fileName');
        $this->assertTrue(file_exists($filePath), 'Imported LIFT file should exist');
    }

    public function testUploadImageFile_JpgFileUpperCaseExt_UploadAllowed()
    {
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $fileName = 'TestImage.JPG';
        $tmpFilePath = $this->environ->uploadFile(TestPath . "common/TestImage.jpg", $fileName);

        $response = LexUploadCommands::uploadImageFile($projectId, 'sense-image', $tmpFilePath);

        $folderPath = LexUploadCommands::imageFolderPath($project->getAssetsFolderPath());
        $filePath = $folderPath . '/' . $response->data->fileName;

        $this->assertTrue($response->result, 'Import should succeed');
        $this->assertPattern("/$fileName/", $response->data->fileName, 'Imported LIFT fileName should contain the original fileName');
        $this->assertPattern("/(?<!\d)\d{14}(?!\d)/", $response->data->fileName, 'Imported LIFT fileName should have a timestamp fileName prefix');
        $this->assertTrue(file_exists($filePath), 'Imported LIFT file should exist');
    }

    public function testUploadImageFile_TifFile_UploadDisallowed()
    {
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $tmpFilePath = $this->environ->uploadFile(TestPath . 'common/TestImage.tif', 'TestImage.jpg');

        $response = LexUploadCommands::uploadImageFile($projectId, 'sense-image', $tmpFilePath);

        $this->assertFalse($response->result, 'Import should fail');
        $this->assertEqual('UserMessage', $response->data->errorType, 'Error response should be a user message');
        $this->assertPattern('/not an allowed image file/', $response->data->errorMessage, 'Error message should match the error');

        $tmpFilePath = $this->environ->uploadFile(TestPath . 'common/TestImage.jpg', 'TestImage.tif');

        $response = LexUploadCommands::uploadImageFile($projectId, 'sense-image', $tmpFilePath);

        $this->assertFalse($response->result, 'Import should fail');
        $this->assertEqual('UserMessage', $response->data->errorType, 'Error response should be a user message');
        $this->assertPattern('/not an allowed image file/', $response->data->errorMessage, 'Error message should match the error');
    }

    public function testDeleteImageFile_JpgFile_FileDeleted()
    {
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $fileName = 'TestImage.jpg';
        $tmpFilePath = $this->environ->uploadFile(TestPath . "common/$fileName", $fileName);

        $response = LexUploadCommands::uploadImageFile($projectId, 'sense-image', $tmpFilePath);

        $this->assertTrue($response->result, 'Import should succeed');

        $folderPath = LexUploadCommands::imageFolderPath($project->getAssetsFolderPath());
        $fileName = $response->data->fileName;
        $filePath = $folderPath . '/' . $fileName;

        $this->assertTrue(file_exists($filePath), 'Imported LIFT file should exist');

        $response = LexUploadCommands::deleteMediaFile($projectId, 'sense-image', $fileName);

        $this->assertTrue($response->result, 'Import should succeed');
        $this->assertFalse(file_exists($filePath), 'Imported LIFT file should be deleted');
    }

    public function testDeleteImageFile_UnsupportedMediaType_Exception()
    {
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $this->environ->inhibitErrorDisplay();
        $this->expectException();
        LexUploadCommands::deleteMediaFile($projectId, 'bogusMediaType', '');

        // nothing runs in the current test function after an exception. IJH 2014-11
    }
    // this test is designed to finish testDeleteImageFile_UnsupportedMediaType_Exception
    public function testDeleteImageFile_UnsupportedMediaType_RestoreErrorDisplay()
    {
        // restore error display after last test
        $this->environ->restoreErrorDisplay();
    }

    public function testImportProjectZip_ZipFile_StatsOkInputSystemsImported()
    {
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $fileName = 'TestLexProject.zip';
        $tmpFilePath = $this->environ->uploadFile(TestPath . "common/$fileName", $fileName);

        $this->assertTrue(array_key_exists('en', $project->inputSystems));
        $this->assertTrue(array_key_exists('th', $project->inputSystems));
        $this->assertFalse(array_key_exists('th-fonipa', $project->inputSystems));

        $response = LexUploadCommands::importProjectZip($projectId, 'import-zip', $tmpFilePath);

        $project->read($project->id->asString());
        $filePath = $project->getAssetsFolderPath() . '/' . $response->data->fileName;
        $projectSlug = $project->databaseName();

        $this->assertTrue($response->result, 'Import should succeed');
        $this->assertPattern("/lexicon\/$projectSlug/", $response->data->path, 'Uploaded zip file path should be in the right location');
        $this->assertEqual($fileName, $response->data->fileName, 'Uploaded zip fileName should have the original fileName');
        $this->assertTrue(file_exists($filePath), 'Uploaded zip file should exist');
        $this->assertEqual($response->data->stats->existingEntries, 0);
        $this->assertEqual($response->data->stats->importEntries, 2);
        $this->assertEqual($response->data->stats->newEntries, 2);
        $this->assertEqual($response->data->stats->entriesMerged, 0);
        $this->assertEqual($response->data->stats->entriesDuplicated, 0);
        $this->assertEqual($response->data->stats->entriesDeleted, 0);
        $this->assertTrue(array_key_exists('th-fonipa', $project->inputSystems));
    }

    public function testImportProjectZip_7zFile_StatsOk()
    {
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $fileName = 'TestLangProj.7z';  // Ken Zook's test data
        $tmpFilePath = $this->environ->uploadFile(TestPath . "common/$fileName", $fileName);

        $response = LexUploadCommands::importProjectZip($projectId, 'import-zip', $tmpFilePath);

        $project->read($project->id->asString());
        $filePath = $project->getAssetsFolderPath() . '/' . $response->data->fileName;
        $projectSlug = $project->databaseName();

        $this->assertTrue($response->result, 'Import should succeed');
        $this->assertPattern("/lexicon\/$projectSlug/", $response->data->path, 'Uploaded zip file path should be in the right location');
        $this->assertEqual($fileName, $response->data->fileName, 'Uploaded zip fileName should have the original fileName');
        $this->assertTrue(file_exists($filePath), 'Uploaded zip file should exist');
        $this->assertEqual($response->data->stats->existingEntries, 0);
        $this->assertEqual($response->data->stats->importEntries, 64);
        $this->assertEqual($response->data->stats->newEntries, 64);
        $this->assertEqual($response->data->stats->entriesMerged, 0);
        $this->assertEqual($response->data->stats->entriesDuplicated, 0);
        $this->assertEqual($response->data->stats->entriesDeleted, 0);

        echo '<pre style="height:500px; overflow:auto">';
        echo $response->data->importErrors;
        echo '</pre>';
    }

    public function testImportProjectZip_JpgFile_UploadDisallowed()
    {
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $tmpFilePath = $this->environ->uploadFile(TestPath . 'common/TestImage.jpg', 'TestLexProject.zip');

        $response = LexUploadCommands::importProjectZip($projectId, 'import-zip', $tmpFilePath);

        $this->assertFalse($response->result, 'Import should fail');
        $this->assertEqual('UserMessage', $response->data->errorType, 'Error response should be a user message');
        $this->assertPattern('/not an allowed compressed file/', $response->data->errorMessage, 'Error message should match the error');

        $tmpFilePath = $this->environ->uploadFile(TestPath . 'common/TestLexProject.zip', 'TestImage.jpg');

        $response = LexUploadCommands::importProjectZip($projectId, 'import-zip', $tmpFilePath);

        $this->assertFalse($response->result, 'Import should fail');
        $this->assertEqual('UserMessage', $response->data->errorType, 'Error response should be a user message');
        $this->assertPattern('/not an allowed compressed file/', $response->data->errorMessage, 'Error message should match the error');
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

    public function testImportLift_LiftFile_InputSystemsImported()
    {
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $fileName = 'OneEntryV0_13.lift';
        $tmpFilePath =  $this->environ->uploadLiftFile(self::liftOneEntryV0_13, $fileName, LiftMergeRule::IMPORT_LOSES);

        $this->assertTrue(array_key_exists('en', $project->inputSystems));
        $this->assertTrue(array_key_exists('th', $project->inputSystems));
        $this->assertFalse(array_key_exists('th-fonipa', $project->inputSystems));

        $response = LexUploadCommands::importLiftFile($projectId, 'import-lift', $tmpFilePath);

        $project->read($project->id->asString());
        $filePath = $project->getAssetsFolderPath() . '/' . $response->data->fileName;
        $projectSlug = $project->databaseName();

        $this->assertTrue($response->result, 'Import should succeed');
        $this->assertPattern("/lexicon\/$projectSlug/", $response->data->path, 'Uploaded zip file path should be in the right location');
        $this->assertPattern("/$fileName/", $response->data->fileName, 'Imported LIFT fileName should contain the original fileName');
        $this->assertTrue(file_exists($filePath), 'Uploaded zip file should exist');
        $this->assertTrue(array_key_exists('th-fonipa', $project->inputSystems));
    }

    public function testImportLift_EachDuplicateSetting_LiftFileAddedOk()
    {
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $projectSlug = $project->databaseName();
        $fileName = 'OneEntryV0_13.lift';

        // no LIFT file initially
        $filePath = $project->getAssetsFolderPath() . '/' . $fileName;
        $this->assertFalse(file_exists($filePath), 'Imported LIFT file should not exist');

        // importLoses: LIFT file added
        $tmpFilePath =  $this->environ->uploadLiftFile(self::liftOneEntryV0_13, $fileName, LiftMergeRule::IMPORT_LOSES);
        $response = LexUploadCommands::importLiftFile($projectId, 'import-lift', $tmpFilePath);
        $this->assertTrue($response->result, 'Import should succeed');
        $this->assertPattern("/lexicon\/$projectSlug/", $response->data->path);
        $this->assertPattern("/$fileName/", $response->data->fileName, 'Imported LIFT fileName should contain the original fileName');
        $this->assertTrue(file_exists($filePath), 'Imported LIFT file should be in expected location');
        $this->assertEqual($response->data->stats->existingEntries, 0);
        $this->assertEqual($response->data->stats->importEntries, 1);
        $this->assertEqual($response->data->stats->newEntries, 1);
        $this->assertEqual($response->data->stats->entriesMerged, 0);
        $this->assertEqual($response->data->stats->entriesDuplicated, 0);
        $this->assertEqual($response->data->stats->entriesDeleted, 0);

        // create another LIFT file
        $filePathOther = $project->getAssetsFolderPath() . '/other-' . $fileName;
        @rename($filePath, $filePathOther);
        $this->assertTrue(file_exists($filePathOther), 'Other LIFT file should exist');
        $this->assertFalse(file_exists($filePath), 'Imported LIFT file should not exist');

        // importLoses: LIFT file not added, other still exists
        $tmpFilePath =  $this->environ->uploadLiftFile(self::liftOneEntryV0_13, $fileName, LiftMergeRule::IMPORT_LOSES);
        $response = LexUploadCommands::importLiftFile($projectId, 'import-lift', $tmpFilePath);
        $this->assertTrue($response->result, 'Import should succeed');
        $this->assertTrue(file_exists($filePathOther), 'Other LIFT file should exist');
        $this->assertFalse(file_exists($filePath), 'Imported LIFT file should not exist');
        $this->assertEqual($response->data->stats->existingEntries, 1);
        $this->assertEqual($response->data->stats->importEntries, 1);
        $this->assertEqual($response->data->stats->newEntries, 0);
        $this->assertEqual($response->data->stats->entriesMerged, 1);
        $this->assertEqual($response->data->stats->entriesDuplicated, 0);
        $this->assertEqual($response->data->stats->entriesDeleted, 0);

        // importWins: LIFT file added, other removed
        $tmpFilePath =  $this->environ->uploadLiftFile(self::liftOneEntryV0_13, $fileName, LiftMergeRule::IMPORT_WINS);
        $response = LexUploadCommands::importLiftFile($projectId, 'import-lift', $tmpFilePath);
        $this->assertFalse(file_exists($filePathOther), 'Other LIFT file should not exist');
        $this->assertTrue(file_exists($filePath), 'Imported LIFT file should exist');
        $this->assertEqual($response->data->stats->existingEntries, 1);
        $this->assertEqual($response->data->stats->importEntries, 1);
        $this->assertEqual($response->data->stats->newEntries, 0);
        $this->assertEqual($response->data->stats->entriesMerged, 1);
        $this->assertEqual($response->data->stats->entriesDuplicated, 0);
        $this->assertEqual($response->data->stats->entriesDeleted, 0);

        // create another LIFT file
        $filePathOther = $project->getAssetsFolderPath() . '/other-' . $fileName;
        @rename($filePath, $filePathOther);
        $this->assertTrue(file_exists($filePathOther), 'Other LIFT file should exist');
        $this->assertFalse(file_exists($filePath), 'Imported LIFT file should not exist');

        // createDuplicates: LIFT file added, other removed
        $tmpFilePath =  $this->environ->uploadLiftFile(self::liftOneEntryV0_13, $fileName, LiftMergeRule::CREATE_DUPLICATES);
        $response = LexUploadCommands::importLiftFile($projectId, 'import-lift', $tmpFilePath);
        $this->assertFalse(file_exists($filePathOther), 'Other LIFT file should not exist');
        $this->assertTrue(file_exists($filePath), 'Imported LIFT file should exist');
        $this->assertEqual($response->data->stats->existingEntries, 1);
        $this->assertEqual($response->data->stats->importEntries, 1);
        $this->assertEqual($response->data->stats->newEntries, 0);
        $this->assertEqual($response->data->stats->entriesMerged, 0);
        $this->assertEqual($response->data->stats->entriesDuplicated, 1);
        $this->assertEqual($response->data->stats->entriesDeleted, 0);
    }

    public function testImportLift_JpgFile_UploadDisallowed()
    {
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $tmpFilePath =  $this->environ->uploadLiftFile(self::liftOneEntryV0_13, 'OneEntryV0_13.jpg', LiftMergeRule::IMPORT_LOSES);

        $response = LexUploadCommands::importLiftFile($projectId, 'import-lift', $tmpFilePath);

        $this->assertFalse($response->result, 'Import should fail');
        $this->assertEqual('UserMessage', $response->data->errorType, 'Error response should be a user message');
        $this->assertPattern('/not an allowed LIFT file/', $response->data->errorMessage, 'Error message should match the error');

        $tmpFilePath = $this->environ->uploadFile(TestPath . 'common/TestImage.jpg', 'TestImage.lift');

        $response = LexUploadCommands::importLiftFile($projectId, 'import-lift', $tmpFilePath);

        $this->assertFalse($response->result, 'Import should fail');
        $this->assertEqual('UserMessage', $response->data->errorType, 'Error response should be a user message');
        $this->assertPattern('/not an allowed LIFT file/', $response->data->errorMessage, 'Error message should match the error');
    }
}
