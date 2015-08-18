<?php

use Api\Model\Languageforge\Lexicon\LiftImport;
use Api\Model\Languageforge\Lexicon\LiftMergeRule;
use Api\Model\Languageforge\Lexicon\LexEntryListModel;
use Api\Model\Languageforge\Lexicon\ImportErrorReport;
use Api\Model\Languageforge\Lexicon\ZipImportNodeError;
use Api\Model\Languageforge\Lexicon\LiftRangeImportNodeError;
use Api\Model\Languageforge\Lexicon\LiftImportNodeError;

require_once __DIR__ . '/../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPath . 'common/MongoTestEnvironment.php';

class TestLiftImportZip extends UnitTestCase
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

    public function testLiftImportMerge_ZipFile_CorrectValues()
    {
        $zipFilePath = $this->environ->copyTestUploadFile(TestPath . 'common/TestLexProject.zip');
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        $this->assertTrue(array_key_exists('en', $project->inputSystems));
        $this->assertTrue(array_key_exists('th', $project->inputSystems));
        $this->assertFalse(array_key_exists('th-fonipa', $project->inputSystems));

        $importer = LiftImport::get()->importZip($zipFilePath, $project);

        $entryList = new LexEntryListModel($project);
        $entryList->read();
        $entries = $entryList->entries;
        $this->assertEqual($entryList->count, 2);
        $entriesByGuid = $this->environ->indexItemsBy($entries, 'guid');
        $entry0 = $entriesByGuid['dd15cbc4-9085-4d66-af3d-8428f078a7da'];
        $entry1 = $entriesByGuid['05473cb0-4165-4923-8d81-02f8b8ed3f26'];
        $this->assertEqual($entry0['guid'], "dd15cbc4-9085-4d66-af3d-8428f078a7da");
        $this->assertEqual($entry0['lexeme']['th-fonipa']['value'], "chùuchìi mǔu krɔ̂ɔp");
        $this->assertEqual($entry0['lexeme']['th']['value'], "ฉู่ฉี่หมูกรอบ");
        $this->assertEqual(count($entry0['senses']), 1);
        $this->assertEqual($entry0['senses'][0]['definition']['en']['value'], "incorrect definition");
        $this->assertEqual($entry0['senses'][0]['gloss']['en']['value'], "incorrect gloss");
        $this->assertEqual($entry0['senses'][0]['gloss']['th']['value'], "th incorrect gloss");
        $this->assertEqual($entry0['senses'][0]['partOfSpeech']['value'], "Adjective");
        $this->assertEqual($entry0['senses'][0]['semanticDomain']['values'][0], "5.2 Food");
        $this->assertEqual($entry0['senses'][0]['semanticDomain']['values'][1], "1 Universe, creation");
        $this->assertEqual($entry0['senses'][0]['examples'][0]['sentence']['th-fonipa']['value'], "sentence 1");
        $this->assertEqual($entry0['senses'][0]['examples'][0]['translation']['en']['value'], "translation 1");
        $this->assertEqual($entry0['senses'][0]['examples'][1]['sentence']['th-fonipa']['value'], "sentence 2");
        $this->assertEqual($entry0['senses'][0]['examples'][1]['translation']['en']['value'], "translation 2");
        $this->assertEqual($entry1['guid'], "05473cb0-4165-4923-8d81-02f8b8ed3f26");
        $this->assertEqual($entry1['lexeme']['th-fonipa']['value'], "khâaw kài thɔ̀ɔt");
        $this->assertEqual($entry1['lexeme']['th']['value'], "ข้าวไก่ทอด");
        $this->assertTrue(array_key_exists('th-fonipa', $project->inputSystems));
        $this->assertEqual($importer->getReport()->hasError(), 1);
        $this->assertPattern("/range file 'TestProj.lift-ranges' was not found/", $importer->getReport()->toFormattedString());
        $this->assertEqual($importer->stats->existingEntries, 0);
        $this->assertEqual($importer->stats->importEntries, 2);
        $this->assertEqual($importer->stats->newEntries, 2);
        $this->assertEqual($importer->stats->entriesMerged, 0);
        $this->assertEqual($importer->stats->entriesDuplicated, 0);
        $this->assertEqual($importer->stats->entriesDeleted, 0);
    }

    public function testLiftImportMerge_ZipFileWrongFormat_Exception()
    {
        copy(TestPath . 'common/TestLexProject.zip', TestPath . 'common/TestLexProject.tar.gz');
        $zipFilePath = $this->environ->copyTestUploadFile(TestPath . 'common/TestLexProject.tar.gz');
        unlink(TestPath . 'common/TestLexProject.tar.gz');
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        $this->expectException(new \Exception("Sorry, the .tar.gz format isn't allowed"));
        $this->environ->inhibitErrorDisplay();
        $importer = LiftImport::get()->importZip($zipFilePath, $project);

        // nothing runs in the current test function after an exception. IJH 2014-11
    }

    public function testLiftImportMerge_ZipFileWrongFormat_RestoreErrorDisplay()
    {
        // restore error display after last test
        $this->environ->restoreErrorDisplay();
    }

    public function testLiftImportMerge_ZipFileWithDir_CorrectValues()
    {
        $zipFilePath = $this->environ->copyTestUploadFile(TestPath . 'common/TestLexProjectWithDir.zip');
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        $importer = LiftImport::get()->importZip($zipFilePath, $project);

        $entryList = new LexEntryListModel($project);
        $entryList->read();
        $entries = $entryList->entries;
        $this->assertEqual($entryList->count, 2);
        $entriesByGuid = $this->environ->indexItemsBy($entries, 'guid');
        $entry0 = $entriesByGuid['dd15cbc4-9085-4d66-af3d-8428f078a7da'];
        $entry1 = $entriesByGuid['05473cb0-4165-4923-8d81-02f8b8ed3f26'];
        $this->assertEqual($entry0['guid'], "dd15cbc4-9085-4d66-af3d-8428f078a7da");
        $this->assertEqual($entry0['lexeme']['th-fonipa']['value'], "chùuchìi mǔu krɔ̂ɔp");
        $this->assertEqual($entry0['lexeme']['th']['value'], "ฉู่ฉี่หมูกรอบ");
        $this->assertEqual(count($entry0['senses']), 1);
        $this->assertEqual($entry0['senses'][0]['definition']['en']['value'], "incorrect definition");
        $this->assertEqual($entry0['senses'][0]['gloss']['en']['value'], "incorrect gloss");
        $this->assertEqual($entry0['senses'][0]['gloss']['th']['value'], "th incorrect gloss");
        $this->assertEqual($entry0['senses'][0]['partOfSpeech']['value'], "Adjective");
        $this->assertEqual($entry0['senses'][0]['semanticDomain']['values'][0], "5.2 Food");
        $this->assertEqual($entry0['senses'][0]['semanticDomain']['values'][1], "1 Universe, creation");
        $this->assertEqual($entry0['senses'][0]['examples'][0]['sentence']['th-fonipa']['value'], "sentence 1");
        $this->assertEqual($entry0['senses'][0]['examples'][0]['translation']['en']['value'], "translation 1");
        $this->assertEqual($entry0['senses'][0]['examples'][1]['sentence']['th-fonipa']['value'], "sentence 2");
        $this->assertEqual($entry0['senses'][0]['examples'][1]['translation']['en']['value'], "translation 2");
        $this->assertEqual($entry1['guid'], "05473cb0-4165-4923-8d81-02f8b8ed3f26");
        $this->assertEqual($entry1['lexeme']['th-fonipa']['value'], "khâaw kài thɔ̀ɔt");
        $this->assertEqual($entry1['lexeme']['th']['value'], "ข้าวไก่ทอด");
        $this->assertFalse($importer->getReport()->hasError());
    }

    public function testLiftImportMerge_ZipFileNoLift_Exception()
    {
        $zipFilePath = $this->environ->copyTestUploadFile(TestPath . 'common/TestLexNoProject.zip');
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        $this->environ->inhibitErrorDisplay();
        $this->expectException(new \Exception("Uploaded file does not contain any LIFT data"));
        $importer = LiftImport::get()->importZip($zipFilePath, $project);

        // nothing runs in the current test function after an exception. IJH 2014-11
    }

    public function testLiftImportMerge_ZipFileNoLift_RestoreErrorDisplay()
    {
        // restore error display after last test
        $this->environ->restoreErrorDisplay();
    }

    public function testLiftImportMerge_ZipFile2LiftAndOddFolder_Error()
    {
        $zipFilePath = $this->environ->copyTestUploadFile(TestPath . 'common/TestLex2ProjectsOddFolder.zip');
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        $importer = LiftImport::get()->importZip($zipFilePath, $project);

        $report = $importer->getReport();
        $reportStr = $report->toString();

        $this->assertTrue($report->hasError(), 'should have NodeError');
        $this->assertPattern("/unhandled LIFT file/", $reportStr);
        $this->assertPattern("/unhandled subfolder 'OddFolder'/", $reportStr);
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

    public function testZipImport_ImportReport_FormatOk() {
        $rangeImportNodeError = new LiftRangeImportNodeError(LiftRangeImportNodeError::FILE, 'Test.lift-ranges');
        $rangeImportNodeError->addRangeNotFound('rangeId_01');
        $rangeImportNodeError->addRangeNotFound('rangeId_02');

        $exampleImportNodeError = new LiftImportNodeError(LiftImportNodeError::EXAMPLE, '');
        $exampleImportNodeError->addUnhandledElement('elementName01');

        $senseImportNodeError = new LiftImportNodeError(LiftImportNodeError::SENSE, '00001-00001');
        $senseImportNodeError->addUnhandledField('typeName01');
        $senseImportNodeError->addUnhandledMedia('url01', 'context01');
        $senseImportNodeError->addSubnodeError($exampleImportNodeError);

        $entryImportNodeError = new LiftImportNodeError(LiftImportNodeError::ENTRY, '00000-00001');
        $entryImportNodeError->addUnhandledNote('noteType01');
        $entryImportNodeError->addUnhandledTrait('traitName01');
        $entryImportNodeError->addSubnodeError($senseImportNodeError);

        $liftImportNodeError = new LiftImportNodeError(LiftImportNodeError::FILE, 'Test.lift');
        $liftImportNodeError->addSubnodeError($rangeImportNodeError);
        $liftImportNodeError->addSubnodeError($entryImportNodeError);

        $zipNodeError = new ZipImportNodeError(ZipImportNodeError::FILE, 'Test.zip');
        $zipNodeError->addSubnodeError($liftImportNodeError);
        $report = new ImportErrorReport();
        $report->nodeErrors[] = $zipNodeError;

//         echo "<pre>";
//         echo $report->toFormattedString();
//         echo "</pre>";

        $this->assertPattern("/" . self::zipImportReport . "/", $report->toFormattedString());
    }
}
