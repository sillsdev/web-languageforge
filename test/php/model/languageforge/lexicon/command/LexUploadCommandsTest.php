<?php

use Api\Model\Languageforge\Lexicon\Command\LexUploadCommands;
use Api\Model\Languageforge\Lexicon\LexEntryListModel;
use Api\Model\Languageforge\Lexicon\LexRoles;
use Api\Model\Languageforge\Lexicon\LiftMergeRule;
use Api\Model\Languageforge\Lexicon\LexOptionListListModel;
//use PHPUnit\Framework\TestCase;

class LexUploadCommandsTest extends PHPUnit_Framework_TestCase
{
    /** @var LexiconMongoTestEnvironment Local store of mock test environment */
    private static $environ;

    public static function setUpBeforeClass()
    {
        self::$environ = new LexiconMongoTestEnvironment();
        self::$environ->clean();
    }

    /**
     * Cleanup test lift files
     */
    public function tearDown()
    {
        self::$environ->clean();
        self::$environ->cleanupTestFiles(self::$environ->project->getAssetsFolderPath());
    }

    public function testUploadAudioFile_Mp3File_UploadAllowed()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $fileName = 'TestAudio.mp3';
        $tmpFilePath = self::$environ->uploadFile(TestPhpPath . "common/$fileName", $fileName);

        $response = LexUploadCommands::uploadAudioFile($projectId, 'audio', $tmpFilePath);

        $folderPath = $project->getAudioFolderPath();
        $filePath = $folderPath . '/' . $response->data->fileName;
        $projectSlug = $project->databaseName();

