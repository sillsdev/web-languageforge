<?php

use models\languageforge\lexicon\LexiconProjectModel;
use models\languageforge\lexicon\LexEntryListModel;
use models\languageforge\lexicon\LiftImport;
use models\languageforge\lexicon\LiftMergeRule;
use models\languageforge\lexicon\LexEntryModel;

require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');
require_once(TestPath . 'common/MongoTestEnvironment.php');
require_once(dirname(__FILE__) . '/LexTestData.php');

class TestLiftImport extends UnitTestCase {

	function testLiftImportMerge_XmlOldVer_Exception() {
		$e = new LexiconMongoTestEnvironment();
		$e->clean();
		
		$project = $e->createProject(SF_TESTPROJECT);
		$liftXml = LexTestData::liftOneEntryV0_12;
		
		$e->inhibitErrorDisplay();
		$this->expectError(new PatternExpectation("/Element lift failed to validate content/i"));
		LiftImport::merge($liftXml, $project);
		$e->restoreErrorDisplay();
	}

	function testLiftImportMerge_XmlInvalidAttribute_Exception() {
		$e = new LexiconMongoTestEnvironment();
		$e->clean();
		
		$project = $e->createProject(SF_TESTPROJECT);
		$liftXml = LexTestData::liftInvalidAttribute;
		
		$e->inhibitErrorDisplay();
		$this->expectError(new PatternExpectation("/Expecting an element pronunciation, got nothing/i"));
		$this->expectError(new PatternExpectation("/Invalid attribute xXxXx for element entry/i"));
		$this->expectError(new PatternExpectation("/Element lift has extra content: entry/i"));
		LiftImport::merge($liftXml, $project);
		$e->restoreErrorDisplay();
	}

	function testLiftImportMerge_XmlValidAndNoExistingData_NoExceptionAndMergeOk() {
		$e = new LexiconMongoTestEnvironment();
		$e->clean();
		
		$project = $e->createProject(SF_TESTPROJECT);
		$liftXml = LexTestData::liftTwoEntriesV0_13;
		$mergeRule =  LiftMergeRule::IMPORT_WINS;
		$skipSameModTime = false;
		
		LiftImport::merge($liftXml, $project, $mergeRule, $skipSameModTime);
		
		$entryList = new LexEntryListModel($project);
		$entryList->read();
		$entries = $entryList->entries;
		$this->assertEqual($entryList->count, 2, "Should be 2 entries");
		$this->assertEqual($entries[0]['guid'], "dd15cbc4-9085-4d66-af3d-8428f078a7da", "First entry should have given guid");
		$this->assertEqual($entries[0]['lexeme']['th-fonipa']['value'], "chùuchìi mǔu krɔ̂ɔp", "First entry should have given IPA form");
		$this->assertEqual($entries[0]['lexeme']['th']['value'], "ฉู่ฉี่หมูกรอบ", "First entry should have given Thai form");
		$this->assertEqual($entries[0]['senses'][0]['definition']['en']['value'], "A kind of curry fried with crispy pork", "First entry definition should have given English form");
		$this->assertEqual($entries[0]['senses'][0]['partOfSpeech']['value'], "Noun", "First entry part of speech should have given value");
		$this->assertEqual($entries[0]['senses'][0]['semanticDomain'][0], "5.2 Food", "First entry semantic domain should have given value");
		$this->assertEqual($entries[0]['senses'][0]['semanticDomain'][1], "1 Universe, creation", "First entry semantic domain should have given value");
		$this->assertEqual($entries[0]['senses'][0]['examples'][0]['sentence']['th-fonipa']['value'], "sentence 1", "First entry example sentence 1 should have given value");
		$this->assertEqual($entries[0]['senses'][0]['examples'][0]['translation']['en']['value'], "translation 1", "First entry example translation 1 should have given value");
		$this->assertEqual($entries[0]['senses'][0]['examples'][1]['sentence']['th-fonipa']['value'], "sentence 2", "First entry example sentence 2 should have given value");
		$this->assertEqual($entries[0]['senses'][0]['examples'][1]['translation']['en']['value'], "translation 2", "First entry example translation 2 should have given value");
		$this->assertEqual($entries[1]['guid'], "05473cb0-4165-4923-8d81-02f8b8ed3f26", "Second entry should have given guid");
		$this->assertEqual($entries[1]['lexeme']['th-fonipa']['value'], "khâaw kài thɔ̀ɔt", "Second entry should have given IPA form");
		$this->assertEqual($entries[1]['lexeme']['th']['value'], "ข้าวไก่ทอด", "Second entry should have given Thai form");
		
// 		echo "<pre>";
// 		echo "entries[0]: " . var_export($entries[0], true);
// 		echo "</pre>";
	}

