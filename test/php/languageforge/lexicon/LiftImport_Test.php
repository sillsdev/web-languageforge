<?php
use models\languageforge\lexicon\LexEntryListModel;
use models\languageforge\lexicon\LiftImport;
use models\languageforge\lexicon\LiftMergeRule;

require_once dirname(__FILE__) . '/../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPath . 'common/MongoTestEnvironment.php';
require_once dirname(__FILE__) . '/LexTestData.php';

class TestLiftImport extends UnitTestCase
{
    private static function indexByGuid($entries)
    {
        $index = array();
        foreach ($entries as $entry) {
            $index[$entry['guid']] = $entry;
        }
        return $index;
    }

    // 2x Validation tests, removed until validation is working IJH 2014-03
/*
    function testLiftImportMerge_XmlOldVer_Exception()
    {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $liftXml = LexTestData::liftOneEntryV0_12;

        $e->inhibitErrorDisplay();
        $this->expectException();
        LiftImport::merge($liftXml, $project);
        $e->restoreErrorDisplay();
    }

    function testLiftImportMerge_XmlInvalidAttribute_Exception()
    {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $liftXml = LexTestData::liftInvalidAttribute;

        $e->inhibitErrorDisplay();
        $this->expectException();
        LiftImport::merge($liftXml, $project);
        $e->restoreErrorDisplay();
    }
*/
    public function testLiftImportMerge_XmlValidAndNoExistingData_NoExceptionAndMergeOk()
    {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $liftXml = LexTestData::liftTwoEntriesV0_13;
        $mergeRule = LiftMergeRule::IMPORT_WINS;
        $skipSameModTime = false;

        LiftImport::merge($liftXml, $project, $mergeRule, $skipSameModTime);

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
    }

    public function testLiftImportMerge_ExistingDataAndImportWins_MergeOk()
    {
        $e = new LexiconMongoTestEnvironment();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $liftXml = LexTestData::liftTwoEntriesV0_13;
        LiftImport::merge($liftXml, $project); // create existing data
        $liftXml = LexTestData::liftTwoEntriesCorrectedV0_13;
        $mergeRule = LiftMergeRule::IMPORT_WINS;
        $skipSameModTime = false;

        LiftImport::merge($liftXml, $project, $mergeRule, $skipSameModTime);

        $entryList = new LexEntryListModel($project);
        $entryList->read();
        $entries = $entryList->entries;
        $this->assertEqual($entryList->count, 2);
        $index = self::indexByGuid($entries);
        $this->assertEqual($index['dd15cbc4-9085-4d66-af3d-8428f078a7da']['lexeme']['th-fonipa']['value'], "chùuchìi mǔu krɔ̀ɔp");
        $this->assertEqual(count($index['dd15cbc4-9085-4d66-af3d-8428f078a7da']['senses']), 1);
        $this->assertEqual($index['dd15cbc4-9085-4d66-af3d-8428f078a7da']['senses'][0]['definition']['en']['value'], "A kind of curry fried with crispy pork");
        $this->assertEqual($index['dd15cbc4-9085-4d66-af3d-8428f078a7da']['senses'][0]['partOfSpeech']['value'], "Noun");
        $this->assertEqual($index['05473cb0-4165-4923-8d81-02f8b8ed3f26']['lexeme']['th-fonipa']['value'], "khâaw kài thɔ̂ɔt");
    }

    public function testLiftImportMerge_ExistingDataAndImportWinsAndSkip_NoMerge()
    {
        $e = new LexiconMongoTestEnvironment();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $liftXml = LexTestData::liftTwoEntriesV0_13;
        LiftImport::merge($liftXml, $project); // create existing data
        $liftXml = LexTestData::liftTwoEntriesCorrectedV0_13;
        $mergeRule = LiftMergeRule::IMPORT_WINS;
        $skipSameModTime = true;

        LiftImport::merge($liftXml, $project, $mergeRule, $skipSameModTime);

        $entryList = new LexEntryListModel($project);
        $entryList->read();
        $entries = $entryList->entries;
        $this->assertEqual($entryList->count, 2);
        $index = self::indexByGuid($entries);
        $entry0 = $index['dd15cbc4-9085-4d66-af3d-8428f078a7da'];
        $entry1 = $index['05473cb0-4165-4923-8d81-02f8b8ed3f26'];
        $this->assertEqual($entry0['guid'], "dd15cbc4-9085-4d66-af3d-8428f078a7da");
        $this->assertEqual($entry0['lexeme']['th-fonipa']['value'], "chùuchìi mǔu krɔ̂ɔp");
        $this->assertEqual(count($entry0['senses']), 1);
        $this->assertEqual($entry0['senses'][0]['definition']['en']['value'], "incorrect definition");
        $this->assertEqual($entry0['senses'][0]['partOfSpeech']['value'], "Adjective");
        $this->assertEqual($entry1['guid'], "05473cb0-4165-4923-8d81-02f8b8ed3f26");
        $this->assertEqual($entry1['lexeme']['th-fonipa']['value'], "khâaw kài thɔ̀ɔt");
    }

