<?php

use models\languageforge\lexicon\LiftImport;
use models\languageforge\lexicon\LiftMergeRule;
use models\languageforge\lexicon\LexEntryListModel;

require_once dirname(__FILE__) . '/../../TestConfig.php';
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
    }

    private static function indexByGuid($entries)
    {
        $index = array();
        foreach ($entries as $entry) {
            $index[$entry['guid']] = $entry;
        }
        return $index;
    }

    public function testLiftImportMerge_ZipFile_CorrectValues()
    {
        $zipFilePath = TestPath . 'common/TestLexProject.zip';
        $uploadPath = $this->environ->uploadFile($zipFilePath, 'TestLexProject.zip');
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        $this->assertTrue(array_key_exists('en', $project->inputSystems));
        $this->assertTrue(array_key_exists('th', $project->inputSystems));
        $this->assertFalse(array_key_exists('th-fonipa', $project->inputSystems));

        $importer = LiftImport::get()->importZip($uploadPath, $project);

        $entryList = new LexEntryListModel($project);
        $entryList->read();
        $entries = $entryList->entries;
        $this->assertEqual($entryList->count, 2);
        $index = self::indexByGuid($entries);
        $entry0 = $index['dd15cbc4-9085-4d66-af3d-8428f078a7da'];
        $entry1 = $index['05473cb0-4165-4923-8d81-02f8b8ed3f26'];
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
        $this->assertFalse($importer->getReport()->hasError());

        $this->environ->cleanupTestFiles($project->getAssetsFolderPath());
    }

    public function testLiftImportMerge_ZipFile_WrongFormat_Exception()
    {
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $zipFilePath = TestPath . 'common/TestLexProject.zip';
        $uploadPath = $this->environ->uploadFile($zipFilePath, 'TestLexProject.tar.gz');
        $otherFile = str_replace('.zip', '.tar.gz', $uploadPath);
        copy($uploadPath, $otherFile);

        $this->environ->inhibitErrorDisplay();
        $this->expectException(new \Exception("Sorry, the .tar.gz format isn't allowed"));
        $importer = LiftImport::get()->importZip($otherFile, $project);
        $this->environ->restoreErrorDisplay();
        unlink($otherFile);
    }

    public function testLiftImportMerge_ZipFileWithDir_CorrectValues()
    {
        $zipFilePath = TestPath . 'common/TestLexProjectWithDir.zip';
        $uploadPath = $this->environ->uploadFile($zipFilePath, 'TestLexProjectWithDir.zip');
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        $importer = LiftImport::get()->importZip($uploadPath, $project);

        $entryList = new LexEntryListModel($project);
        $entryList->read();
        $entries = $entryList->entries;
        $this->assertEqual($entryList->count, 2);
        $index = self::indexByGuid($entries);
        $entry0 = $index['dd15cbc4-9085-4d66-af3d-8428f078a7da'];
        $entry1 = $index['05473cb0-4165-4923-8d81-02f8b8ed3f26'];
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

        $this->environ->cleanupTestFiles($project->getAssetsFolderPath());
    }

    public function testLiftImportMerge_ZipFileNoLift_Exception()
    {
        $zipFilePath = TestPath . 'common/TestLexNoProject.zip';
        $uploadPath = $this->environ->uploadFile($zipFilePath, 'TestLexNoProject.zip');
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        $this->environ->inhibitErrorDisplay();
        $this->expectException(new \Exception("Uploaded file does not contain any LIFT data"));
        $importer = LiftImport::get()->importZip($uploadPath, $project);
    }

    public function testLiftImportMerge_ZipFile2LiftAndOddFolder_Error()
    {
        $zipFilePath = TestPath . 'common/TestLex2ProjectsOddFolder.zip';
        $uploadPath = $this->environ->uploadFile($zipFilePath, 'TestLex2ProjectsOddFolder.zip');
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        $importer = LiftImport::get()->importZip($uploadPath, $project);

        $report = $importer->getReport();
        $reportStr = $report->toString();

        $this->assertTrue($report->hasError(), 'should have NodeError');
        $this->assertPattern("/unhandled LIFT file/", $reportStr);
        $this->assertPattern("/unhandled subfolder 'OddFolder'/", $reportStr);

        $this->environ->cleanupTestFiles($project->getAssetsFolderPath());
    }
}
