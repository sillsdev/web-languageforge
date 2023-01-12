<?php

use Api\Model\Languageforge\Lexicon\Import\ImportErrorReport;
use Api\Model\Languageforge\Lexicon\Import\LiftImport;
use Api\Model\Languageforge\Lexicon\Import\LiftImportNodeError;
use Api\Model\Languageforge\Lexicon\Import\LiftRangeImportNodeError;
use Api\Model\Languageforge\Lexicon\Import\ZipImportNodeError;
use Api\Model\Languageforge\Lexicon\LexEntryListModel;
use PHPUnit\Framework\TestCase;

class LiftImportZipTest extends TestCase
{
    /** @var LexiconMongoTestEnvironment Local store of mock test environment */
    private static $environ;

    public static function setUpBeforeClass(): void
    {
        self::$environ = new LexiconMongoTestEnvironment();
        self::$environ->clean();
    }

    /**
     * Cleanup test lift files
     */
    public function tearDown(): void
    {
        self::$environ->clean();
        self::$environ->cleanupTestFiles(self::$environ->project->getAssetsFolderPath());
    }

    public function testLiftImportMerge_ZipFile_CorrectValues()
    {
        $zipFilePath = self::$environ->copyTestUploadFile(TestCommonPath . "TestLexProject.zip");
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        $this->assertArrayHasKey("en", $project->inputSystems);
        $this->assertArrayHasKey("th", $project->inputSystems);
        $this->assertArrayNotHasKey("th-fonipa", $project->inputSystems);

        $importer = LiftImport::get()->importZip($zipFilePath, $project);

        $entryList = new LexEntryListModel($project);
        $entryList->read();
        $entries = $entryList->entries;
        $this->assertEquals(2, $entryList->count);
        $entriesByGuid = self::$environ->indexItemsBy($entries, "guid");
        $entry0 = $entriesByGuid["dd15cbc4-9085-4d66-af3d-8428f078a7da"];
        $entry1 = $entriesByGuid["05473cb0-4165-4923-8d81-02f8b8ed3f26"];
        $this->assertEquals("dd15cbc4-9085-4d66-af3d-8428f078a7da", $entry0["guid"]);
        $this->assertEquals("chùuchìi mǔu krɔ̂ɔp", $entry0["lexeme"]["th-fonipa"]["value"]); //NFC
        $this->assertEquals("ฉู่ฉี่หมูกรอบ", $entry0["lexeme"]["th"]["value"]);
        $this->assertCount(1, $entry0["senses"]);
        $this->assertEquals("incorrect definition", $entry0["senses"][0]["definition"]["en"]["value"]);
        $this->assertEquals("incorrect gloss", $entry0["senses"][0]["gloss"]["en"]["value"]);
        $this->assertEquals("th incorrect gloss", $entry0["senses"][0]["gloss"]["th"]["value"]);
        $this->assertEquals("Adjective", $entry0["senses"][0]["partOfSpeech"]["value"]);
        $this->assertEquals("5.2", $entry0["senses"][0]["semanticDomain"]["values"][0]);
        $this->assertEquals("1", $entry0["senses"][0]["semanticDomain"]["values"][1]);
        $this->assertEquals("sentence 1", $entry0["senses"][0]["examples"][0]["sentence"]["th-fonipa"]["value"]);
        $this->assertEquals("translation 1", $entry0["senses"][0]["examples"][0]["translation"]["en"]["value"]);
        $this->assertEquals("sentence 2", $entry0["senses"][0]["examples"][1]["sentence"]["th-fonipa"]["value"]);
        $this->assertEquals("translation 2", $entry0["senses"][0]["examples"][1]["translation"]["en"]["value"]);
        $this->assertEquals("05473cb0-4165-4923-8d81-02f8b8ed3f26", $entry1["guid"]);
        $this->assertEquals("khâaw kài thɔ̀ɔt", $entry1["lexeme"]["th-fonipa"]["value"]); // NFC
        $this->assertEquals("ข้าวไก่ทอด", $entry1["lexeme"]["th"]["value"]);
        $this->assertArrayHasKey("th-fonipa", $project->inputSystems);
        $this->assertEquals(1, $importer->getReport()->hasError());
        $this->assertMatchesRegularExpression(
            "/range file 'TestProj.lift-ranges' was not found/",
            $importer->getReport()->toFormattedString()
        );
        $this->assertEquals(0, $importer->stats->existingEntries);
        $this->assertEquals(2, $importer->stats->importEntries);
        $this->assertEquals(2, $importer->stats->newEntries);
        $this->assertEquals(0, $importer->stats->entriesMerged);
        $this->assertEquals(0, $importer->stats->entriesDuplicated);
        $this->assertEquals(0, $importer->stats->entriesDeleted);
    }