    public function testLiftImportMerge_ExistingDataAndImportWinsAndSkip_MergeOk()
    {
        $e = new LexiconMongoTestEnvironment();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $liftXml = LexTestData::liftTwoEntriesV0_13;
        LiftImport::merge($liftXml, $project); // create existing data
        $liftXml = LexTestData::liftTwoEntriesModifiedV0_13;
        $mergeRule = LiftMergeRule::IMPORT_WINS;
        $skipSameModTime = true;

        LiftImport::merge($liftXml, $project, $mergeRule, $skipSameModTime);

        $entryList = new LexEntryListModel($project);
        $entryList->read();
        $entries = $entryList->entries;
        $this->assertEqual($entryList->count, 2);
        $index = self::indexByGuid($entries);
        $entry0 = $index['dd15cbc4-9085-4d66-af3d-8428f078a7da'];
        $entry1 = $index['05473cb0-4165-4923-8d81-02f8b8ed3f26'];
        $this->assertEqual($entry0['guid'], "dd15cbc4-9085-4d66-af3d-8428f078a7da");
        $this->assertEqual($entry0['lexeme']['th-fonipa']['value'], "chùuchìi mǔu krɔ̀ɔp");
        $this->assertEqual(count($entry0['senses']), 2);
        $this->assertEqual($entry0['senses'][0]['definition']['en']['value'], "incorrect definition");
        $this->assertEqual($entry0['senses'][0]['partOfSpeech']['value'], "Adjective");
        $this->assertEqual($entry0['senses'][1]['definition']['en']['value'], "A kind of curry fried with crispy pork");
        $this->assertEqual($entry0['senses'][1]['partOfSpeech']['value'], "Noun");
        $this->assertEqual($entry1['guid'], "05473cb0-4165-4923-8d81-02f8b8ed3f26");
        $this->assertEqual($entry1['lexeme']['th-fonipa']['value'], "khâaw kài thɔ̂ɔt");
    }

    public function testLiftImportMerge_ExistingDataAndImportWinsAndDeleteMatchingEntry_EntryDeleted()
    {
        $e = new LexiconMongoTestEnvironment();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $liftXml = LexTestData::liftTwoEntriesV0_13;
        LiftImport::merge($liftXml, $project); // create existing data
        $liftXml = LexTestData::liftTwoEntriesOneCorrectedOneDeletedV0_13;
        $mergeRule = LiftMergeRule::IMPORT_WINS;
        $skipSameModTime = false;
        $deleteMatchingEntry = true;

        LiftImport::merge($liftXml, $project, $mergeRule, $skipSameModTime, $deleteMatchingEntry);

        $entryList = new LexEntryListModel($project);
        $entryList->read();
        $entries = $entryList->entries;
        $this->assertEqual($entryList->count, 1);
        $index = self::indexByGuid($entries);
        $entry0 = $index['dd15cbc4-9085-4d66-af3d-8428f078a7da'];
        $this->assertEqual($entry0['guid'], "dd15cbc4-9085-4d66-af3d-8428f078a7da");
        $this->assertEqual($entry0['lexeme']['th-fonipa']['value'], "chùuchìi mǔu krɔ̀ɔp");
    }

