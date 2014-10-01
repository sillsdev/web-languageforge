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
        $this->liftFilePaths = array();
        parent::__construct();
    }

    /**
     * Local store of created lift filepaths
     *
     * @var array
     */
    private $liftFilePaths;

    /**
     * Put a copy of the test lift file in system tmp folder
     *
     * @param string $liftXml
     * @param string $fileName
     * @return string $liftFilePath
     */
    private function createTestLiftFile($liftXml, $fileName)
    {
        $liftFilePath = sys_get_temp_dir() . '/' . $fileName;
        file_put_contents($liftFilePath, $liftXml);
        if (! array_key_exists($liftFilePath, $this->liftFilePaths)) {
            $this->liftFilePaths[] = $liftFilePath;
        }

        return $liftFilePath;
    }

    /**
     * Cleanup test lift files
     */
    private function cleanupTestLiftFiles()
    {
        foreach ($this->liftFilePaths as $liftFilePath) {
            if (file_exists($liftFilePath) and ! is_dir($liftFilePath)) {
                @unlink($liftFilePath);
            }
        }
        $this->liftFilePaths = array();
    }

    private function cleanupTestFiles($assetsFolderPath, $folderPath, $filePath, $tmpFilePath)
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

    public function testUploadImageFile_JpgFile_UploadAllowed()
    {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        // put a copy of the test file in tmp
        $tmpFilePath = sys_get_temp_dir() . '/CopyOfTestImage.jpg';
        copy(TestPath . 'common/TestImage.jpg', $tmpFilePath);

        $fileName = 'TestImage.jpg';
        $file = array();
        $file['name'] = $fileName;
        $_FILES['file'] = $file;

        $response = LexUploadCommands::uploadImageFile($projectId, 'sense-image', $tmpFilePath);

        $assetsFolderPath = $project->getAssetsFolderPath();
        $folderPath = LexUploadCommands::imageFolderPath($assetsFolderPath);
        $filePath = $folderPath . '/' . $response->data->fileName;
        $projectSlug = $project->databaseName();

        $this->assertTrue($response->result);
        $this->assertPattern("/lexicon\/$projectSlug\/pictures/", $response->data->path);
        $this->assertPattern("/$fileName/", $response->data->fileName);
        $this->assertTrue(file_exists($filePath));

        $this->cleanupTestFiles($assetsFolderPath, $folderPath, $filePath, $tmpFilePath);
    }

    public function testUploadImageFile_JpgFileUpperCaseExt_UploadAllowed()
    {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        // put a copy of the test file in tmp
        $tmpFilePath = sys_get_temp_dir() . '/CopyOfTestImage.jpg';
        copy(TestPath . 'common/TestImage.jpg', $tmpFilePath);

        $fileName = 'TestImage.JPG';
        $file = array();
        $file['name'] = $fileName;
        $_FILES['file'] = $file;

        $response = LexUploadCommands::uploadImageFile($projectId, 'sense-image', $tmpFilePath);

        $assetsFolderPath = $project->getAssetsFolderPath();
        $folderPath = LexUploadCommands::imageFolderPath($assetsFolderPath);
        $filePath = $folderPath . '/' . $response->data->fileName;
        $projectSlug = $project->databaseName();

        $this->assertTrue($response->result);
        $this->assertPattern("/$fileName/", $response->data->fileName);
        $this->assertPattern("/(?<!\d)\d{14}(?!\d)/", $response->data->fileName);
        $this->assertTrue(file_exists($filePath));

        $this->cleanupTestFiles($assetsFolderPath, $folderPath, $filePath, $tmpFilePath);
    }

    public function testUploadImageFile_TifFile_UploadDisallowed()
    {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        // put a copy of the test file in tmp
        $tmpFilePath = sys_get_temp_dir() . '/CopyOfTestImage.jpg';
        copy(TestPath . 'common/TestImage.tif', $tmpFilePath);

        $fileName = 'TestImage.jpg';
        $file = array();
        $file['name'] = $fileName;
        $_FILES['file'] = $file;

        $response = LexUploadCommands::uploadImageFile($projectId, 'sense-image', $tmpFilePath);

        $assetsFolderPath = $project->getAssetsFolderPath();
        $folderPath = LexUploadCommands::imageFolderPath($assetsFolderPath);
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

    public function testUploadAudio_SpecialCharInFileName_SpecialCharReplaced()
    {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        // put a copy of the test file in tmp
        $tmpFilePath = sys_get_temp_dir() . '/CopyOfTestImage.jpg';
        copy(TestPath . 'common/TestImage.jpg', $tmpFilePath);

        $fileName = '/\\?%*:|"<>.jpg';
        $file = array();
        $file['name'] = $fileName;
        $_FILES['file'] = $file;

        $response = LexUploadCommands::uploadImageFile($projectId, 'sense-image', $tmpFilePath);

        $assetsFolderPath = $project->getAssetsFolderPath();
        $folderPath = LexUploadCommands::imageFolderPath($assetsFolderPath);
        $filePath = $folderPath . '/' . $response->data->fileName;
        $projectSlug = $project->databaseName();
        $fileName = '__________.jpg';

        $this->assertTrue($response->result);
        $this->assertPattern("/$fileName/", $response->data->fileName);

        $this->cleanupTestFiles($assetsFolderPath, $folderPath, $filePath, $tmpFilePath);
    }

    public function testDeleteImageFile_JpgFile_FileDeleted()
    {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        // make the folders if they don't exist
        $assetsFolderPath = $project->getAssetsFolderPath();
        $folderPath = LexUploadCommands::imageFolderPath($assetsFolderPath);
        if (! file_exists($folderPath) and ! is_dir($folderPath)) {
            mkdir($folderPath, 0777, true);
        }

        // put a copy of the test file in picture folder
        $fileName = 'TestImage.jpg';
        $filePath = $folderPath . '/' . $fileName;
        copy(TestPath . 'common/TestImage.jpg', $filePath);

        $this->assertTrue(file_exists($filePath));

        $response = LexUploadCommands::deleteMediaFile($projectId, 'sense-image', $fileName);

        $this->assertTrue($response->result);
        $this->assertFalse(file_exists($filePath));

        $this->cleanupTestFiles($assetsFolderPath, $folderPath, $filePath, '');
    }

    public function testDeleteImageFile_UnsupportedMediaType_Throw()
    {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $e->inhibitErrorDisplay();
        $this->expectException();
        $response = LexUploadCommands::deleteMediaFile($projectId, 'bogusMediaType', '');
        $e->restoreErrorDisplay();
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
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $projectSlug = $project->databaseName();

        $fileName = 'OneEntryV0_12.lift';
        $tmpFilePath =  $this->createTestLiftFile(self::liftOneEntryV0_13, $fileName);

        $_FILES['file'] = array();
        $_FILES['file']['name'] = $fileName;
        $_FILES['data'] = array();
        $_FILES['data']['settings'] = array();
        $_FILES['data']['settings']['mergeRule'] = LiftMergeRule::IMPORT_LOSES;
        $_FILES['data']['settings']['skipSameModTime'] = false;
        $_FILES['data']['settings']['deleteMatchingEntry'] = false;

        // no LIFT file initially
        $filePath = $project->getAssetsFolderPath() . '/' . $fileName;
        $this->assertFalse(file_exists($filePath), 'Imported LIFT file should not exist');

        // importLoses: LIFT file added
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
        $tmpFilePath =  $this->createTestLiftFile(self::liftOneEntryV0_13, $fileName);
        $response = LexUploadCommands::importLiftFile($projectId, 'import-lift', $tmpFilePath);
        $this->assertTrue($response->result, 'Import should succeed');
        $this->assertTrue(file_exists($filePathOther), 'Other LIFT file should exist');
        $this->assertFalse(file_exists($filePath), 'Imported LIFT file should not exist');

        // importWins: LIFT file added, other removed
        $_FILES['data']['settings']['mergeRule'] = LiftMergeRule::IMPORT_WINS;
        $tmpFilePath =  $this->createTestLiftFile(self::liftOneEntryV0_13, $fileName);
        $response = LexUploadCommands::importLiftFile($projectId, 'import-lift', $tmpFilePath);
        $this->assertFalse(file_exists($filePathOther), 'Other LIFT file should not exist');
        $this->assertTrue(file_exists($filePath), 'Imported LIFT file should exist');

        // create another LIFT file
        $filePathOther = $project->getAssetsFolderPath() . '/other-' . $fileName;
        @rename($filePath, $filePathOther);
        $this->assertTrue(file_exists($filePathOther), 'Other LIFT file should exist');
        $this->assertFalse(file_exists($filePath), 'Imported LIFT file should not exist');

        // createDuplicates: LIFT file added, other removed
        $_FILES['data']['settings']['mergeRule'] = LiftMergeRule::CREATE_DUPLICATES;
        $tmpFilePath =  $this->createTestLiftFile(self::liftOneEntryV0_13, $fileName);
        $response = LexUploadCommands::importLiftFile($projectId, 'import-lift', $tmpFilePath);
        $this->assertFalse(file_exists($filePathOther), 'Other LIFT file should not exist');
        $this->assertTrue(file_exists($filePath), 'Imported LIFT file should exist');

        $this->cleanupTestLiftFiles();
    }
}
