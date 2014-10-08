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
        LiftImport::merge($liftXml, $project);
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
        LiftImport::merge($liftXml, $project);
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

        LiftImport::merge($liftFilePath, $project, $mergeRule, $skipSameModTime);

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
        LiftImport::merge($liftFilePath, $project);

        $liftFilePath = $this->environ->createTestLiftFile(self::liftTwoEntriesCorrectedV0_13, 'TwoEntriesCorrectedV0_13.lift');
        $mergeRule = LiftMergeRule::IMPORT_WINS;
        $skipSameModTime = false;

        LiftImport::merge($liftFilePath, $project, $mergeRule, $skipSameModTime);

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
        // create existing data
        $liftFilePath = $this->environ->createTestLiftFile(self::liftTwoEntriesV0_13, 'TwoEntriesV0_13.lift');
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        LiftImport::merge($liftFilePath, $project);

        $liftFilePath = $this->environ->createTestLiftFile(self::liftTwoEntriesCorrectedV0_13, 'TwoEntriesCorrectedV0_13.lift');
        $mergeRule = LiftMergeRule::IMPORT_WINS;
        $skipSameModTime = true;

        LiftImport::merge($liftFilePath, $project, $mergeRule, $skipSameModTime);

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
        LiftImport::merge($liftFilePath, $project);

        $liftFilePath = $this->environ->createTestLiftFile(self::liftTwoEntriesModifiedV0_13, 'TwoEntriesModifiedV0_13.lift');
        $mergeRule = LiftMergeRule::IMPORT_WINS;
        $skipSameModTime = true;

        LiftImport::merge($liftFilePath, $project, $mergeRule, $skipSameModTime);

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

    // has correct th-fonipa form in first entry
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
        LiftImport::merge($liftFilePath, $project);

        $liftFilePath = $this->environ->createTestLiftFile(self::liftTwoEntriesOneCorrectedOneDeletedV0_13, 'TwoEntriesOneCorrectedOneDeletedV0_13.lift');
        $mergeRule = LiftMergeRule::IMPORT_WINS;
        $skipSameModTime = false;
        $deleteMatchingEntry = true;

        LiftImport::merge($liftFilePath, $project, $mergeRule, $skipSameModTime, $deleteMatchingEntry);

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
        // create existing data
        $liftFilePath = $this->environ->createTestLiftFile(self::liftTwoEntriesV0_13, 'TwoEntriesV0_13.lift');
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        LiftImport::merge($liftFilePath, $project);

        $liftFilePath = $this->environ->createTestLiftFile(self::liftTwoEntriesOneCorrectedOneDeletedV0_13, 'TwoEntriesOneCorrectedOneDeletedV0_13.lift');
        $mergeRule = LiftMergeRule::IMPORT_WINS;
        $skipSameModTime = true;
        $deleteMatchingEntry = true;

        LiftImport::merge($liftFilePath, $project, $mergeRule, $skipSameModTime, $deleteMatchingEntry);

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
        // create existing data
        $liftFilePath = $this->environ->createTestLiftFile(self::liftTwoEntriesV0_13, 'TwoEntriesV0_13.lift');
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        LiftImport::merge($liftFilePath, $project);

        $liftFilePath = $this->environ->createTestLiftFile(self::liftTwoEntriesOneCorrectedOneDeletedV0_13, 'TwoEntriesOneCorrectedOneDeletedV0_13.lift');
        $mergeRule = LiftMergeRule::IMPORT_WINS;
        $skipSameModTime = false;
        $deleteMatchingEntry = false;

        LiftImport::merge($liftFilePath, $project, $mergeRule, $skipSameModTime, $deleteMatchingEntry);

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

    public function testLiftImportMerge_NoExistingDataAndImportLoses_MergeOk()
    {
        $liftFilePath = $this->environ->createTestLiftFile(self::liftTwoEntriesCorrectedV0_13, 'TwoEntriesCorrectedV0_13.lift');
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $mergeRule = LiftMergeRule::IMPORT_LOSES;
        $skipSameModTime = false;

        LiftImport::merge($liftFilePath, $project, $mergeRule, $skipSameModTime);

        $entryList = new LexEntryListModel($project);
        $entryList->read();
        $entries = $entryList->entries;
        $this->assertEqual($entryList->count, 2);
        $index = self::indexByGuid($entries);
        $entry0 = $index['dd15cbc4-9085-4d66-af3d-8428f078a7da'];
        $entry1 = $index['05473cb0-4165-4923-8d81-02f8b8ed3f26'];
        $this->assertEqual($entry0['guid'], "dd15cbc4-9085-4d66-af3d-8428f078a7da");
        $this->assertEqual($entry0['lexeme']['th-fonipa']['value'], "chùuchìi mǔu krɔ̀ɔp");
        $this->assertEqual(count($entry0['senses']), 1);
        $this->assertEqual($entry0['senses'][0]['definition']['en']['value'], "A kind of curry fried with crispy pork");
        $this->assertEqual($entry0['senses'][0]['partOfSpeech']['value'], "Noun");
        $this->assertEqual($entry1['guid'], "05473cb0-4165-4923-8d81-02f8b8ed3f26");
        $this->assertEqual($entry1['lexeme']['th-fonipa']['value'], "khâaw kài thɔ̂ɔt");
    }

    public function testLiftImportMerge_ExistingDataAndImportLoses_NoMerge()
    {
        // create existing data
        $liftFilePath = $this->environ->createTestLiftFile(self::liftTwoEntriesV0_13, 'TwoEntriesV0_13.lift');
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        LiftImport::merge($liftFilePath, $project);

        $liftFilePath = $this->environ->createTestLiftFile(self::liftTwoEntriesCorrectedV0_13, 'TwoEntriesCorrectedV0_13.lift');
        $mergeRule = LiftMergeRule::IMPORT_LOSES;
        $skipSameModTime = false;

        LiftImport::merge($liftFilePath, $project, $mergeRule, $skipSameModTime);

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

    public function testLiftImportMerge_NoExistingDataAndCreateDuplicates_MergeOk()
    {
        $liftFilePath = $this->environ->createTestLiftFile(self::liftTwoEntriesCorrectedV0_13, 'TwoEntriesCorrectedV0_13.lift');
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $mergeRule = LiftMergeRule::CREATE_DUPLICATES;
        $skipSameModTime = false;

        LiftImport::merge($liftFilePath, $project, $mergeRule, $skipSameModTime);

        $entryList = new LexEntryListModel($project);
        $entryList->read();
        $entries = $entryList->entries;
        $this->assertEqual($entryList->count, 2);
        $index = self::indexByGuid($entries);
        $entry0 = $index['dd15cbc4-9085-4d66-af3d-8428f078a7da'];
        $entry1 = $index['05473cb0-4165-4923-8d81-02f8b8ed3f26'];
        $this->assertEqual($entry0['guid'], "dd15cbc4-9085-4d66-af3d-8428f078a7da");
        $this->assertEqual($entry0['lexeme']['th-fonipa']['value'], "chùuchìi mǔu krɔ̀ɔp");
        $this->assertEqual(count($entry0['senses']), 1);
        $this->assertEqual($entry0['senses'][0]['definition']['en']['value'], "A kind of curry fried with crispy pork");
        $this->assertEqual($entry0['senses'][0]['partOfSpeech']['value'], "Noun");
        $this->assertEqual($entry1['guid'], "05473cb0-4165-4923-8d81-02f8b8ed3f26");
        $this->assertEqual($entry1['lexeme']['th-fonipa']['value'], "khâaw kài thɔ̂ɔt");
    }

    public function testLiftImportMerge_ExistingDataAndCreateDuplicates_DuplicatesCreated()
    {
        // create existing data
        $liftFilePath = $this->environ->createTestLiftFile(self::liftTwoEntriesV0_13, 'TwoEntriesV0_13.lift');
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        LiftImport::merge($liftFilePath, $project);

        $liftFilePath = $this->environ->createTestLiftFile(self::liftTwoEntriesCorrectedV0_13, 'TwoEntriesCorrectedV0_13.lift');
        $mergeRule = LiftMergeRule::CREATE_DUPLICATES;
        $skipSameModTime = false;

        LiftImport::merge($liftFilePath, $project, $mergeRule, $skipSameModTime);

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
        // create existing data
        $liftFilePath = $this->environ->createTestLiftFile(self::liftTwoEntriesV0_13, 'TwoEntriesV0_13.lift');
        $project = $this->environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        LiftImport::merge($liftFilePath, $project);

        $liftFilePath = $this->environ->createTestLiftFile(self::liftTwoEntriesCorrectedV0_13, 'TwoEntriesCorrectedV0_13.lift');
        $mergeRule = LiftMergeRule::CREATE_DUPLICATES;
        $skipSameModTime = true;

        LiftImport::merge($liftFilePath, $project, $mergeRule, $skipSameModTime);

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
}