    public function testLiftImportMerge_ExistingDataAndImportWinsAndSkipSameModTimeAndDeleteMatchingEntry_EntryDeletedAndOtherEntryNotCorrected()
    {
        $e = new LexiconMongoTestEnvironment();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $liftXml = LexTestData::liftTwoEntriesV0_13;
        LiftImport::merge($liftXml, $project); // create existing data
        $liftXml = LexTestData::liftTwoEntriesOneCorrectedOneDeletedV0_13;
        $mergeRule = LiftMergeRule::IMPORT_WINS;
        $skipSameModTime = true;
        $deleteMatchingEntry = true;

        LiftImport::merge($liftXml, $project, $mergeRule, $skipSameModTime, $deleteMatchingEntry);

        $entryList = new LexEntryListModel($project);
        $entryList->read();
        $entries = $entryList->entries;
        $this->assertEqual($entryList->count, 1);
        $index = self::indexByGuid($entries);
        $entry0 = $index['dd15cbc4-9085-4d66-af3d-8428f078a7da'];
        $this->assertEqual($entry0['guid'], "dd15cbc4-9085-4d66-af3d-8428f078a7da");
        $this->assertEqual($entry0['lexeme']['th-fonipa']['value'], "chùuchìi mǔu krɔ̂ɔp");
    }

    public function testLiftImportMerge_ExistingDataAndImportWins_EntryNotDeleted()
    {
        $e = new LexiconMongoTestEnvironment();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $liftXml = LexTestData::liftTwoEntriesV0_13;
        LiftImport::merge($liftXml, $project); // create existing data
        $liftXml = LexTestData::liftTwoEntriesOneCorrectedOneDeletedV0_13;
        $mergeRule = LiftMergeRule::IMPORT_WINS;
        $skipSameModTime = false;
        $deleteMatchingEntry = false;

        LiftImport::merge($liftXml, $project, $mergeRule, $skipSameModTime, $deleteMatchingEntry);

        $entryList = new LexEntryListModel($project);
        $entryList->read();
        $entries = $entryList->entries;
        $this->assertEqual($entryList->count, 2);
        $index = self::indexByGuid($entries);
        $entry0 = $index['dd15cbc4-9085-4d66-af3d-8428f078a7da'];
        $entry1 = $index['05473cb0-4165-4923-8d81-02f8b8ed3f26'];
        $this->assertEqual($entry0['lexeme']['th-fonipa']['value'], "chùuchìi mǔu krɔ̀ɔp");
        $this->assertEqual($entry1['lexeme']['th-fonipa']['value'], "khâaw kài thɔ̀ɔt");
    }

    public function testLiftImportMerge_ExistingDataAndImportLoses_NoMerge()
    {
        $e = new LexiconMongoTestEnvironment();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $liftXml = LexTestData::liftTwoEntriesV0_13;
        LiftImport::merge($liftXml, $project); // create existing data
        $liftXml = LexTestData::liftTwoEntriesCorrectedV0_13;
        $mergeRule = LiftMergeRule::IMPORT_LOSES;
        $skipSameModTime = false;

        LiftImport::merge($liftXml, $project, $mergeRule, $skipSameModTime);

        $entryList = new LexEntryListModel($project);
        $entryList->read();
        $entries = $entryList->entries;
        $this->assertEqual($entryList->count, 2);
        $index = self::indexByGuid($entries);
        $entry0 = $index['dd15cbc4-9085-4d66-af3d-8428f078a7da'];
        $entry1 = $index['05473cb0-4165-4923-8d81-02f8b8ed3f26'];
        $this->assertEqual($entry0['guid'], "dd15cbc4-9085-4d66-af3d-8428f078a7da");
        $this->assertEqual($entry0['lexeme']['th-fonipa']['value'], "chùuchìi mǔu krɔ̂ɔp");
        $this->assertEqual(count($entry0['senses']), 1);
        $this->assertEqual($entry0['senses'][0]['definition']['en']['value'], "incorrect definition");
        $this->assertEqual($entry0['senses'][0]['partOfSpeech']['value'], "Adjective");
        $this->assertEqual($entry1['guid'], "05473cb0-4165-4923-8d81-02f8b8ed3f26");
        $this->assertEqual($entry1['lexeme']['th-fonipa']['value'], "khâaw kài thɔ̀ɔt");
    }