        $this->assertTrue($response->result, 'Upload should succeed');
        $this->assertRegExp("/lexicon\/$projectSlug\/audio/", $response->data->path, 'Uploaded audio file path should be in the right location');
        $this->assertRegExp("/$fileName/", $response->data->fileName, 'Uploaded audio fileName should contain the original fileName');
        $this->assertTrue(file_exists($filePath), 'Uploaded audio file should exist');
    }

    public function testUploadAudioFile_Mp3FileUpperCaseExt_UploadAllowed()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $fileName = 'TestAudio.MP3';
        $tmpFilePath = self::$environ->uploadFile(TestPhpPath . 'common/TestAudio.mp3', $fileName);

        $response = LexUploadCommands::uploadAudioFile($projectId, 'audio', $tmpFilePath);

        $folderPath = $project->getAudioFolderPath();
        $filePath = $folderPath . '/' . $response->data->fileName;

        $this->assertTrue($response->result, 'Upload should succeed');
        $this->assertRegExp("/$fileName/", $response->data->fileName, 'Uploaded audio fileName should contain the original fileName');
        $this->assertRegExp("/(?<!\d)\d{14}(?!\d)/", $response->data->fileName, 'Uploaded audio fileName should have a timestamp fileName prefix');
        $this->assertTrue(file_exists($filePath), 'Uploaded audio file should exist');
    }

    public function testUploadAudioFile_WavFile_UploadAllowed()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $fileName = 'TestAudio.wav';
        $tmpFilePath = self::$environ->uploadFile(TestPhpPath . "common/$fileName", $fileName);

        $response = LexUploadCommands::uploadAudioFile($projectId, 'audio', $tmpFilePath);

        $folderPath = $project->getAudioFolderPath();
        $filePath = $folderPath . '/' . $response->data->fileName;
        $projectSlug = $project->databaseName();

        $this->assertTrue($response->result, 'Upload should succeed');
        $this->assertRegExp("/lexicon\/$projectSlug\/audio/", $response->data->path, 'Uploaded audio file path should be in the right location');
        $this->assertRegExp("/$fileName/", $response->data->fileName, 'Uploaded audio fileName should contain the original fileName');
        $this->assertTrue(file_exists($filePath), 'Uploaded audio file should exist');
    }

    public function testUploadAudioFile_TifFile_UploadDisallowed()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $tmpFilePath = self::$environ->uploadFile(TestPhpPath . 'common/TestImage.tif', 'TestAudio.mp3');

        $response = LexUploadCommands::uploadAudioFile($projectId, 'audio', $tmpFilePath);

        $this->assertFalse($response->result, 'Upload should fail');
        $this->assertEquals('UserMessage', $response->data->errorType, 'Error response should be a user message');
        $this->assertRegExp('/not an allowed audio file/', $response->data->errorMessage, 'Error message should match the error');

        $tmpFilePath = self::$environ->uploadFile(TestPhpPath . 'common/TestAudio.mp3', 'TestImage.tif');

        $response = LexUploadCommands::uploadAudioFile($projectId, 'audio', $tmpFilePath);

        $this->assertFalse($response->result, 'Upload should fail');
        $this->assertEquals('UserMessage', $response->data->errorType, 'Error response should be a user message');
        $this->assertRegExp('/not an allowed audio file/', $response->data->errorMessage, 'Error message should match the error');
    }

    public function testUploadAudioFile_PreviousFile_PreviousFileDeleted()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $fileName = 'TestAudio.wav';
        $tmpFilePath = self::$environ->uploadFile(TestPhpPath . "common/$fileName", $fileName);

        $response = LexUploadCommands::uploadAudioFile($projectId, 'audio', $tmpFilePath);

        $this->assertTrue($response->result, 'Upload should succeed');
        $_POST['previousFilename'] = $fileName;
        $fileName = 'TestAudio.mp3';
        $tmpFilePath = self::$environ->uploadFile(TestPhpPath . "common/$fileName", $fileName);

        $response = LexUploadCommands::uploadAudioFile($projectId, 'audio', $tmpFilePath);

        $folderPath = $project->getAudioFolderPath();
        $filePath = $folderPath . DIRECTORY_SEPARATOR . $response->data->fileName;
        $projectSlug = $project->databaseName();
        $previousFilePath = $folderPath . DIRECTORY_SEPARATOR . $_POST['previousFilename'];

        $this->assertTrue($response->result, 'Upload should succeed');
        $this->assertRegExp("/lexicon\/$projectSlug\/audio/", $response->data->path, 'Uploaded audio file path should be in the right location');
        $this->assertRegExp("/$fileName/", $response->data->fileName, 'Uploaded audio fileName should contain the original fileName');
        $this->assertTrue(file_exists($filePath), 'Uploaded audio file should exist');
        $this->assertFalse(file_exists($previousFilePath), 'Previous audio file should be deleted');
    }

    public function testUploadImageFile_JpgFile_UploadAllowed()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $fileName = 'TestImage.jpg';
        $tmpFilePath = self::$environ->uploadFile(TestPhpPath . "common/$fileName", $fileName);

        $response = LexUploadCommands::uploadImageFile($projectId, 'sense-image', $tmpFilePath);

        $folderPath = $project->getImageFolderPath();
        $filePath = $folderPath . '/' . $response->data->fileName;
        $projectSlug = $project->databaseName();

        $this->assertTrue($response->result, 'Upload should succeed');
        $this->assertRegExp("/lexicon\/$projectSlug\/pictures/", $response->data->path, 'Uploaded image file path should be in the right location');
        $this->assertRegExp("/$fileName/", $response->data->fileName, 'Uploaded image fileName should contain the original fileName');
        $this->assertTrue(file_exists($filePath), 'Uploaded image file should exist');
    }

    public function testUploadImageFile_JpgFileUpperCaseExt_UploadAllowed()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $fileName = 'TestImage.JPG';
        $tmpFilePath = self::$environ->uploadFile(TestPhpPath . "common/TestImage.jpg", $fileName);

        $response = LexUploadCommands::uploadImageFile($projectId, 'sense-image', $tmpFilePath);

        $folderPath = $project->getImageFolderPath();
        $filePath = $folderPath . '/' . $response->data->fileName;

        $this->assertTrue($response->result, 'Upload should succeed');
        $this->assertRegExp("/$fileName/", $response->data->fileName, 'Uploaded image fileName should contain the original fileName');
        $this->assertRegExp("/(?<!\d)\d{14}(?!\d)/", $response->data->fileName, 'Uploaded image fileName should have a timestamp fileName prefix');
        $this->assertTrue(file_exists($filePath), 'Uploaded image file should exist');
    }

    public function testUploadImageFile_TifFile_UploadDisallowed()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $tmpFilePath = self::$environ->uploadFile(TestPhpPath . 'common/TestImage.tif', 'TestImage.jpg');

        $response = LexUploadCommands::uploadImageFile($projectId, 'sense-image', $tmpFilePath);

        $this->assertFalse($response->result, 'Upload should fail');
        $this->assertEquals('UserMessage', $response->data->errorType, 'Error response should be a user message');
        $this->assertRegExp('/not an allowed image file/', $response->data->errorMessage, 'Error message should match the error');

        $tmpFilePath = self::$environ->uploadFile(TestPhpPath . 'common/TestImage.jpg', 'TestImage.tif');

        $response = LexUploadCommands::uploadImageFile($projectId, 'sense-image', $tmpFilePath);

        $this->assertFalse($response->result, 'Upload should fail');
        $this->assertEquals('UserMessage', $response->data->errorType, 'Error response should be a user message');
        $this->assertRegExp('/not an allowed image file/', $response->data->errorMessage, 'Error message should match the error');
    }

    public function testDeleteMediaFile_Mp3File_FileDeleted()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $fileName = 'TestAudio.mp3';
        $tmpFilePath = self::$environ->uploadFile(TestPhpPath . "common/$fileName", $fileName);

        $response = LexUploadCommands::uploadAudioFile($projectId, 'audio', $tmpFilePath);

        $this->assertTrue($response->result, 'Upload should succeed');

        $folderPath = $project->getAudioFolderPath();
        $fileName = $response->data->fileName;
        $filePath = $folderPath . '/' . $fileName;

        $this->assertTrue(file_exists($filePath), 'Uploaded audio file should exist');

        $response = LexUploadCommands::deleteMediaFile($projectId, 'audio', $fileName);

        $this->assertTrue($response->result, 'Delete should succeed');
        $this->assertFalse(file_exists($filePath), 'Audio file should be deleted');
    }

    public function testDeleteMediaFile_JpgFile_FileDeleted()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $fileName = 'TestImage.jpg';
        $tmpFilePath = self::$environ->uploadFile(TestPhpPath . "common/$fileName", $fileName);

        $response = LexUploadCommands::uploadImageFile($projectId, 'sense-image', $tmpFilePath);

        $this->assertTrue($response->result, 'Upload should succeed');

        $folderPath = $project->getImageFolderPath();
        $fileName = $response->data->fileName;
        $filePath = $folderPath . '/' . $fileName;

        $this->assertTrue(file_exists($filePath), 'Uploaded image file should exist');

        $response = LexUploadCommands::deleteMediaFile($projectId, 'sense-image', $fileName);

        $this->assertTrue($response->result, 'Delete should succeed');
        $this->assertFalse(file_exists($filePath), 'Image file should be deleted');
    }

    /**
     * @expectedException Exception
     */
    public function testDeleteMediaFile_UnsupportedMediaType_Exception()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        self::$environ->inhibitErrorDisplay();

        LexUploadCommands::deleteMediaFile($projectId, 'bogusMediaType', '');

        // nothing runs in the current test function after an exception. IJH 2014-11
    }
    /**
     * @depends testDeleteMediaFile_UnsupportedMediaType_Exception
     */
    public function testDeleteMediaFile_UnsupportedMediaType_RestoreErrorDisplay()
    {
        // restore error display after last test
        self::$environ->restoreErrorDisplay();
    }

    public function testImportProjectZip_ZipFile_StatsOkInputSystemsImported()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $fileName = 'TestLexProject.zip';
        $tmpFilePath = self::$environ->uploadFile(TestPhpPath . "common/$fileName", $fileName);

        $this->assertArrayHasKey('en', $project->inputSystems);
        $this->assertArrayHasKey('th', $project->inputSystems);
        $this->assertArrayNotHasKey('th-fonipa', $project->inputSystems);

        $response = LexUploadCommands::importProjectZip($projectId, 'import-zip', $tmpFilePath);

        $project->read($project->id->asString());
        $filePath = $project->getAssetsFolderPath() . '/' . $response->data->fileName;
        $projectSlug = $project->databaseName();

        $this->assertTrue($response->result, 'Import should succeed');
        $this->assertRegExp("/lexicon\/$projectSlug/", $response->data->path, 'Uploaded zip file path should be in the right location');
        $this->assertEquals($fileName, $response->data->fileName, 'Uploaded zip fileName should have the original fileName');
        $this->assertTrue(file_exists($filePath), 'Uploaded zip file should exist');
        $this->assertEquals(0, $response->data->stats->existingEntries);
        $this->assertEquals(2, $response->data->stats->importEntries);
        $this->assertEquals(2, $response->data->stats->newEntries);
        $this->assertEquals(0, $response->data->stats->entriesMerged);
        $this->assertEquals(0, $response->data->stats->entriesDuplicated);
        $this->assertEquals(0, $response->data->stats->entriesDeleted);
        $this->assertArrayHasKey('th-fonipa', $project->inputSystems);
    }

    public function testImportProjectZip_7zFile_StatsOkAndCustomFieldsImported()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $fileName = 'TestLangProj.7z';  // Ken Zook's test data
        $tmpFilePath = self::$environ->uploadFile(TestPhpPath . "common/$fileName", $fileName);
        $userId = self::$environ->createUser('bob', 'bob', 'bob@example.com');
        $project->addUser($userId, LexRoles::OBSERVER);
        $project->config->userViews[$userId] = clone $project->config->roleViews[LexRoles::OBSERVER];
        $project->write();

        $this->assertFalse($project->config->entry->fieldOrder->array_search('customField_entry_Cust_Single_Line_All'), "custom field entry config doesn't yet exist");
        $this->assertArrayNotHasKey('customField_entry_Cust_Single_Line_All', $project->config->entry->fields, "custom field entry config doesn't yet exist");
        $this->assertArrayNotHasKey('customField_entry_Cust_Single_Line_All', $project->config->roleViews[LexRoles::OBSERVER]->fields, "custom field roleView config doesn't yet exist");
        $this->assertArrayNotHasKey('customField_entry_Cust_Single_Line_All', $project->config->roleViews[LexRoles::MANAGER]->fields, "custom field roleView config doesn't yet exist");
        $this->assertArrayNotHasKey('customField_entry_Cust_Single_Line_All', $project->config->userViews[$userId]->fields, "custom field userView config doesn't yet exist");

        $response = LexUploadCommands::importProjectZip($projectId, 'import-zip', $tmpFilePath);

        $project->read($project->id->asString());
        $filePath = $project->getAssetsFolderPath() . '/' . $response->data->fileName;
        $projectSlug = $project->databaseName();
        $entryList = new LexEntryListModel($project);
        $entryList->read();
        $entries = $entryList->entries;
        $entriesByGuid = self::$environ->indexItemsBy($entries, 'guid');
        $entryA = $entriesByGuid['05c54cf0-4e5a-4bf2-99f8-ec787e4113ac'];
        $entryB = $entriesByGuid['1a705846-a814-4289-8594-4b874faca6cc'];
        $entryBSensesByLiftId = self::$environ->indexItemsBy($entryB['senses'], 'liftId');
        $entryBSenseA = $entryBSensesByLiftId['eea9c29f-244f-4891-81db-c8274cd61f0c'];
        $optionListList = new LexOptionListListModel($project);
        $optionListList->read();
        $optionListByCodes = self::$environ->indexItemsBy($optionListList->entries, 'code');

        // stats OK?
        $this->assertTrue($response->result, 'Import should succeed');
        $this->assertRegExp("/lexicon\/$projectSlug/", $response->data->path, 'Uploaded zip file path should be in the right location');
        $this->assertEquals($fileName, $response->data->fileName, 'Uploaded zip fileName should have the original fileName');
        $this->assertTrue(file_exists($filePath), 'Uploaded zip file should exist');
        $this->assertEquals(0, $response->data->stats->existingEntries);
        $this->assertEquals(64, $response->data->stats->importEntries);
        $this->assertEquals(64, $response->data->stats->newEntries);
        $this->assertEquals(0, $response->data->stats->entriesMerged);
        $this->assertEquals(0, $response->data->stats->entriesDuplicated);
        $this->assertEquals(0, $response->data->stats->entriesDeleted);

        // custom fields imported?
        $this->assertEquals(64, $entryList->count);
        $this->assertEquals(24, $optionListList->count);
        $this->assertArrayHasKey('grammatical-info', $optionListByCodes);
        $this->assertArrayNotHasKey('semantic-domain-ddp4', $optionListByCodes);
        $this->assertEquals('-kes', $entryA['lexeme']['qaa-fonipa-x-kal']['value']);
        $this->assertEquals('635459584141806142kes.wav', $entryA['customFields']['customField_entry_Cust_Single_Line_All']['en']['value']);
        $this->assertTrue($project->config->entry->fieldOrder->array_search('customField_entry_Cust_Single_Line_All'), 'custom field entry config exists');
        $this->assertArrayHasKey('customField_entry_Cust_Single_Line_All', $project->config->entry->fields, 'custom field entry config exists');
        $this->assertEquals('Cust Single Line All', $project->config->entry->fields['customField_entry_Cust_Single_Line_All']->label);
        $this->assertEquals('multitext', $project->config->entry->fields['customField_entry_Cust_Single_Line_All']->type);
        $this->assertTrue($project->config->entry->fields['customField_entry_Cust_Single_Line_All']->inputSystems->array_search('en'));
        $this->assertArrayHasKey('customField_entry_Cust_Single_Line_All', $project->config->roleViews[LexRoles::OBSERVER]->fields, 'custom field roleView config exists');
        $this->assertArrayHasKey('customField_entry_Cust_Single_Line_All', $project->config->roleViews[LexRoles::MANAGER]->fields, 'custom field roleView config exists');
        $this->assertTrue($project->config->roleViews[LexRoles::OBSERVER]->fields['customField_entry_Cust_Single_Line_All']->show);
        $this->assertTrue($project->config->roleViews[LexRoles::MANAGER]->fields['customField_entry_Cust_Single_Line_All']->show);
        $this->assertArrayHasKey('customField_entry_Cust_Single_Line_All', $project->config->userViews[$userId]->fields, "custom field userView config doesn't yet exist");
        $this->assertTrue($project->config->userViews[$userId]->fields['customField_entry_Cust_Single_Line_All']->show);
        $this->assertEquals('zitʰɛstmen', $entryB['lexeme']['qaa-fonipa-x-kal']['value']);
        $this->assertEquals('comparative linguistics', $entryB['customFields']['customField_entry_Cust_Single_ListRef']['value']);
        $this->assertCount(2, $entryBSenseA['customFields']['customField_senses_Cust_Multi_ListRef']['values']);
        $this->assertEquals('First Custom Item', $entryBSenseA['customFields']['customField_senses_Cust_Multi_ListRef']['values'][0]);
        $this->assertEquals('Second Custom Item', $entryBSenseA['customFields']['customField_senses_Cust_Multi_ListRef']['values'][1]);
        $this->assertEquals('Custom example', $entryBSenseA['examples'][0]['customFields']['customField_examples_Cust_Example']['qaa-x-kal']['value']);

        /*
        echo '<pre style="height:500px; overflow:auto">';
        echo $response->data->importErrors;
        echo '</pre>';
        */
    }

    public function testImportProjectZip_JpgFile_UploadDisallowed()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $tmpFilePath = self::$environ->uploadFile(TestPhpPath . 'common/TestImage.jpg', 'TestLexProject.zip');

        $response = LexUploadCommands::importProjectZip($projectId, 'import-zip', $tmpFilePath);

        $this->assertFalse($response->result, 'Import should fail');
        $this->assertEquals('UserMessage', $response->data->errorType, 'Error response should be a user message');
        $this->assertRegExp('/not an allowed compressed file/', $response->data->errorMessage, 'Error message should match the error');

        $tmpFilePath = self::$environ->uploadFile(TestPhpPath . 'common/TestLexProject.zip', 'TestImage.jpg');

        $response = LexUploadCommands::importProjectZip($projectId, 'import-zip', $tmpFilePath);

        $this->assertFalse($response->result, 'Import should fail');
        $this->assertEquals('UserMessage', $response->data->errorType, 'Error response should be a user message');
        $this->assertRegExp('/not an allowed compressed file/', $response->data->errorMessage, 'Error message should match the error');
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
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $fileName = 'OneEntryV0_13.lift';
        $tmpFilePath =  self::$environ->uploadLiftFile(self::liftOneEntryV0_13, $fileName, LiftMergeRule::IMPORT_LOSES);

        $this->assertArrayHasKey('en', $project->inputSystems);
        $this->assertArrayHasKey('th', $project->inputSystems);
        $this->assertArrayNotHasKey('th-fonipa', $project->inputSystems);

        $response = LexUploadCommands::importLiftFile($projectId, 'import-lift', $tmpFilePath);

        $project->read($project->id->asString());
        $filePath = $project->getAssetsFolderPath() . '/' . $response->data->fileName;
        $projectSlug = $project->databaseName();

        $this->assertTrue($response->result, 'Import should succeed');
        $this->assertRegExp("/lexicon\/$projectSlug/", $response->data->path, 'Uploaded zip file path should be in the right location');
        $this->assertRegExp("/$fileName/", $response->data->fileName, 'Imported LIFT fileName should contain the original fileName');
        $this->assertTrue(file_exists($filePath), 'Uploaded zip file should exist');
        $this->assertArrayHasKey('th-fonipa', $project->inputSystems);
    }

    public function testImportLift_EachDuplicateSetting_LiftFileAddedOk()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $projectSlug = $project->databaseName();
        $fileName = 'OneEntryV0_13.lift';

        // no LIFT file initially
        $filePath = $project->getAssetsFolderPath() . '/' . $fileName;
        $this->assertFalse(file_exists($filePath), 'Imported LIFT file should not exist');

        // importLoses: LIFT file added
        $tmpFilePath =  self::$environ->uploadLiftFile(self::liftOneEntryV0_13, $fileName, LiftMergeRule::IMPORT_LOSES);
        $response = LexUploadCommands::importLiftFile($projectId, 'import-lift', $tmpFilePath);
        $this->assertTrue($response->result, 'Import should succeed');
        $this->assertRegExp("/lexicon\/$projectSlug/", $response->data->path);
        $this->assertRegExp("/$fileName/", $response->data->fileName, 'Imported LIFT fileName should contain the original fileName');
        $this->assertTrue(file_exists($filePath), 'Imported LIFT file should be in expected location');
        $this->assertEquals(0, $response->data->stats->existingEntries);
        $this->assertEquals(1, $response->data->stats->importEntries);
        $this->assertEquals(1, $response->data->stats->newEntries);
        $this->assertEquals(0, $response->data->stats->entriesMerged);
        $this->assertEquals(0, $response->data->stats->entriesDuplicated);
        $this->assertEquals(0, $response->data->stats->entriesDeleted);

        // create another LIFT file
        $filePathOther = $project->getAssetsFolderPath() . '/other-' . $fileName;
        @rename($filePath, $filePathOther);
        $this->assertTrue(file_exists($filePathOther), 'Other LIFT file should exist');
        $this->assertFalse(file_exists($filePath), 'Imported LIFT file should not exist');

        // importLoses: LIFT file not added, other still exists
        $tmpFilePath =  self::$environ->uploadLiftFile(self::liftOneEntryV0_13, $fileName, LiftMergeRule::IMPORT_LOSES);
        $response = LexUploadCommands::importLiftFile($projectId, 'import-lift', $tmpFilePath);
        $this->assertTrue($response->result, 'Import should succeed');
        $this->assertTrue(file_exists($filePathOther), 'Other LIFT file should exist');
        $this->assertFalse(file_exists($filePath), 'Imported LIFT file should not exist');
        $this->assertEquals(1, $response->data->stats->existingEntries);
        $this->assertEquals(1, $response->data->stats->importEntries);
        $this->assertEquals(0, $response->data->stats->newEntries);
        $this->assertEquals(1, $response->data->stats->entriesMerged);
        $this->assertEquals(0, $response->data->stats->entriesDuplicated);
        $this->assertEquals(0, $response->data->stats->entriesDeleted);

        // importWins: LIFT file added, other removed
        $tmpFilePath =  self::$environ->uploadLiftFile(self::liftOneEntryV0_13, $fileName, LiftMergeRule::IMPORT_WINS);
        $response = LexUploadCommands::importLiftFile($projectId, 'import-lift', $tmpFilePath);
        $this->assertFalse(file_exists($filePathOther), 'Other LIFT file should not exist');
        $this->assertTrue(file_exists($filePath), 'Imported LIFT file should exist');
        $this->assertEquals(1, $response->data->stats->existingEntries);
        $this->assertEquals(1, $response->data->stats->importEntries);
        $this->assertEquals(0, $response->data->stats->newEntries);
        $this->assertEquals(1, $response->data->stats->entriesMerged);
        $this->assertEquals(0, $response->data->stats->entriesDuplicated);
        $this->assertEquals(0, $response->data->stats->entriesDeleted);

        // create another LIFT file
        $filePathOther = $project->getAssetsFolderPath() . '/other-' . $fileName;
        @rename($filePath, $filePathOther);
        $this->assertTrue(file_exists($filePathOther), 'Other LIFT file should exist');
        $this->assertFalse(file_exists($filePath), 'Imported LIFT file should not exist');

        // createDuplicates: LIFT file added, other removed
        $tmpFilePath =  self::$environ->uploadLiftFile(self::liftOneEntryV0_13, $fileName, LiftMergeRule::CREATE_DUPLICATES);
        $response = LexUploadCommands::importLiftFile($projectId, 'import-lift', $tmpFilePath);
        $this->assertFalse(file_exists($filePathOther), 'Other LIFT file should not exist');
        $this->assertTrue(file_exists($filePath), 'Imported LIFT file should exist');
        $this->assertEquals(1, $response->data->stats->existingEntries);
        $this->assertEquals(1, $response->data->stats->importEntries);
        $this->assertEquals(0, $response->data->stats->newEntries);
        $this->assertEquals(0, $response->data->stats->entriesMerged);
        $this->assertEquals(1, $response->data->stats->entriesDuplicated);
        $this->assertEquals(0, $response->data->stats->entriesDeleted);
    }

    public function testImportLift_JpgFile_UploadDisallowed()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();
        $tmpFilePath =  self::$environ->uploadLiftFile(self::liftOneEntryV0_13, 'OneEntryV0_13.jpg', LiftMergeRule::IMPORT_LOSES);

        $response = LexUploadCommands::importLiftFile($projectId, 'import-lift', $tmpFilePath);

        $this->assertFalse($response->result, 'Import should fail');
        $this->assertEquals('UserMessage', $response->data->errorType, 'Error response should be a user message');
        $this->assertRegExp('/not an allowed LIFT file/', $response->data->errorMessage, 'Error message should match the error');

        $tmpFilePath = self::$environ->uploadFile(TestPhpPath . 'common/TestImage.jpg', 'TestImage.lift');

        $response = LexUploadCommands::importLiftFile($projectId, 'import-lift', $tmpFilePath);

        $this->assertFalse($response->result, 'Import should fail');
        $this->assertEquals('UserMessage', $response->data->errorType, 'Error response should be a user message');
        $this->assertRegExp('/not an allowed LIFT file/', $response->data->errorMessage, 'Error message should match the error');
    }
}
