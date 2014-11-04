<?php
use models\languageforge\lexicon\LexEntryListModel;
use models\languageforge\lexicon\LiftImport;
use models\languageforge\lexicon\LiftMergeRule;

require_once dirname(__FILE__) . '/../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPath . 'common/MongoTestEnvironment.php';

class TestLiftImport extends UnitTestCase
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

    private static function indexByGuid($entries)
    {
        $index = array();
        foreach ($entries as $entry) {
            $index[$entry['guid']] = $entry;
        }
        return $index;
    }

    /**
     * Cleanup test lift files
     */
    public function tearDown()
    {
        $this->environ->cleanupTestUploadFiles();
        $this->environ->clean();
    }

    // 2x Validation tests, removed until validation is working IJH 2014-03
/*
    const liftOneEntryV0_12 = <<<EOD
<?xml version="1.0" encoding="utf-8"?>
<lift
	version="0.12"
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

    function testLiftImportMerge_XmlOldVer_Exception()
    {
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $liftXml = self::liftOneEntryV0_12;

        $this->environ->inhibitErrorDisplay();
        $this->expectException();
        LiftImport::get()->merge($liftXml, $project);
        $this->environ->restoreErrorDisplay();
    }

    const liftInvalidAttribute = <<<EOD
<?xml version="1.0" encoding="utf-8"?>
<lift
	version="0.13"
	producer="WeSay 1.0.0.0">
	<entry
		xXxXx = "invalidAttribute"
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

    function testLiftImportMerge_XmlInvalidAttribute_Exception()
    {
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $liftXml = self::liftInvalidAttribute;

        $this->environ->inhibitErrorDisplay();
        $this->expectException();
        LiftImport::get()->merge($liftXml, $project);
        $this->environ->restoreErrorDisplay();
    }
*/

    // has incorrect th-fonipa form in each entry
    // has incorrect sense in first entry
    const liftTwoEntriesV0_13 = <<<EOD
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
			<form
				lang="th">
				<text>ฉู่ฉี่หมูกรอบ</text>
			</form>
		</lexical-unit>
		<field
			type="literal-meaning">
			<form
				lang="en">
				<text>Chuchi curry pork crispy</text>
			</form>
		</field>
		<sense
			id="9d50e072-0206-4776-9ee6-bddf89b96aed">
			<definition>
				<form
					lang="en">
					<text>incorrect definition</text>
				</form>
			</definition>
			<gloss
				lang="en">
				<text>incorrect gloss</text>
			</gloss>
			<gloss
				lang="th">
				<text>th incorrect gloss</text>
			</gloss>
			<grammatical-info
				value="Adjective" />
			<example>
				<form
					lang="th-fonipa">
					<text>sentence 1</text>
				</form>
				<translation>
					<form
						lang="en">
						<text>translation 1</text>
					</form>
				</translation>
			</example>
			<example>
				<form
					lang="th-fonipa">
					<text>sentence 2</text>
				</form>
				<translation>
					<form
						lang="en">
						<text>translation 2</text>
					</form>
				</translation>
			</example>
			<illustration
				href="IMG_0214.JPG" />
			<trait
				name="semantic-domain-ddp4"
				value="5.2 Food" />
			<trait
				name="semantic-domain-ddp4"
				value="1 Universe, creation" />
		</sense>
	</entry>
	<entry
		id="Id'dPrematurely_05473cb0-4165-4923-8d81-02f8b8ed3f26"
		dateCreated="2008-10-09T02:15:23Z"
		dateModified="2008-10-17T06:16:11Z"
		guid="05473cb0-4165-4923-8d81-02f8b8ed3f26">
		<lexical-unit>
			<form
				lang="th-fonipa">
				<text>khâaw kài thɔ̀ɔt</text>
			</form>
			<form
				lang="th">
				<text>ข้าวไก่ทอด</text>
			</form>
		</lexical-unit>
		<sense
			id="f60ba047-df0c-47cc-aba1-af4ea1030e31">
			<definition>
				<form
					lang="en">
					<text>pieces of fried chicken served over rice, usually with a sweet and spicy sauce on the side</text>
				</form>
			</definition>
			<illustration
				href="IMG_0187.JPG" />
		</sense>
		<field
			type="literal-meaning">
			<form
				lang="en">
				<text>rice chicken fried</text>
			</form>
		</field>
	</entry>