    public function testLiftImportMerge_ExistingDataAndCreateDuplicates_DuplicatesCreated()
    {
        $e = new LexiconMongoTestEnvironment();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $liftXml = LexTestData::liftTwoEntriesV0_13;
        LiftImport::merge($liftXml, $project); // create existing data
        $liftXml = LexTestData::liftTwoEntriesCorrectedV0_13;
        $mergeRule = LiftMergeRule::CREATE_DUPLICATES;
        $skipSameModTime = false;

        LiftImport::merge($liftXml, $project, $mergeRule, $skipSameModTime);

        $entryList = new LexEntryListModel($project);
        $entryList->read();
        $entries = $entryList->entries;
        $this->assertEqual($entryList->count, 4);
        $index = self::indexByGuid($entries);
        $entry0 = $index['dd15cbc4-9085-4d66-af3d-8428f078a7da'];
        $entry1 = $index['05473cb0-4165-4923-8d81-02f8b8ed3f26'];
        $this->assertEqual($entry0['guid'], "dd15cbc4-9085-4d66-af3d-8428f078a7da");
        $this->assertEqual($entry0['lexeme']['th-fonipa']['value'], "chùuchìi mǔu krɔ̂ɔp");
        $this->assertEqual(count($entry0['senses']), 1);
        $this->assertEqual($entry0['senses'][0]['definition']['en']['value'], "incorrect definition");
        $this->assertEqual($entry0['senses'][0]['partOfSpeech']['value'], "Adjective");
        $this->assertEqual($entry1['guid'], "05473cb0-4165-4923-8d81-02f8b8ed3f26");
        $this->assertEqual($entry1['lexeme']['th-fonipa']['value'], "khâaw kài thɔ̀ɔt");
        $this->assertEqual($entries[2]['guid'], "");
        $this->assertEqual($entries[2]['lexeme']['th-fonipa']['value'], "chùuchìi mǔu krɔ̀ɔp");
        $this->assertEqual(count($entries[2]['senses']), 1);
        $this->assertEqual($entries[2]['senses'][0]['definition']['en']['value'], "A kind of curry fried with crispy pork");
        $this->assertEqual($entries[2]['senses'][0]['partOfSpeech']['value'], "Noun");
        $this->assertEqual($entries[3]['guid'], "");
        $this->assertEqual($entries[3]['lexeme']['th-fonipa']['value'], "khâaw kài thɔ̂ɔt");
    }

    public function testLiftImportMerge_ExistingDataAndCreateDuplicatesAndSkip_NoMerge()
    {
        $e = new LexiconMongoTestEnvironment();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $liftXml = LexTestData::liftTwoEntriesV0_13;
        LiftImport::merge($liftXml, $project); // create existing data
        $liftXml = LexTestData::liftTwoEntriesCorrectedV0_13;
        $mergeRule = LiftMergeRule::CREATE_DUPLICATES;
        $skipSameModTime = true;

        LiftImport::merge($liftXml, $project, $mergeRule, $skipSameModTime);

        $entryList = new LexEntryListModel($project);
        $entryList->read();
        $entries = $entryList->entries;
        $this->assertEqual($entryList->count, 2);
        $index = self::indexByGuid($entries);
        $entry0 = $index['dd15cbc4-9085-4d66-af3d-8428f078a7da'];
        $entry1 = $index['05473cb0-4165-4923-8d81-02f8b8ed3f26'];
        $this->assertEqual($entry0['guid'], "dd15cbc4-9085-4d66-af3d-8428f078a7da");
        $this->assertEqual($entry0['lexeme']['th-fonipa']['value'], "chùuchìi mǔu krɔ̂ɔp");
        $this->assertEqual(count($entry0['senses']), 1);
        $this->assertEqual($entry0['senses'][0]['definition']['en']['value'], "incorrect definition");
        $this->assertEqual($entry0['senses'][0]['partOfSpeech']['value'], "Adjective");
        $this->assertEqual($entry1['guid'], "05473cb0-4165-4923-8d81-02f8b8ed3f26");
        $this->assertEqual($entry1['lexeme']['th-fonipa']['value'], "khâaw kài thɔ̀ɔt");
    }

    public function testLiftImportMerge_NoExistingDataAndXmlHasSpans_NoExceptionAndMergeOk()
    {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $liftXml = LexTestData::liftTwoEntriesWithSpanV0_13;
        $mergeRule = LiftMergeRule::IMPORT_WINS;
        $skipSameModTime = false;

        LiftImport::merge($liftXml, $project, $mergeRule, $skipSameModTime);

        $entryList = new LexEntryListModel($project);
        $entryList->read();
        $entries = $entryList->entries;
        $this->assertEqual($entryList->count, 2);
        $index = self::indexByGuid($entries);
        $entry0 = $index['dd15cbc4-9085-4d66-af3d-8428f078a7da'];
        $entry1 = $index['05473cb0-4165-4923-8d81-02f8b8ed3f26'];
        $this->assertEqual($entry0['guid'], "dd15cbc4-9085-4d66-af3d-8428f078a7da");
        $this->assertEqual($entry0['lexeme']['th-fonipa']['value'], "chùuchìi mǔu krɔ̀ɔp");
        $this->assertEqual($entry0['lexeme']['th']['value'], "ฉู่ฉี่หมูกรอบ");
        $this->assertEqual(count($entry0['senses']), 1);
        $this->assertEqual($entry0['senses'][0]['definition']['en']['value'], "<span lang=\"th\">ฉู่ฉี่หมูกรอบ</span> is a kind of curry fried with crispy pork");
        $this->assertEqual($entry0['senses'][0]['partOfSpeech']['value'], "Noun");
        $this->assertEqual($entry1['guid'], "05473cb0-4165-4923-8d81-02f8b8ed3f26");
        $this->assertEqual($entry1['lexeme']['th-fonipa']['value'], "khâaw kài thɔ̂ɔt");
        $this->assertEqual($entry1['lexeme']['th']['value'], "ข้าวไก่ทอด");
    }