    public function testLiftImportMerge_ZipFileWrongFormat_Exception()
    {
        $this->expectException(Exception::class);
        $this->expectExceptionMessage('Sorry, the .tar.gz format isn\'t allowed');

        copy(TestCommonPath . "TestLexProject.zip", sys_get_temp_dir() . "/TestLexProject.tar.gz");
        $zipFilePath = self::$environ->copyTestUploadFile(sys_get_temp_dir() . "/TestLexProject.tar.gz");
        unlink(sys_get_temp_dir() . "/TestLexProject.tar.gz");
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        LiftImport::get()->importZip($zipFilePath, $project);

        // nothing runs in the current test function after an exception. IJH 2014-11
    }

    public function testLiftImportMerge_ZipFileWithDir_CorrectValues()
    {
        $zipFilePath = self::$environ->copyTestUploadFile(TestCommonPath . "TestLexProjectWithDir.zip");
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        $importer = LiftImport::get()->importZip($zipFilePath, $project);

        $entryList = new LexEntryListModel($project);
        $entryList->read();
        $entries = $entryList->entries;
        $this->assertEquals(2, $entryList->count);
        $entriesByGuid = self::$environ->indexItemsBy($entries, "guid");
        $entry0 = $entriesByGuid["dd15cbc4-9085-4d66-af3d-8428f078a7da"];
        $entry1 = $entriesByGuid["05473cb0-4165-4923-8d81-02f8b8ed3f26"];
        $this->assertEquals("dd15cbc4-9085-4d66-af3d-8428f078a7da", $entry0["guid"]);
        $this->assertEquals("chùuchìi mǔu krɔ̂ɔp", $entry0["lexeme"]["th-fonipa"]["value"]); // NFC
        $this->assertEquals("ฉู่ฉี่หมูกรอบ", $entry0["lexeme"]["th"]["value"]);
        $this->assertCount(1, $entry0["senses"]);
        $this->assertEquals("incorrect definition", $entry0["senses"][0]["definition"]["en"]["value"]);
        $this->assertEquals("incorrect gloss", $entry0["senses"][0]["gloss"]["en"]["value"]);
        $this->assertEquals("th incorrect gloss", $entry0["senses"][0]["gloss"]["th"]["value"]);
        $this->assertEquals("Adjective", $entry0["senses"][0]["partOfSpeech"]["value"]);
        $this->assertEquals("5.2", $entry0["senses"][0]["semanticDomain"]["values"][0]);
        $this->assertEquals("1", $entry0["senses"][0]["semanticDomain"]["values"][1]);
        $this->assertEquals("sentence 1", $entry0["senses"][0]["examples"][0]["sentence"]["th-fonipa"]["value"]);
        $this->assertEquals("translation 1", $entry0["senses"][0]["examples"][0]["translation"]["en"]["value"]);
        $this->assertEquals("sentence 2", $entry0["senses"][0]["examples"][1]["sentence"]["th-fonipa"]["value"]);
        $this->assertEquals("translation 2", $entry0["senses"][0]["examples"][1]["translation"]["en"]["value"]);
        $this->assertEquals("05473cb0-4165-4923-8d81-02f8b8ed3f26", $entry1["guid"]);
        $this->assertEquals("khâaw kài thɔ̀ɔt", $entry1["lexeme"]["th-fonipa"]["value"]); // NFC
        $this->assertEquals("ข้าวไก่ทอด", $entry1["lexeme"]["th"]["value"]);
        $this->assertEquals(false, $importer->getReport()->hasError());
    }