	function testLiftImportMerge_ExistingDataAndImportWins_MergeOk() {
		$e = new LexiconMongoTestEnvironment();
		
		$project = $e->createProject(SF_TESTPROJECT);
		$liftXml = LexTestData::liftTwoEntriesV0_13;
		LiftImport::merge($liftXml, $project);	// create existing data
		$liftXml = LexTestData::liftTwoEntriesCorrectedV0_13;
		$mergeRule =  LiftMergeRule::IMPORT_WINS;
		$skipSameModTime = false;
		
		LiftImport::merge($liftXml, $project, $mergeRule, $skipSameModTime);
		
		$entryList = new LexEntryListModel($project);
		$entryList->read();
		$entries = $entryList->entries;
		$this->assertEqual($entryList->count, 2, "Should be 2 entries");
		$this->assertEqual($entries[0]['guid'], "dd15cbc4-9085-4d66-af3d-8428f078a7da", "First entry should have given guid");
		$this->assertEqual($entries[0]['lexeme']['th-fonipa']['value'], "chùuchìi mǔu krɔ̀ɔp", "First entry should have corrected IPA form");
		$this->assertEqual($entries[1]['guid'], "05473cb0-4165-4923-8d81-02f8b8ed3f26", "Second entry should have given guid");
		$this->assertEqual($entries[1]['lexeme']['th-fonipa']['value'], "khâaw kài thɔ̂ɔt", "Second entry should have corrected IPA form");
	}

	function testLiftImportMerge_ExistingDataAndImportWinsAndSkip_NoMerge() {
		$e = new LexiconMongoTestEnvironment();
		
		$project = $e->createProject(SF_TESTPROJECT);
		$liftXml = LexTestData::liftTwoEntriesV0_13;
		LiftImport::merge($liftXml, $project);	// create existing data
		$liftXml = LexTestData::liftTwoEntriesCorrectedV0_13;
		$mergeRule =  LiftMergeRule::IMPORT_WINS;
		$skipSameModTime = true;
		
		LiftImport::merge($liftXml, $project, $mergeRule, $skipSameModTime);
		
		$entryList = new LexEntryListModel($project);
		$entryList->read();
		$entries = $entryList->entries;
		$this->assertEqual($entryList->count, 2, "Should be 2 entries");
		$this->assertEqual($entries[0]['guid'], "dd15cbc4-9085-4d66-af3d-8428f078a7da", "First entry should have given guid");
		$this->assertEqual($entries[0]['lexeme']['th-fonipa']['value'], "chùuchìi mǔu krɔ̂ɔp", "First entry should have uncorrected IPA form");
		$this->assertEqual($entries[1]['guid'], "05473cb0-4165-4923-8d81-02f8b8ed3f26", "Second entry should have given guid");
		$this->assertEqual($entries[1]['lexeme']['th-fonipa']['value'], "khâaw kài thɔ̀ɔt", "Second entry should have uncorrected IPA form");
	}

	function testLiftImportMerge_ExistingDataAndImportWinsAndSkip_MergeOk() {
		$e = new LexiconMongoTestEnvironment();
		
		$project = $e->createProject(SF_TESTPROJECT);
		$liftXml = LexTestData::liftTwoEntriesV0_13;
		LiftImport::merge($liftXml, $project);	// create existing data
		$liftXml = LexTestData::liftTwoEntriesModifiedV0_13;
		$mergeRule =  LiftMergeRule::IMPORT_WINS;
		$skipSameModTime = true;
		
		LiftImport::merge($liftXml, $project, $mergeRule, $skipSameModTime);
		
		$entryList = new LexEntryListModel($project);
		$entryList->read();
		$entries = $entryList->entries;
		$this->assertEqual($entryList->count, 2, "Should be 2 entries");
		$this->assertEqual($entries[0]['guid'], "dd15cbc4-9085-4d66-af3d-8428f078a7da", "First entry should have given guid");
		$this->assertEqual($entries[0]['lexeme']['th-fonipa']['value'], "chùuchìi mǔu krɔ̀ɔp", "First entry should have corrected IPA form");
		$this->assertEqual($entries[1]['guid'], "05473cb0-4165-4923-8d81-02f8b8ed3f26", "Second entry should have given guid");
		$this->assertEqual($entries[1]['lexeme']['th-fonipa']['value'], "khâaw kài thɔ̂ɔt", "Second entry should have corrected IPA form");
	}

