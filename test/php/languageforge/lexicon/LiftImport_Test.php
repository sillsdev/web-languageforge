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
/* 2x Validation tests, removed until validation is working IJH 2014-03
	function testLiftImportMerge_XmlOldVer_Exception() {
		$e = new LexiconMongoTestEnvironment();
		$e->clean();
		
		$project = $e->createProject(SF_TESTPROJECT);
		$liftXml = LexTestData::liftOneEntryV0_12;
		
		$e->inhibitErrorDisplay();
		$this->expectException();
		LiftImport::merge($liftXml, $project);
		$e->restoreErrorDisplay();
	}

	function testLiftImportMerge_XmlInvalidAttribute_Exception() {
		$e = new LexiconMongoTestEnvironment();
		$e->clean();
		
		$project = $e->createProject(SF_TESTPROJECT);
		$liftXml = LexTestData::liftInvalidAttribute;
		
		$e->inhibitErrorDisplay();
		$this->expectException();
		LiftImport::merge($liftXml, $project);
		$e->restoreErrorDisplay();
	}
*/
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
		$this->assertEqual($entryList->count, 2);
		$this->assertEqual($entries[0]['guid'], "dd15cbc4-9085-4d66-af3d-8428f078a7da");
		$this->assertEqual($entries[0]['lexeme']['th-fonipa']['value'], "chùuchìi mǔu krɔ̂ɔp");
		$this->assertEqual($entries[0]['lexeme']['th']['value'], "ฉู่ฉี่หมูกรอบ");
		$this->assertEqual(count($entries[0]['senses']), 1);
		$this->assertEqual($entries[0]['senses'][0]['definition']['en']['value'], "incorrect definition");
		$this->assertEqual($entries[0]['senses'][0]['partOfSpeech']['value'], "Adjective");
		$this->assertEqual($entries[0]['senses'][0]['semanticDomain']['values'][0], "5.2 Food");
		$this->assertEqual($entries[0]['senses'][0]['semanticDomain']['values'][1], "1 Universe, creation");
		$this->assertEqual($entries[0]['senses'][0]['examples'][0]['sentence']['th-fonipa']['value'], "sentence 1");
		$this->assertEqual($entries[0]['senses'][0]['examples'][0]['translation']['en']['value'], "translation 1");
		$this->assertEqual($entries[0]['senses'][0]['examples'][1]['sentence']['th-fonipa']['value'], "sentence 2");
		$this->assertEqual($entries[0]['senses'][0]['examples'][1]['translation']['en']['value'], "translation 2");
		$this->assertEqual($entries[1]['guid'], "05473cb0-4165-4923-8d81-02f8b8ed3f26");
		$this->assertEqual($entries[1]['lexeme']['th-fonipa']['value'], "khâaw kài thɔ̀ɔt");
		$this->assertEqual($entries[1]['lexeme']['th']['value'], "ข้าวไก่ทอด");
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
		$this->assertEqual($entryList->count, 2);
		$this->assertEqual($entries[1]['guid'], "dd15cbc4-9085-4d66-af3d-8428f078a7da");
		$this->assertEqual($entries[1]['lexeme']['th-fonipa']['value'], "chùuchìi mǔu krɔ̀ɔp");
		$this->assertEqual(count($entries[1]['senses']), 1);
		$this->assertEqual($entries[1]['senses'][0]['definition']['en']['value'], "A kind of curry fried with crispy pork");
		$this->assertEqual($entries[1]['senses'][0]['partOfSpeech']['value'], "Noun");
		$this->assertEqual($entries[0]['guid'], "05473cb0-4165-4923-8d81-02f8b8ed3f26");
		$this->assertEqual($entries[0]['lexeme']['th-fonipa']['value'], "khâaw kài thɔ̂ɔt");
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
		$this->assertEqual($entryList->count, 2);
		$this->assertEqual($entries[0]['guid'], "dd15cbc4-9085-4d66-af3d-8428f078a7da");
		$this->assertEqual($entries[0]['lexeme']['th-fonipa']['value'], "chùuchìi mǔu krɔ̂ɔp");
		$this->assertEqual(count($entries[0]['senses']), 1);
		$this->assertEqual($entries[0]['senses'][0]['definition']['en']['value'], "incorrect definition");
		$this->assertEqual($entries[0]['senses'][0]['partOfSpeech']['value'], "Adjective");
		$this->assertEqual($entries[1]['guid'], "05473cb0-4165-4923-8d81-02f8b8ed3f26");
		$this->assertEqual($entries[1]['lexeme']['th-fonipa']['value'], "khâaw kài thɔ̀ɔt");
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
		$this->assertEqual($entryList->count, 2);
		$this->assertEqual($entries[1]['guid'], "dd15cbc4-9085-4d66-af3d-8428f078a7da");
		$this->assertEqual($entries[1]['lexeme']['th-fonipa']['value'], "chùuchìi mǔu krɔ̀ɔp");
		$this->assertEqual(count($entries[1]['senses']), 2);
		$this->assertEqual($entries[1]['senses'][0]['definition']['en']['value'], "incorrect definition");
		$this->assertEqual($entries[1]['senses'][0]['partOfSpeech']['value'], "Adjective");
		$this->assertEqual($entries[1]['senses'][1]['definition']['en']['value'], "A kind of curry fried with crispy pork");
		$this->assertEqual($entries[1]['senses'][1]['partOfSpeech']['value'], "Noun");
		$this->assertEqual($entries[0]['guid'], "05473cb0-4165-4923-8d81-02f8b8ed3f26");
		$this->assertEqual($entries[0]['lexeme']['th-fonipa']['value'], "khâaw kài thɔ̂ɔt");
	}

	function testLiftImportMerge_ExistingDataAndImportWinsAndDeleteMatchingEntry_EntryDeleted() {
		$e = new LexiconMongoTestEnvironment();
		
		$project = $e->createProject(SF_TESTPROJECT);
		$liftXml = LexTestData::liftTwoEntriesV0_13;
		LiftImport::merge($liftXml, $project);	// create existing data
		$liftXml = LexTestData::liftTwoEntriesOneCorrectedOneDeletedV0_13;
		$mergeRule =  LiftMergeRule::IMPORT_WINS;
		$skipSameModTime = false;
		$deleteMatchingEntry = true;
		
		LiftImport::merge($liftXml, $project, $mergeRule, $skipSameModTime, $deleteMatchingEntry);
		
		$entryList = new LexEntryListModel($project);
		$entryList->read();
		$entries = $entryList->entries;
		$this->assertEqual($entryList->count, 1);
		$this->assertEqual($entries[0]['guid'], "dd15cbc4-9085-4d66-af3d-8428f078a7da");
		$this->assertEqual($entries[0]['lexeme']['th-fonipa']['value'], "chùuchìi mǔu krɔ̀ɔp");
	}

	function testLiftImportMerge_ExistingDataAndImportWinsAndSkipSameModTimeAndDeleteMatchingEntry_EntryDeletedAndOtherEntryNotCorrected() {
		$e = new LexiconMongoTestEnvironment();
		
		$project = $e->createProject(SF_TESTPROJECT);
		$liftXml = LexTestData::liftTwoEntriesV0_13;
		LiftImport::merge($liftXml, $project);	// create existing data
		$liftXml = LexTestData::liftTwoEntriesOneCorrectedOneDeletedV0_13;
		$mergeRule =  LiftMergeRule::IMPORT_WINS;
		$skipSameModTime = true;
		$deleteMatchingEntry = true;
		
		LiftImport::merge($liftXml, $project, $mergeRule, $skipSameModTime, $deleteMatchingEntry);
		
		$entryList = new LexEntryListModel($project);
		$entryList->read();
		$entries = $entryList->entries;
		$this->assertEqual($entryList->count, 1);
		$this->assertEqual($entries[0]['guid'], "dd15cbc4-9085-4d66-af3d-8428f078a7da");
		$this->assertEqual($entries[0]['lexeme']['th-fonipa']['value'], "chùuchìi mǔu krɔ̂ɔp");
	}

	function testLiftImportMerge_ExistingDataAndImportWins_EntryNotDeleted() {
		$e = new LexiconMongoTestEnvironment();
		
		$project = $e->createProject(SF_TESTPROJECT);
		$liftXml = LexTestData::liftTwoEntriesV0_13;
		LiftImport::merge($liftXml, $project);	// create existing data
		$liftXml = LexTestData::liftTwoEntriesOneCorrectedOneDeletedV0_13;
		$mergeRule =  LiftMergeRule::IMPORT_WINS;
		$skipSameModTime = false;
		$deleteMatchingEntry = false;
		
		LiftImport::merge($liftXml, $project, $mergeRule, $skipSameModTime, $deleteMatchingEntry);
		
		$entryList = new LexEntryListModel($project);
		$entryList->read();
		$entries = $entryList->entries;
		$this->assertEqual($entryList->count, 2);
		$this->assertEqual($entries[1]['guid'], "dd15cbc4-9085-4d66-af3d-8428f078a7da");
		$this->assertEqual($entries[1]['lexeme']['th-fonipa']['value'], "chùuchìi mǔu krɔ̀ɔp");
		$this->assertEqual($entries[0]['guid'], "05473cb0-4165-4923-8d81-02f8b8ed3f26");
		$this->assertEqual($entries[0]['lexeme']['th-fonipa']['value'], "khâaw kài thɔ̀ɔt");
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
		$this->assertEqual($entryList->count, 2);
		$this->assertEqual($entries[0]['guid'], "dd15cbc4-9085-4d66-af3d-8428f078a7da");
		$this->assertEqual($entries[0]['lexeme']['th-fonipa']['value'], "chùuchìi mǔu krɔ̂ɔp");
		$this->assertEqual(count($entries[0]['senses']), 1);
		$this->assertEqual($entries[0]['senses'][0]['definition']['en']['value'], "incorrect definition");
		$this->assertEqual($entries[0]['senses'][0]['partOfSpeech']['value'], "Adjective");
		$this->assertEqual($entries[1]['guid'], "05473cb0-4165-4923-8d81-02f8b8ed3f26");
		$this->assertEqual($entries[1]['lexeme']['th-fonipa']['value'], "khâaw kài thɔ̀ɔt");
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
		$this->assertEqual($entryList->count, 4);
		$this->assertEqual($entries[0]['guid'], "dd15cbc4-9085-4d66-af3d-8428f078a7da");
		$this->assertEqual($entries[0]['lexeme']['th-fonipa']['value'], "chùuchìi mǔu krɔ̂ɔp");
		$this->assertEqual(count($entries[0]['senses']), 1);
		$this->assertEqual($entries[0]['senses'][0]['definition']['en']['value'], "incorrect definition");
		$this->assertEqual($entries[0]['senses'][0]['partOfSpeech']['value'], "Adjective");
		$this->assertEqual($entries[1]['guid'], "05473cb0-4165-4923-8d81-02f8b8ed3f26");
		$this->assertEqual($entries[1]['lexeme']['th-fonipa']['value'], "khâaw kài thɔ̀ɔt");
		$this->assertEqual($entries[2]['guid'], "");
		$this->assertEqual($entries[2]['lexeme']['th-fonipa']['value'], "chùuchìi mǔu krɔ̀ɔp");
		$this->assertEqual(count($entries[2]['senses']), 1);
		$this->assertEqual($entries[2]['senses'][0]['definition']['en']['value'], "A kind of curry fried with crispy pork");
		$this->assertEqual($entries[2]['senses'][0]['partOfSpeech']['value'], "Noun");
		$this->assertEqual($entries[3]['guid'], "");
		$this->assertEqual($entries[3]['lexeme']['th-fonipa']['value'], "khâaw kài thɔ̂ɔt");
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
		$this->assertEqual($entryList->count, 2);
		$this->assertEqual($entries[0]['guid'], "dd15cbc4-9085-4d66-af3d-8428f078a7da");
		$this->assertEqual($entries[0]['lexeme']['th-fonipa']['value'], "chùuchìi mǔu krɔ̂ɔp");
		$this->assertEqual(count($entries[0]['senses']), 1);
		$this->assertEqual($entries[0]['senses'][0]['definition']['en']['value'], "incorrect definition");
		$this->assertEqual($entries[0]['senses'][0]['partOfSpeech']['value'], "Adjective");
		$this->assertEqual($entries[1]['guid'], "05473cb0-4165-4923-8d81-02f8b8ed3f26");
		$this->assertEqual($entries[1]['lexeme']['th-fonipa']['value'], "khâaw kài thɔ̀ɔt");
	}

}

?>