</lift>
EOD;

    public function testLiftImportMerge_XmlValidAndNoExistingData_NoExceptionAndMergeOk()
    {
        $liftFilePath = $this->environ->createTestLiftFile(self::liftTwoEntriesV0_13, 'TwoEntriesV0_13.lift');
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $mergeRule = LiftMergeRule::IMPORT_WINS;
        $skipSameModTime = false;

        $importer = LiftImport::get()->merge($liftFilePath, $project, $mergeRule, $skipSameModTime);

        $entryList = new LexEntryListModel($project);
        $entryList->read();
        $entries = $entryList->entries;
        $index = self::indexByGuid($entries);
        $entry0 = $index['dd15cbc4-9085-4d66-af3d-8428f078a7da'];
        $entry1 = $index['05473cb0-4165-4923-8d81-02f8b8ed3f26'];

        $this->assertEqual($entryList->count, 2);
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

    // has correct th-fonipa form in each entry
    // has correct sense in first entry (same id)
    const liftTwoEntriesCorrectedV0_13 = <<<EOD
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
				<text>chùuchìi mǔu krɔ̀ɔp</text>
			</form>
			<form
				lang="th">
				<text>ฉู่ฉี่หมูกรอบ</text>
			</form>
		</lexical-unit>
		<sense
			id="9d50e072-0206-4776-9ee6-bddf89b96aed">
			<grammatical-info
				value="Noun" />
			<definition>
				<form
					lang="en">
					<text>A kind of curry fried with crispy pork</text>
				</form>
			</definition>
		</sense>
	</entry>
	<entry
		id="Id'dPrematurely_05473cb0-4165-4923-8d81-02f8b8ed3f26"
		dateCreated="2008-10-09T02:15:23Z"
		dateModified="2008-10-17T06:16:11Z"
		guid="05473cb0-4165-4923-8d81-02f8b8ed3f26">
		<lexical-unit>
			<form
				lang="th-fonipa">
				<text>khâaw kài thɔ̂ɔt</text>
			</form>
			<form
				lang="th">
				<text>ข้าวไก่ทอด</text>
			</form>
		</lexical-unit>
	</entry>
</lift>
EOD;

    public function testLiftImportMerge_ExistingDataAndImportWins_MergeOk()
    {
        // create existing data
        $liftFilePath = $this->environ->createTestLiftFile(self::liftTwoEntriesV0_13, 'TwoEntriesV0_13.lift');
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        LiftImport::get()->merge($liftFilePath, $project);

        $liftFilePath = $this->environ->createTestLiftFile(self::liftTwoEntriesCorrectedV0_13, 'TwoEntriesCorrectedV0_13.lift');
        $mergeRule = LiftMergeRule::IMPORT_WINS;
        $skipSameModTime = false;

        $importer = LiftImport::get()->merge($liftFilePath, $project, $mergeRule, $skipSameModTime);

        $entryList = new LexEntryListModel($project);
        $entryList->read();
        $entries = $entryList->entries;
        $index = self::indexByGuid($entries);

        $this->assertEqual($entryList->count, 2);
        $this->assertEqual($index['dd15cbc4-9085-4d66-af3d-8428f078a7da']['lexeme']['th-fonipa']['value'], "chùuchìi mǔu krɔ̀ɔp");
        $this->assertEqual(count($index['dd15cbc4-9085-4d66-af3d-8428f078a7da']['senses']), 1);
        $this->assertEqual($index['dd15cbc4-9085-4d66-af3d-8428f078a7da']['senses'][0]['definition']['en']['value'], "A kind of curry fried with crispy pork");
        $this->assertEqual($index['dd15cbc4-9085-4d66-af3d-8428f078a7da']['senses'][0]['partOfSpeech']['value'], "Noun");
        $this->assertEqual($index['05473cb0-4165-4923-8d81-02f8b8ed3f26']['lexeme']['th-fonipa']['value'], "khâaw kài thɔ̂ɔt");
        $this->assertFalse($importer->getReport()->hasError());
    }

    public function testLiftImportMerge_ExistingDataAndImportWinsAndSkip_NoMerge()
    {
        // create existing data
        $liftFilePath = $this->environ->createTestLiftFile(self::liftTwoEntriesV0_13, 'TwoEntriesV0_13.lift');
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        LiftImport::get()->merge($liftFilePath, $project);

        $liftFilePath = $this->environ->createTestLiftFile(self::liftTwoEntriesCorrectedV0_13, 'TwoEntriesCorrectedV0_13.lift');
        $mergeRule = LiftMergeRule::IMPORT_WINS;
        $skipSameModTime = true;

        $importer = LiftImport::get()->merge($liftFilePath, $project, $mergeRule, $skipSameModTime);

        $entryList = new LexEntryListModel($project);
        $entryList->read();
        $entries = $entryList->entries;
        $index = self::indexByGuid($entries);
        $entry0 = $index['dd15cbc4-9085-4d66-af3d-8428f078a7da'];
        $entry1 = $index['05473cb0-4165-4923-8d81-02f8b8ed3f26'];

        $this->assertEqual($entryList->count, 2);
        $this->assertEqual($entry0['guid'], "dd15cbc4-9085-4d66-af3d-8428f078a7da");
        $this->assertEqual($entry0['lexeme']['th-fonipa']['value'], "chùuchìi mǔu krɔ̂ɔp");
        $this->assertEqual(count($entry0['senses']), 1);
        $this->assertEqual($entry0['senses'][0]['definition']['en']['value'], "incorrect definition");
        $this->assertEqual($entry0['senses'][0]['partOfSpeech']['value'], "Adjective");
        $this->assertEqual($entry1['guid'], "05473cb0-4165-4923-8d81-02f8b8ed3f26");
        $this->assertEqual($entry1['lexeme']['th-fonipa']['value'], "khâaw kài thɔ̀ɔt");
        $this->assertFalse($importer->getReport()->hasError());
    }

    // has correct th-fonipa form in each entry and mod date changed
    // has correct sense in first entry (different id)
    const liftTwoEntriesModifiedV0_13 = <<<EOD
<?xml version="1.0" encoding="utf-8"?>
<lift
	version="0.13"
	producer="WeSay 1.0.0.0">
	<entry
		id="chùuchìi mǔu rɔ̂ɔp_dd15cbc4-9085-4d66-af3d-8428f078a7da"
		dateCreated="2008-11-03T06:17:24Z"
		dateModified="2013-10-26T01:41:19Z"
		guid="dd15cbc4-9085-4d66-af3d-8428f078a7da">
		<lexical-unit>
			<form
				lang="th-fonipa">
				<text>chùuchìi mǔu krɔ̀ɔp</text>
			</form>
			<form
				lang="th">
				<text>ฉู่ฉี่หมูกรอบ</text>
			</form>
		</lexical-unit>
		<sense
			id="df801833-d55b-4492-b501-650da7bc7b73">
			<grammatical-info
				value="Noun" />
			<definition>
				<form
					lang="en">
					<text>A kind of curry fried with crispy pork</text>
				</form>
			</definition>
		</sense>
	</entry>
	<entry
		id="Id'dPrematurely_05473cb0-4165-4923-8d81-02f8b8ed3f26"
		dateCreated="2008-10-09T02:15:23Z"
		dateModified="2013-10-17T06:16:11Z"
		guid="05473cb0-4165-4923-8d81-02f8b8ed3f26">
		<lexical-unit>
			<form
				lang="th-fonipa">
				<text>khâaw kài thɔ̂ɔt</text>
			</form>
			<form
				lang="th">
				<text>ข้าวไก่ทอด</text>
			</form>
		</lexical-unit>
	</entry>
</lift>
EOD;

    public function testLiftImportMerge_ExistingDataAndImportWinsAndSkip_MergeOk()
    {
        // create existing data
        $liftFilePath = $this->environ->createTestLiftFile(self::liftTwoEntriesV0_13, 'TwoEntriesV0_13.lift');
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        LiftImport::get()->merge($liftFilePath, $project);

        $liftFilePath = $this->environ->createTestLiftFile(self::liftTwoEntriesModifiedV0_13, 'TwoEntriesModifiedV0_13.lift');
        $mergeRule = LiftMergeRule::IMPORT_WINS;
        $skipSameModTime = true;

        $importer = LiftImport::get()->merge($liftFilePath, $project, $mergeRule, $skipSameModTime);

        $entryList = new LexEntryListModel($project);
        $entryList->read();
        $entries = $entryList->entries;
        $index = self::indexByGuid($entries);
        $entry0 = $index['dd15cbc4-9085-4d66-af3d-8428f078a7da'];
        $entry1 = $index['05473cb0-4165-4923-8d81-02f8b8ed3f26'];

        $this->assertEqual($entryList->count, 2);
        $this->assertEqual($entry0['guid'], "dd15cbc4-9085-4d66-af3d-8428f078a7da");
        $this->assertEqual($entry0['lexeme']['th-fonipa']['value'], "chùuchìi mǔu krɔ̀ɔp");
        $this->assertEqual(count($entry0['senses']), 2);
        $this->assertEqual($entry0['senses'][0]['definition']['en']['value'], "incorrect definition");
        $this->assertEqual($entry0['senses'][0]['partOfSpeech']['value'], "Adjective");
        $this->assertEqual($entry0['senses'][1]['definition']['en']['value'], "A kind of curry fried with crispy pork");
        $this->assertEqual($entry0['senses'][1]['partOfSpeech']['value'], "Noun");
        $this->assertEqual($entry1['guid'], "05473cb0-4165-4923-8d81-02f8b8ed3f26");
        $this->assertEqual($entry1['lexeme']['th-fonipa']['value'], "khâaw kài thɔ̂ɔt");
        $this->assertFalse($importer->getReport()->hasError());
    }

    // has co$importer->getReport()->hasError()m in first entry
    // has deleted second entry (same guid)
    const liftTwoEntriesOneCorrectedOneDeletedV0_13 = <<<EOD
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
				<text>chùuchìi mǔu krɔ̀ɔp</text>
			</form>
			<form
				lang="th">
				<text>ฉู่ฉี่หมูกรอบ</text>
			</form>
		</lexical-unit>
		<sense
			id="9d50e072-0206-4776-9ee6-bddf89b96aed">
			<grammatical-info
				value="Noun" />
			<definition>
				<form
					lang="en">
					<text>A kind of curry fried with crispy pork</text>
				</form>
			</definition>
		</sense>
	</entry>
	<entry
		id="Id'dPrematurely_05473cb0-4165-4923-8d81-02f8b8ed3f26"
		dateCreated="2008-10-09T02:15:23Z"
		dateModified="2008-10-17T06:16:11Z"
		guid="05473cb0-4165-4923-8d81-02f8b8ed3f26"
		dateDeleted="2013-11-03T06:11:39Z" />
</lift>
EOD;

    public function testLiftImportMerge_ExistingDataAndImportWinsAndDeleteMatchingEntry_EntryDeleted()
    {
        // create existing data
        $liftFilePath = $this->environ->createTestLiftFile(self::liftTwoEntriesV0_13, 'TwoEntriesV0_13.lift');
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        LiftImport::get()->merge($liftFilePath, $project);

        $liftFilePath = $this->environ->createTestLiftFile(self::liftTwoEntriesOneCorrectedOneDeletedV0_13, 'TwoEntriesOneCorrectedOneDeletedV0_13.lift');
        $mergeRule = LiftMergeRule::IMPORT_WINS;
        $skipSameModTime = false;
        $deleteMatchingEntry = true;

        $importer = LiftImport::get()->merge($liftFilePath, $project, $mergeRule, $skipSameModTime, $deleteMatchingEntry);

        $entryList = new LexEntryListModel($project);
        $entryList->read();
        $entries = $entryList->entries;
        $index = self::indexByGuid($entries);
        $entry0 = $index['dd15cbc4-9085-4d66-af3d-8428f078a7da'];

        $this->assertEqual($entryList->count, 1);
        $this->assertEqual($entry0['guid'], "dd15cbc4-9085-4d66-af3d-8428f078a7da");
        $this->assertEqual($entry0['lexeme']['th-fonipa']['value'], "chùuchìi mǔu krɔ̀ɔp");
        $this->assertFalse($importer->getReport()->hasError());
    }

    public function testLiftImportMerge_ExistingDataAndImportWinsAndSkipSameModTimeAndDeleteMatchingEntry_EntryDeletedAndOtherEntryNotCorrected()
    {
        // create existing data
        $liftFilePath = $this->environ->createTestLiftFile(self::liftTwoEntriesV0_13, 'TwoEntriesV0_13.lift');
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        LiftImport::get()->merge($liftFilePath, $project);

        $liftFilePath = $this->environ->createTestLiftFile(self::liftTwoEntriesOneCorrectedOneDeletedV0_13, 'TwoEntriesOneCorrectedOneDeletedV0_13.lift');
        $mergeRule = LiftMergeRule::IMPORT_WINS;
        $skipSameModTime = true;
        $deleteMatchingEntry = true;

        $importer = LiftImport::get()->merge($liftFilePath, $project, $mergeRule, $skipSameModTime, $deleteMatchingEntry);

        $entryList = new LexEntryListModel($project);
        $entryList->read();
        $entries = $entryList->entries;
        $index = self::indexByGuid($entries);
        $entry0 = $index['dd15cbc4-9085-4d66-af3d-8428f078a7da'];

        $this->assertEqual($entryList->count, 1);
        $this->assertEqual($entry0['guid'], "dd15cbc4-9085-4d66-af3d-8428f078a7da");
        $this->assertEqual($entry0['lexeme']['th-fonipa']['value'], "chùuchìi mǔu krɔ̂ɔp");
        $this->assertFalse($importer->getReport()->hasError());
    }

    public function testLiftImportMerge_ExistingDataAndImportWins_EntryNotDeleted()
    {
        // create existing data
        $liftFilePath = $this->environ->createTestLiftFile(self::liftTwoEntriesV0_13, 'TwoEntriesV0_13.lift');
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        LiftImport::get()->merge($liftFilePath, $project);

        $liftFilePath = $this->environ->createTestLiftFile(self::liftTwoEntriesOneCorrectedOneDeletedV0_13, 'TwoEntriesOneCorrectedOneDeletedV0_13.lift');
        $mergeRule = LiftMergeRule::IMPORT_WINS;
        $skipSameModTime = false;
        $deleteMatchingEntry = false;

        $importer = LiftImport::get()->merge($liftFilePath, $project, $mergeRule, $skipSameModTime, $deleteMatchingEntry);

        $entryList = new LexEntryListModel($project);
        $entryList->read();
        $entries = $entryList->entries;
        $index = self::indexByGuid($entries);
        $entry0 = $index['dd15cbc4-9085-4d66-af3d-8428f078a7da'];
        $entry1 = $index['05473cb0-4165-4923-8d81-02f8b8ed3f26'];

        $this->assertEqual($entryList->count, 2);
        $this->assertEqual($entry0['lexeme']['th-fonipa']['value'], "chùuchìi mǔu krɔ̀ɔp");
        $this->assertEqual($entry1['lexeme']['th-fonipa']['value'], "khâaw kài thɔ̀ɔt");
        $this->assertFalse($importer->getReport()->hasError());
    }

    public function testLiftImportMerge_NoExistingDataAndImportLoses_MergeOk()
    {
        $liftFilePath = $this->environ->createTestLiftFile(self::liftTwoEntriesCorrectedV0_13, 'TwoEntriesCorrectedV0_13.lift');
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $mergeRule = LiftMergeRule::IMPORT_LOSES;
        $skipSameModTime = false;

        $importer = LiftImport::get()->merge($liftFilePath, $project, $mergeRule, $skipSameModTime);

        $entryList = new LexEntryListModel($project);
        $entryList->read();
        $entries = $entryList->entries;
        $index = self::indexByGuid($entries);
        $entry0 = $index['dd15cbc4-9085-4d66-af3d-8428f078a7da'];
        $entry1 = $index['05473cb0-4165-4923-8d81-02f8b8ed3f26'];

        $this->assertEqual($entryList->count, 2);
        $this->assertEqual($entry0['guid'], "dd15cbc4-9085-4d66-af3d-8428f078a7da");
        $this->assertEqual($entry0['lexeme']['th-fonipa']['value'], "chùuchìi mǔu krɔ̀ɔp");
        $this->assertEqual(count($entry0['senses']), 1);
        $this->assertEqual($entry0['senses'][0]['definition']['en']['value'], "A kind of curry fried with crispy pork");
        $this->assertEqual($entry0['senses'][0]['partOfSpeech']['value'], "Noun");
        $this->assertEqual($entry1['guid'], "05473cb0-4165-4923-8d81-02f8b8ed3f26");
        $this->assertEqual($entry1['lexeme']['th-fonipa']['value'], "khâaw kài thɔ̂ɔt");
        $this->assertFalse($importer->getReport()->hasError());
    }

    public function testLiftImportMerge_ExistingDataAndImportLoses_NoMerge()
    {
        // create existing data
        $liftFilePath = $this->environ->createTestLiftFile(self::liftTwoEntriesV0_13, 'TwoEntriesV0_13.lift');
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        LiftImport::get()->merge($liftFilePath, $project);

        $liftFilePath = $this->environ->createTestLiftFile(self::liftTwoEntriesCorrectedV0_13, 'TwoEntriesCorrectedV0_13.lift');
        $mergeRule = LiftMergeRule::IMPORT_LOSES;
        $skipSameModTime = false;

        $importer = LiftImport::get()->merge($liftFilePath, $project, $mergeRule, $skipSameModTime);

        $entryList = new LexEntryListModel($project);
        $entryList->read();
        $entries = $entryList->entries;
        $index = self::indexByGuid($entries);
        $entry0 = $index['dd15cbc4-9085-4d66-af3d-8428f078a7da'];
        $entry1 = $index['05473cb0-4165-4923-8d81-02f8b8ed3f26'];

        $this->assertEqual($entryList->count, 2);
        $this->assertEqual($entry0['guid'], "dd15cbc4-9085-4d66-af3d-8428f078a7da");
        $this->assertEqual($entry0['lexeme']['th-fonipa']['value'], "chùuchìi mǔu krɔ̂ɔp");
        $this->assertEqual(count($entry0['senses']), 1);
        $this->assertEqual($entry0['senses'][0]['definition']['en']['value'], "incorrect definition");
        $this->assertEqual($entry0['senses'][0]['partOfSpeech']['value'], "Adjective");
        $this->assertEqual($entry1['guid'], "05473cb0-4165-4923-8d81-02f8b8ed3f26");
        $this->assertEqual($entry1['lexeme']['th-fonipa']['value'], "khâaw kài thɔ̀ɔt");
        $this->assertFalse($importer->getReport()->hasError());
    }

    public function testLiftImportMerge_NoExistingDataAndCreateDuplicates_MergeOk()
    {
        $liftFilePath = $this->environ->createTestLiftFile(self::liftTwoEntriesCorrectedV0_13, 'TwoEntriesCorrectedV0_13.lift');
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $mergeRule = LiftMergeRule::CREATE_DUPLICATES;
        $skipSameModTime = false;

        $importer = LiftImport::get()->merge($liftFilePath, $project, $mergeRule, $skipSameModTime);

        $entryList = new LexEntryListModel($project);
        $entryList->read();
        $entries = $entryList->entries;
        $index = self::indexByGuid($entries);
        $entry0 = $index['dd15cbc4-9085-4d66-af3d-8428f078a7da'];
        $entry1 = $index['05473cb0-4165-4923-8d81-02f8b8ed3f26'];

        $this->assertEqual($entryList->count, 2);
        $this->assertEqual($entry0['guid'], "dd15cbc4-9085-4d66-af3d-8428f078a7da");
        $this->assertEqual($entry0['lexeme']['th-fonipa']['value'], "chùuchìi mǔu krɔ̀ɔp");
        $this->assertEqual(count($entry0['senses']), 1);
        $this->assertEqual($entry0['senses'][0]['definition']['en']['value'], "A kind of curry fried with crispy pork");
        $this->assertEqual($entry0['senses'][0]['partOfSpeech']['value'], "Noun");
        $this->assertEqual($entry1['guid'], "05473cb0-4165-4923-8d81-02f8b8ed3f26");
        $this->assertEqual($entry1['lexeme']['th-fonipa']['value'], "khâaw kài thɔ̂ɔt");
        $this->assertFalse($importer->getReport()->hasError());
    }

    public function testLiftImportMerge_ExistingDataAndCreateDuplicates_DuplicatesCreated()
    {
        // create existing data
        $liftFilePath = $this->environ->createTestLiftFile(self::liftTwoEntriesV0_13, 'TwoEntriesV0_13.lift');
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        LiftImport::get()->merge($liftFilePath, $project);

        $liftFilePath = $this->environ->createTestLiftFile(self::liftTwoEntriesCorrectedV0_13, 'TwoEntriesCorrectedV0_13.lift');
        $mergeRule = LiftMergeRule::CREATE_DUPLICATES;
        $skipSameModTime = false;

        $importer = LiftImport::get()->merge($liftFilePath, $project, $mergeRule, $skipSameModTime);

        $entryList = new LexEntryListModel($project);
        $entryList->read();
        $entries = $entryList->entries;
        $index = self::indexByGuid($entries);
        $entry0 = $index['dd15cbc4-9085-4d66-af3d-8428f078a7da'];
        $entry1 = $index['05473cb0-4165-4923-8d81-02f8b8ed3f26'];

        $this->assertEqual($entryList->count, 4);
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
        $this->assertFalse($importer->getReport()->hasError());
    }

    public function testLiftImportMerge_ExistingDataAndCreateDuplicatesAndSkip_NoMerge()
    {
        // create existing data
        $liftFilePath = $this->environ->createTestLiftFile(self::liftTwoEntriesV0_13, 'TwoEntriesV0_13.lift');
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        LiftImport::get()->merge($liftFilePath, $project);

        $liftFilePath = $this->environ->createTestLiftFile(self::liftTwoEntriesCorrectedV0_13, 'TwoEntriesCorrectedV0_13.lift');
        $mergeRule = LiftMergeRule::CREATE_DUPLICATES;
        $skipSameModTime = true;

        $importer = LiftImport::get()->merge($liftFilePath, $project, $mergeRule, $skipSameModTime);

        $entryList = new LexEntryListModel($project);
        $entryList->read();
        $entries = $entryList->entries;
        $index = self::indexByGuid($entries);
        $entry0 = $index['dd15cbc4-9085-4d66-af3d-8428f078a7da'];
        $entry1 = $index['05473cb0-4165-4923-8d81-02f8b8ed3f26'];

        $this->assertEqual($entryList->count, 2);
        $this->assertEqual($entry0['guid'], "dd15cbc4-9085-4d66-af3d-8428f078a7da");
        $this->assertEqual($entry0['lexeme']['th-fonipa']['value'], "chùuchìi mǔu krɔ̂ɔp");
        $this->assertEqual(count($entry0['senses']), 1);
        $this->assertEqual($entry0['senses'][0]['definition']['en']['value'], "incorrect definition");
        $this->assertEqual($entry0['senses'][0]['partOfSpeech']['value'], "Adjective");
        $this->assertEqual($entry1['guid'], "05473cb0-4165-4923-8d81-02f8b8ed3f26");
        $this->assertEqual($entry1['lexeme']['th-fonipa']['value'], "khâaw kài thɔ̀ɔt");
        $this->assertFalse($importer->getReport()->hasError());
    }

    // has <span> in sense of first entry
    const liftTwoEntriesWithSpanV0_13 = <<<EOD
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
				<text>chùuchìi mǔu krɔ̀ɔp</text>
			</form>
			<form
				lang="th">
				<text>ฉู่ฉี่หมูกรอบ</text>
			</form>
		</lexical-unit>
		<sense
			id="9d50e072-0206-4776-9ee6-bddf89b96aed">
			<grammatical-info
				value="Noun" />
			<definition>
				<form
					lang="en">
					<text><span lang="th">ฉู่ฉี่หมูกรอบ</span> is a kind of curry fried with crispy pork</text>
				</form>
			</definition>
		</sense>
	</entry>
	<entry
		id="Id'dPrematurely_05473cb0-4165-4923-8d81-02f8b8ed3f26"
		dateCreated="2008-10-09T02:15:23Z"
		dateModified="2008-10-17T06:16:11Z"
		guid="05473cb0-4165-4923-8d81-02f8b8ed3f26">
		<lexical-unit>
			<form
				lang="th-fonipa">
				<text>khâaw kài thɔ̂ɔt</text>
			</form>
			<form
				lang="th">
				<text>ข้าวไก่ทอด</text>
			</form>
		</lexical-unit>
	</entry>
</lift>
EOD;

    public function testLiftImportMerge_SpanInDefinition_MergeIncludesSpan()
    {
        $liftFilePath = $this->environ->createTestLiftFile(self::liftTwoEntriesWithSpanV0_13, 'TwoEntriesWithSpanV0_13.lift');
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $mergeRule = LiftMergeRule::IMPORT_WINS;
        $skipSameModTime = false;

        $importer = LiftImport::get()->merge($liftFilePath, $project, $mergeRule, $skipSameModTime);

        $entryList = new LexEntryListModel($project);
        $entryList->read();
        $entries = $entryList->entries;
        $index = self::indexByGuid($entries);
        $entry0 = $index['dd15cbc4-9085-4d66-af3d-8428f078a7da'];
        $entry1 = $index['05473cb0-4165-4923-8d81-02f8b8ed3f26'];

        $this->assertEqual($entryList->count, 2);
        $this->assertEqual($entry0['guid'], "dd15cbc4-9085-4d66-af3d-8428f078a7da");
        $this->assertEqual($entry0['lexeme']['th-fonipa']['value'], "chùuchìi mǔu krɔ̀ɔp");
        $this->assertEqual($entry0['lexeme']['th']['value'], "ฉู่ฉี่หมูกรอบ");
        $this->assertEqual(count($entry0['senses']), 1);
        $this->assertEqual($entry0['senses'][0]['definition']['en']['value'], '<span lang="th">ฉู่ฉี่หมูกรอบ</span> is a kind of curry fried with crispy pork');
        $this->assertEqual($entry0['senses'][0]['partOfSpeech']['value'], "Noun");
        $this->assertEqual($entry1['guid'], "05473cb0-4165-4923-8d81-02f8b8ed3f26");
        $this->assertEqual($entry1['lexeme']['th-fonipa']['value'], "khâaw kài thɔ̂ɔt");
        $this->assertEqual($entry1['lexeme']['th']['value'], "ข้าวไก่ทอด");
        $this->assertFalse($importer->getReport()->hasError());
    }

    const liftNotesWithoutSpansV0_13 = <<<EOD
<?xml version="1.0" encoding="utf-8"?>
<lift
	version="0.13"
	producer="Palaso.DictionaryServices.LiftWriter 2.1.27.0">
	<entry
		id="brown bear_57a90e40-fdb4-47f8-89a0-c64bf947723d"
		dateCreated="2014-07-03T09:22:35Z"
		dateModified="2014-09-26T03:23:24Z"
		guid="57a90e40-fdb4-47f8-89a0-c64bf947723d">
		<lexical-unit>
			<form
				lang="qaa-x-qaa">
				<text>brown bear</text>
			</form>
		</lexical-unit>
		<sense
			id="7e6786c1-2c4c-44aa-8358-150636eac292">
			<trait
				name="semantic-domain-ddp4"
				value="1.6.1.1.2 Carnivore" />
		</sense>
		<note>
			<form
				lang="en">
				<text>This is not a black bear.</text>
			</form>
		</note>
	</entry>
	<entry
		id="black bear_8db0bd91-9120-4417-b6ff-d0bb35f552fc"
		dateCreated="2014-07-03T09:22:37Z"
		dateModified="2014-09-26T03:23:18Z"
		guid="8db0bd91-9120-4417-b6ff-d0bb35f552fc">
		<lexical-unit>
			<form
				lang="qaa-x-qaa">
				<text>black bear</text>
			</form>
		</lexical-unit>
		<sense
			id="7d8dc539-d623-499b-90e1-5fafcf5d48bd">
			<trait
				name="semantic-domain-ddp4"
				value="1.6.1.1.2 Carnivore" />
		</sense>
		<note>
			<form
				lang="en">
				<text>This is not a brown bear.</text>
			</form>
		</note>
	</entry>
</lift>
EOD;

    public function testLiftImportMerge_NoSpanInNoteFields_MergeOk()
    {
        $liftFilePath = $this->environ->createTestLiftFile(self::liftNotesWithoutSpansV0_13, 'NotesWithoutSpansV0_13.lift');
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $mergeRule = LiftMergeRule::IMPORT_WINS;
        $skipSameModTime = false;

        $importer = LiftImport::get()->merge($liftFilePath, $project, $mergeRule, $skipSameModTime);

        $entryList = new LexEntryListModel($project);
        $entryList->read();
        $entries = $entryList->entries;
        $index = self::indexByGuid($entries);
        $entry0 = $index['57a90e40-fdb4-47f8-89a0-c64bf947723d'];
        $entry1 = $index['8db0bd91-9120-4417-b6ff-d0bb35f552fc'];

        $this->assertEqual($entryList->count, 2);
        $this->assertEqual($entry0['guid'], "57a90e40-fdb4-47f8-89a0-c64bf947723d");
        $this->assertEqual($entry0['lexeme']['qaa-x-qaa']['value'], "brown bear");
        $this->assertEqual($entry0['note']['en']['value'], "This is not a black bear.");
        $this->assertEqual($entry1['guid'], "8db0bd91-9120-4417-b6ff-d0bb35f552fc");
        $this->assertEqual($entry1['lexeme']['qaa-x-qaa']['value'], "black bear");
        $this->assertEqual($entry1['note']['en']['value'], "This is not a brown bear.");
        $this->assertFalse($importer->getReport()->hasError());
    }

    const liftNotesWithSpansV0_13 = <<<EOD
<?xml version="1.0" encoding="utf-8"?>
<lift
	version="0.13"
	producer="Palaso.DictionaryServices.LiftWriter 2.1.27.0">
	<entry
		id="brown bear_57a90e40-fdb4-47f8-89a0-c64bf947723d"
		dateCreated="2014-07-03T09:22:35Z"
		dateModified="2014-09-26T03:23:24Z"
		guid="57a90e40-fdb4-47f8-89a0-c64bf947723d">
		<lexical-unit>
			<form
				lang="qaa-x-qaa">
				<text>brown bear</text>
			</form>
		</lexical-unit>
		<sense
			id="7e6786c1-2c4c-44aa-8358-150636eac292">
			<trait
				name="semantic-domain-ddp4"
				value="1.6.1.1.2 Carnivore" />
		</sense>
		<note>
			<form
				lang="en">
				<text>This is not a black bear, and <span lang="fr">ceci n'est pas une pipe</span>.</text>
			</form>
			<form
				lang="fr">
				<text>ceci n'est pas une pipe; <span lang="en">This is <b>not</b> a black bear</span>.</text>
			</form>
		</note>
	</entry>
	<entry
		id="black bear_8db0bd91-9120-4417-b6ff-d0bb35f552fc"
		dateCreated="2014-07-03T09:22:37Z"
		dateModified="2014-09-26T03:23:18Z"
		guid="8db0bd91-9120-4417-b6ff-d0bb35f552fc">
		<lexical-unit>
			<form
				lang="qaa-x-qaa">
				<text>black bear</text>
			</form>
		</lexical-unit>
		<sense
			id="7d8dc539-d623-499b-90e1-5fafcf5d48bd">
			<trait
				name="semantic-domain-ddp4"
				value="1.6.1.1.2 Carnivore" />
		</sense>
		<note>
			<form
				lang="en">
				<text>This is not a brown bear.</text>
			</form>
		</note>
	</entry>
</lift>
EOD;

    public function testLiftImportMerge_SpanInNoteFields_MergeIncludesSpan()
    {
        $liftFilePath = $this->environ->createTestLiftFile(self::liftNotesWithSpansV0_13, 'NotesWithSpansV0_13.lift');
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $mergeRule = LiftMergeRule::IMPORT_WINS;
        $skipSameModTime = false;

        $importer = LiftImport::get()->merge($liftFilePath, $project, $mergeRule, $skipSameModTime);

        $entryList = new LexEntryListModel($project);
        $entryList->read();
        $entries = $entryList->entries;
        $index = self::indexByGuid($entries);
        $entry0 = $index['57a90e40-fdb4-47f8-89a0-c64bf947723d'];
        $entry1 = $index['8db0bd91-9120-4417-b6ff-d0bb35f552fc'];

        $this->assertEqual($entryList->count, 2);
        $this->assertEqual($entry0['guid'], "57a90e40-fdb4-47f8-89a0-c64bf947723d");
        $this->assertEqual($entry0['lexeme']['qaa-x-qaa']['value'], "brown bear");
        $this->assertEqual($entry0['note']['en']['value'], 'This is not a black bear, and <span lang="fr">ceci n\'est pas une pipe</span>.');
        $this->assertEqual($entry1['guid'], "8db0bd91-9120-4417-b6ff-d0bb35f552fc");
        $this->assertEqual($entry1['lexeme']['qaa-x-qaa']['value'], "black bear");
        $this->assertEqual($entry1['note']['en']['value'], "This is not a brown bear.");
        $this->assertFalse($importer->getReport()->hasError());
    }

    // has correct th-fonipa form in each entry
    // has correct sense in first entry (same id)
    // has rubbish (fake) tag inside Example
    const liftTwoEntriesCorrectedExampleRubbishTagV0_13 = <<<EOD
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
				<text>chùuchìi mǔu krɔ̀ɔp</text>
			</form>
			<form
				lang="th">
				<text>ฉู่ฉี่หมูกรอบ</text>
			</form>
		</lexical-unit>
		<sense
			id="9d50e072-0206-4776-9ee6-bddf89b96aed">
			<grammatical-info
				value="Noun" />
			<definition>
				<form
					lang="en">
					<text>A kind of curry fried with crispy pork</text>
				</form>
			</definition>
			<example>
				<form
					lang="th-fonipa">
					<text>sentence 1</text>
				</form>
				<rubbish>
				</rubbish>
				<translation>
					<form
						lang="en">
						<text>translation 1</text>
					</form>
				</translation>
			</example>
		</sense>
	</entry>
	<entry
		id="Id'dPrematurely_05473cb0-4165-4923-8d81-02f8b8ed3f26"
		dateCreated="2008-10-09T02:15:23Z"
		dateModified="2008-10-17T06:16:11Z"
		guid="05473cb0-4165-4923-8d81-02f8b8ed3f26">
		<lexical-unit>
			<form
				lang="th-fonipa">
				<text>khâaw kài thɔ̂ɔt</text>
			</form>
			<form
				lang="th">
				<text>ข้าวไก่ทอด</text>
			</form>
		</lexical-unit>
		<sense
			id="f60ba047-df0c-47cc-aba1-af4ea1030e31">
			<definition>
				<form
					lang="en">
					<text>pieces of fried chicken served over rice, usually with a sweet and spicy sauce on the side</text>
				</form>
			</definition>
			<example>
				<form
					lang="th-fonipa">
					<text>sentence 2</text>
				</form>
				<translation>
					<form
						lang="en">
						<text>translation 2</text>
					</form>
				</translation>
			</example>
		</sense>
	</entry>
</lift>
EOD;

    public function testLiftImportMerge_ExampleRubbishTag_ReportOk()
    {
        $liftFilePath = $this->environ->createTestLiftFile(self::liftTwoEntriesCorrectedExampleRubbishTagV0_13, 'TwoEntriesCorrectedExampleRubbishTagV0_13.lift');
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $mergeRule = LiftMergeRule::IMPORT_WINS;
        $skipSameModTime = false;

        $importer = LiftImport::get()->merge($liftFilePath, $project, $mergeRule, $skipSameModTime);

        $entryList = new LexEntryListModel($project);
        $entryList->read();
        $entries = $entryList->entries;
        $index = self::indexByGuid($entries);
        $report = $importer->getReport();

        $this->assertEqual(2, $entryList->count);
        $this->assertEqual("chùuchìi mǔu krɔ̀ɔp", $index['dd15cbc4-9085-4d66-af3d-8428f078a7da']['lexeme']['th-fonipa']['value']);
        $this->assertEqual(1, count($index['dd15cbc4-9085-4d66-af3d-8428f078a7da']['senses']));
        $this->assertEqual("A kind of curry fried with crispy pork", $index['dd15cbc4-9085-4d66-af3d-8428f078a7da']['senses'][0]['definition']['en']['value']);
        $this->assertEqual("Noun", $index['dd15cbc4-9085-4d66-af3d-8428f078a7da']['senses'][0]['partOfSpeech']['value']);
        $this->assertEqual("khâaw kài thɔ̂ɔt", $index['05473cb0-4165-4923-8d81-02f8b8ed3f26']['lexeme']['th-fonipa']['value']);
        $this->assertEqual(2, count($report->nodeErrors));
        $this->assertTrue($report->nodeErrors[0]->currentSubnodeError()->currentSubnodeError()->hasError());
        $this->assertPattern("/unhandled element 'rubbish'/", $report->nodeErrors[0]->currentSubnodeError()->currentSubnodeError()->toString());
        $this->assertFalse($report->nodeErrors[1]->hasError());
    }
}