    public function testLiftImportMerge_NoExistingDataAndNoSpansInNoteFields_NoExceptionAndMergeOk()
    {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $liftXml = LexTestData::liftNotesWithoutSpansV0_13;
        $mergeRule = LiftMergeRule::IMPORT_WINS;
        $skipSameModTime = false;

        LiftImport::merge($liftXml, $project, $mergeRule, $skipSameModTime);

        $entryList = new LexEntryListModel($project);
        $entryList->read();
        $entries = $entryList->entries;
        $this->assertEqual($entryList->count, 2);
        $index = self::indexByGuid($entries);
        $entry0 = $index['57a90e40-fdb4-47f8-89a0-c64bf947723d'];
        $entry1 = $index['8db0bd91-9120-4417-b6ff-d0bb35f552fc'];
        $this->assertEqual($entry0['guid'], "57a90e40-fdb4-47f8-89a0-c64bf947723d");
        $this->assertEqual($entry0['lexeme']['qaa-x-qaa']['value'], "brown bear");
        $this->assertEqual(count($entry0['senses']), 1);
        $this->assertEqual($entry0['senses'][0]['note']['en']['value'], "This is not a black bear.");
        $this->assertEqual($entry0['senses'][0]['semanticDomain']['values'][0], "1.6.1.1.2 Carnivore");
        $this->assertEqual($entry1['guid'], "8db0bd91-9120-4417-b6ff-d0bb35f552fc");
        $this->assertEqual($entry1['lexeme']['qaa-x-qaa']['value'], "black bear");
        $this->assertEqual($entry1['senses'][0]['note']['en']['value'], "This is not a brown bear.");
        $this->assertEqual($entry1['senses'][0]['semanticDomain']['values'][0], "1.6.1.1.2 Carnivore");
    }

    public function testLiftImportMerge_NoExistingDataAndSpansInNoteFields_NoExceptionAndMergeOk()
    {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $liftXml = LexTestData::liftNotesWithSpansV0_13;
        $mergeRule = LiftMergeRule::IMPORT_WINS;
        $skipSameModTime = false;

        LiftImport::merge($liftXml, $project, $mergeRule, $skipSameModTime);

        $entryList = new LexEntryListModel($project);
        $entryList->read();
        $entries = $entryList->entries;
        $this->assertEqual($entryList->count, 2);
        $index = self::indexByGuid($entries);
        $entry0 = $index['57a90e40-fdb4-47f8-89a0-c64bf947723d'];
        $entry1 = $index['8db0bd91-9120-4417-b6ff-d0bb35f552fc'];
        $this->assertEqual($entry0['guid'], "57a90e40-fdb4-47f8-89a0-c64bf947723d");
        $this->assertEqual($entry0['lexeme']['qaa-x-qaa']['value'], "brown bear");
        $this->assertEqual(count($entry0['senses']), 1);
        $this->assertEqual($entry0['senses'][0]['note']['en']['value'], "This is not a black bear, and <span lang=\"fr\">ceci n'est pas une pipe</span>.");
        $this->assertEqual($entry0['senses'][0]['semanticDomain']['values'][0], "1.6.1.1.2 Carnivore");
        $this->assertEqual($entry1['guid'], "8db0bd91-9120-4417-b6ff-d0bb35f552fc");
        $this->assertEqual($entry1['lexeme']['qaa-x-qaa']['value'], "black bear");
        $this->assertEqual($entry1['senses'][0]['note']['en']['value'], "This is not a brown bear.");
        $this->assertEqual($entry1['senses'][0]['semanticDomain']['values'][0], "1.6.1.1.2 Carnivore");
    }

}