	function testLiftImportMerge_ExistingDataAndImportLoses_NoMerge() {
		$e = new LexiconMongoTestEnvironment();
		
		$project = $e->createProject(SF_TESTPROJECT);
		$liftXml = LexTestData::liftTwoEntriesV0_13;
		LiftImport::merge($liftXml, $project);	// create existing data
		$liftXml = LexTestData::liftTwoEntriesCorrectedV0_13;
		$mergeRule =  LiftMergeRule::IMPORT_LOSES;
		$skipSameModTime = false;
		
		LiftImport::merge($liftXml, $project, $mergeRule, $skipSameModTime);
		
		$entryList = new LexEntryListModel($project);
		$entryList->read();
		$entries = $entryList->entries;
		$this->assertEqual($entryList->count, 2, "Should be 2 entries");
		$this->assertEqual($entries[0]['guid'], "dd15cbc4-9085-4d66-af3d-8428f078a7da", "First entry should have given guid");
		$this->assertEqual($entries[0]['lexeme']['th-fonipa']['value'], "chùuchìi mǔu krɔ̂ɔp", "First entry should have uncorrected IPA form");
		$this->assertEqual($entries[1]['guid'], "05473cb0-4165-4923-8d81-02f8b8ed3f26", "Second entry should have given guid");
		$this->assertEqual($entries[1]['lexeme']['th-fonipa']['value'], "khâaw kài thɔ̀ɔt", "Second entry should have uncorrected IPA form");
	}

	function testLiftImportMerge_ExistingDataAndCreateDuplicates_DuplicatesCreated() {
		$e = new LexiconMongoTestEnvironment();
		
		$project = $e->createProject(SF_TESTPROJECT);
		$liftXml = LexTestData::liftTwoEntriesV0_13;
		LiftImport::merge($liftXml, $project);	// create existing data
		$liftXml = LexTestData::liftTwoEntriesCorrectedV0_13;
		$mergeRule =  LiftMergeRule::CREATE_DUPLICATES;
		$skipSameModTime = false;
		
		LiftImport::merge($liftXml, $project, $mergeRule, $skipSameModTime);
		
		$entryList = new LexEntryListModel($project);
		$entryList->read();
		$entries = $entryList->entries;
		$this->assertEqual($entryList->count, 4, "Should be 4 entries");
		$this->assertEqual($entries[0]['guid'], "dd15cbc4-9085-4d66-af3d-8428f078a7da", "First entry should have given guid");
		$this->assertEqual($entries[0]['lexeme']['th-fonipa']['value'], "chùuchìi mǔu krɔ̂ɔp", "First entry should have uncorrected IPA form");
		$this->assertEqual($entries[1]['guid'], "05473cb0-4165-4923-8d81-02f8b8ed3f26", "Second entry should have given guid");
		$this->assertEqual($entries[1]['lexeme']['th-fonipa']['value'], "khâaw kài thɔ̀ɔt", "Second entry should have uncorrected IPA form");
		$this->assertEqual($entries[2]['guid'], "", "Third entry should have an empty guid");
		$this->assertEqual($entries[2]['lexeme']['th-fonipa']['value'], "chùuchìi mǔu krɔ̀ɔp", "Third entry should have corrected IPA form");
		$this->assertEqual($entries[3]['guid'], "", "Fourth entry should have an empty guid");
		$this->assertEqual($entries[3]['lexeme']['th-fonipa']['value'], "khâaw kài thɔ̂ɔt", "Fourth entry should have corrected IPA form");
	}

	function testLiftImportMerge_ExistingDataAndCreateDuplicatesAndSkip_NoMerge() {
		$e = new LexiconMongoTestEnvironment();
		
		$project = $e->createProject(SF_TESTPROJECT);
		$liftXml = LexTestData::liftTwoEntriesV0_13;
		LiftImport::merge($liftXml, $project);	// create existing data
		$liftXml = LexTestData::liftTwoEntriesCorrectedV0_13;
		$mergeRule =  LiftMergeRule::CREATE_DUPLICATES;
		$skipSameModTime = true;
		
		LiftImport::merge($liftXml, $project, $mergeRule, $skipSameModTime);
		
		$entryList = new LexEntryListModel($project);
		$entryList->read();
		$entries = $entryList->entries;
		$this->assertEqual($entryList->count, 2, "Should be 2 entries");
		$this->assertEqual($entries[0]['guid'], "dd15cbc4-9085-4d66-af3d-8428f078a7da", "First entry should have given guid");
		$this->assertEqual($entries[0]['lexeme']['th-fonipa']['value'], "chùuchìi mǔu krɔ̂ɔp", "First entry should have uncorrected IPA form");
		$this->assertEqual($entries[1]['guid'], "05473cb0-4165-4923-8d81-02f8b8ed3f26", "Second entry should have given guid");
		$this->assertEqual($entries[1]['lexeme']['th-fonipa']['value'], "khâaw kài thɔ̀ɔt", "Second entry should have uncorrected IPA form");
	}

}

?>