    public function testLiftImportMerge_ZipFileNoLift_Exception()
    {
        $this->expectException(Exception::class);
        $this->expectExceptionMessage("Uploaded file does not contain any LIFT data");

        $zipFilePath = self::$environ->copyTestUploadFile(TestCommonPath . "TestLexNoProject.zip");
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        LiftImport::get()->importZip($zipFilePath, $project);

        // nothing runs in the current test function after an exception. IJH 2014-11
    }

    public function testLiftImportMerge_ZipFile2LiftAndOddFolder_Error()
    {
        $zipFilePath = self::$environ->copyTestUploadFile(TestCommonPath . "TestLex2ProjectsOddFolder.zip");
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        $importer = LiftImport::get()->importZip($zipFilePath, $project);

        $report = $importer->getReport();
        $reportStr = $report->toString();

        $this->assertEquals(true, $report->hasError(), "should have NodeError");
        $this->assertMatchesRegularExpression("/unhandled LIFT file/", $reportStr);
        $this->assertMatchesRegularExpression("/unhandled subfolder 'OddFolder'/", $reportStr);
    }

    // the following EOD must retain the embedded tabs. IJH 2015-02
    const zipImportReport = <<<EOD
While processing file 'Test.zip'
	processing file 'Test.lift'
		processing file 'Test.lift-ranges'
			the lift range 'rangeId_01' was not found in the current file
			the lift range 'rangeId_02' was not found in the current file
		processing entry '00000-00001'
			unhandled note 'noteType01'
			unhandled trait 'traitName01'
			processing sense '00001-00001'
				unhandled field 'typeName01'
				unhandled media 'url01' in context01
				processing example ''
					unhandled element 'elementName01'
EOD;

    public function testZipImport_ImportReport_FormatOk()
    {
        $rangeImportNodeError = new LiftRangeImportNodeError(LiftRangeImportNodeError::FILE, "Test.lift-ranges");
        $rangeImportNodeError->addRangeNotFound("rangeId_01");
        $rangeImportNodeError->addRangeNotFound("rangeId_02");

        $exampleImportNodeError = new LiftImportNodeError(LiftImportNodeError::EXAMPLE, "");
        $exampleImportNodeError->addUnhandledElement("elementName01");

        $senseImportNodeError = new LiftImportNodeError(LiftImportNodeError::SENSE, "00001-00001");
        $senseImportNodeError->addUnhandledField("typeName01");
        $senseImportNodeError->addUnhandledMedia("url01", "context01");
        $senseImportNodeError->addSubnodeError($exampleImportNodeError);

        $entryImportNodeError = new LiftImportNodeError(LiftImportNodeError::ENTRY, "00000-00001");
        $entryImportNodeError->addUnhandledNote("noteType01");
        $entryImportNodeError->addUnhandledTrait("traitName01");
        $entryImportNodeError->addSubnodeError($senseImportNodeError);

        $liftImportNodeError = new LiftImportNodeError(LiftImportNodeError::FILE, "Test.lift");
        $liftImportNodeError->addSubnodeError($rangeImportNodeError);
        $liftImportNodeError->addSubnodeError($entryImportNodeError);

        $zipNodeError = new ZipImportNodeError(ZipImportNodeError::FILE, "Test.zip");
        $zipNodeError->addSubnodeError($liftImportNodeError);
        $report = new ImportErrorReport();
        $report->nodeErrors[] = $zipNodeError;

        //         echo "<pre>";
        //         echo $report->toFormattedString();
        //         echo "</pre>";

        $this->assertMatchesRegularExpression("/" . self::zipImportReport . "/", $report->toFormattedString());
    }
}
