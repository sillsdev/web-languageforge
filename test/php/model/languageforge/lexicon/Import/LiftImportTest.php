<?php

use Api\Model\Languageforge\Lexicon\Config\LexConfig;
use Api\Model\Languageforge\Lexicon\Guid;
use Api\Model\Languageforge\Lexicon\Import\LiftImport;
use Api\Model\Languageforge\Lexicon\Import\LiftMergeRule;
use Api\Model\Languageforge\Lexicon\LexEntryListModel;
use Api\Model\Languageforge\Lexicon\LexOptionListModel;
use Api\Model\Shared\InputSystem;
use PHPUnit\Framework\TestCase;

class LiftImportTest extends TestCase
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
        self::$environ->cleanupTestUploadFiles();
        self::$environ->clean();
    }

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

    public function testLiftImportMerge_NoExistingData_NoExceptionAndMergeOk()
    {
        $liftFilePath = self::$environ->createTestLiftFile(self::liftTwoEntriesV0_13, 'TwoEntriesV0_13.lift');
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $mergeRule = LiftMergeRule::IMPORT_WINS;
        $skipSameModTime = false;

        $this->assertArrayHasKey('en', $project->inputSystems);
        $this->assertArrayHasKey('th', $project->inputSystems);
        $this->assertArrayNotHasKey('th-fonipa', $project->inputSystems);

        $importer = LiftImport::get()->merge($liftFilePath, $project, $mergeRule, $skipSameModTime);

        $entryList = new LexEntryListModel($project);
        $entryList->read();
        $entries = $entryList->entries;
        $entriesByGuid = self::$environ->indexItemsBy($entries, 'guid');
        $entry0 = $entriesByGuid['dd15cbc4-9085-4d66-af3d-8428f078a7da'];
        $entry1 = $entriesByGuid['05473cb0-4165-4923-8d81-02f8b8ed3f26'];

        $this->assertEquals(2, $entryList->count);
        $this->assertEquals('dd15cbc4-9085-4d66-af3d-8428f078a7da', $entry0['guid']);
        $this->assertEquals('chùuchìi mǔu krɔ̂ɔp', $entry0['lexeme']['th-fonipa']['value']); // NFC
        $this->assertEquals('ฉู่ฉี่หมูกรอบ', $entry0['lexeme']['th']['value']);
        $this->assertCount(1, $entry0['senses']);
        $this->assertEquals('9d50e072-0206-4776-9ee6-bddf89b96aed', $entry0['senses'][0]['guid']);
        $this->assertEquals('incorrect definition', $entry0['senses'][0]['definition']['en']['value']);
        $this->assertEquals('incorrect gloss', $entry0['senses'][0]['gloss']['en']['value']);
        $this->assertEquals('th incorrect gloss', $entry0['senses'][0]['gloss']['th']['value']);
        $this->assertEquals('Adjective', $entry0['senses'][0]['partOfSpeech']['value']);
        $this->assertEquals('5.2', $entry0['senses'][0]['semanticDomain']['values'][0]);
        $this->assertEquals('1', $entry0['senses'][0]['semanticDomain']['values'][1]);
        $this->assertEquals('sentence 1', $entry0['senses'][0]['examples'][0]['sentence']['th-fonipa']['value']);
        $this->assertEquals('translation 1', $entry0['senses'][0]['examples'][0]['translation']['en']['value']);
        $this->assertEquals('sentence 2', $entry0['senses'][0]['examples'][1]['sentence']['th-fonipa']['value']);
        $this->assertEquals('translation 2', $entry0['senses'][0]['examples'][1]['translation']['en']['value']);
        $this->assertEquals('05473cb0-4165-4923-8d81-02f8b8ed3f26', $entry1['guid']);
        $this->assertEquals('khâaw kài thɔ̀ɔt', $entry1['lexeme']['th-fonipa']['value']); // NFC
        $this->assertEquals('ข้าวไก่ทอด', $entry1['lexeme']['th']['value']);
        $this->assertArrayHasKey('th-fonipa', $project->inputSystems);
        $this->assertEquals(false, $importer->getReport()->hasError());
        $this->assertEquals(0, $importer->stats->existingEntries);
        $this->assertEquals(2, $importer->stats->importEntries);
        $this->assertEquals(2, $importer->stats->newEntries);
        $this->assertEquals(0, $importer->stats->entriesMerged);
        $this->assertEquals(0, $importer->stats->entriesDuplicated);
        $this->assertEquals(0, $importer->stats->entriesDeleted);
    }

    // has correct th-fonipa form in each entry
    // has correct sense in first entry (same id)
    // has translation 1 changed, example 2 removed
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
                value="Adjective" />
            <example>
                <form
                    lang="th-fonipa">
                    <text>sentence 1</text>
                </form>
                <translation>
                    <form
                        lang="en">
                        <text>translation 1 changed</text>
                    </form>
                </translation>
            </example>
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
        $liftFilePath = self::$environ->createTestLiftFile(self::liftTwoEntriesV0_13, 'TwoEntriesV0_13.lift');
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        LiftImport::get()->merge($liftFilePath, $project);

        $liftFilePath = self::$environ->createTestLiftFile(self::liftTwoEntriesCorrectedV0_13, 'TwoEntriesCorrectedV0_13.lift');
        $mergeRule = LiftMergeRule::IMPORT_WINS;
        $skipSameModTime = false;

        $importer = LiftImport::get()->merge($liftFilePath, $project, $mergeRule, $skipSameModTime);

        $entryList = new LexEntryListModel($project);
        $entryList->read();
        $entries = $entryList->entries;
        $entriesByGuid = self::$environ->indexItemsBy($entries, 'guid');
        $entry0 = $entriesByGuid['dd15cbc4-9085-4d66-af3d-8428f078a7da'];
        $entry1 = $entriesByGuid['05473cb0-4165-4923-8d81-02f8b8ed3f26'];

        $this->assertEquals(2, $entryList->count);
        $this->assertEquals('chùuchìi mǔu krɔ̀ɔp', $entry0['lexeme']['th-fonipa']['value']); // NFC
        $this->assertCount(1, $entry0['senses']);
        $this->assertEquals('9d50e072-0206-4776-9ee6-bddf89b96aed', $entry0['senses'][0]['guid']);
        $this->assertEquals('A kind of curry fried with crispy pork', $entry0['senses'][0]['definition']['en']['value']);
        $this->assertEquals('Noun', $entry0['senses'][0]['partOfSpeech']['value']);
        $this->assertCount(1, $entry0['senses'][0]['examples']);
        $this->assertEquals('sentence 1', $entry0['senses'][0]['examples'][0]['sentence']['th-fonipa']['value']);
        $this->assertEquals('translation 1 changed', $entry0['senses'][0]['examples'][0]['translation']['en']['value']);
        $this->assertEquals('khâaw kài thɔ̂ɔt', $entry1['lexeme']['th-fonipa']['value']); // NFC
        $this->assertEquals(false, $importer->getReport()->hasError());
        $this->assertEquals(2, $importer->stats->existingEntries);
        $this->assertEquals(2, $importer->stats->importEntries);
        $this->assertEquals(0, $importer->stats->newEntries);
        $this->assertEquals(2, $importer->stats->entriesMerged);
        $this->assertEquals(0, $importer->stats->entriesDuplicated);
        $this->assertEquals(0, $importer->stats->entriesDeleted);
    }

    public function testLiftImportMerge_ExistingDataAndImportWinsAndSkip_NoMerge()
    {
        // create existing data
        $liftFilePath = self::$environ->createTestLiftFile(self::liftTwoEntriesV0_13, 'TwoEntriesV0_13.lift');
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        LiftImport::get()->merge($liftFilePath, $project);

        $liftFilePath = self::$environ->createTestLiftFile(self::liftTwoEntriesCorrectedV0_13, 'TwoEntriesCorrectedV0_13.lift');
        $mergeRule = LiftMergeRule::IMPORT_WINS;
        $skipSameModTime = true;

        $importer = LiftImport::get()->merge($liftFilePath, $project, $mergeRule, $skipSameModTime);

        $entryList = new LexEntryListModel($project);
        $entryList->read();
        $entries = $entryList->entries;
        $entriesByGuid = self::$environ->indexItemsBy($entries, 'guid');
        $entry0 = $entriesByGuid['dd15cbc4-9085-4d66-af3d-8428f078a7da'];
        $entry1 = $entriesByGuid['05473cb0-4165-4923-8d81-02f8b8ed3f26'];

        $this->assertEquals(2, $entryList->count);
        $this->assertEquals('dd15cbc4-9085-4d66-af3d-8428f078a7da', $entry0['guid']);
        $this->assertEquals('chùuchìi mǔu krɔ̂ɔp', $entry0['lexeme']['th-fonipa']['value']); // NFC
        $this->assertCount(1, $entry0['senses']);
        $this->assertEquals('incorrect definition', $entry0['senses'][0]['definition']['en']['value']);
        $this->assertEquals('Adjective', $entry0['senses'][0]['partOfSpeech']['value']);
        $this->assertEquals('05473cb0-4165-4923-8d81-02f8b8ed3f26', $entry1['guid']);
        $this->assertEquals('khâaw kài thɔ̀ɔt', $entry1['lexeme']['th-fonipa']['value']); // NFC
        $this->assertEquals(false, $importer->getReport()->hasError());
        $this->assertEquals(2, $importer->stats->existingEntries);
        $this->assertEquals(2, $importer->stats->importEntries);
        $this->assertEquals(0, $importer->stats->newEntries);
        $this->assertEquals(0, $importer->stats->entriesMerged);
        $this->assertEquals(0, $importer->stats->entriesDuplicated);
        $this->assertEquals(0, $importer->stats->entriesDeleted);
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
        $liftFilePath = self::$environ->createTestLiftFile(self::liftTwoEntriesV0_13, 'TwoEntriesV0_13.lift');
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        LiftImport::get()->merge($liftFilePath, $project);

        $liftFilePath = self::$environ->createTestLiftFile(self::liftTwoEntriesModifiedV0_13, 'TwoEntriesModifiedV0_13.lift');
        $mergeRule = LiftMergeRule::IMPORT_WINS;
        $skipSameModTime = true;

        $importer = LiftImport::get()->merge($liftFilePath, $project, $mergeRule, $skipSameModTime);

        $entryList = new LexEntryListModel($project);
        $entryList->read();
        $entries = $entryList->entries;
        $entriesByGuid = self::$environ->indexItemsBy($entries, 'guid');
        $entry0 = $entriesByGuid['dd15cbc4-9085-4d66-af3d-8428f078a7da'];
        $entry1 = $entriesByGuid['05473cb0-4165-4923-8d81-02f8b8ed3f26'];

        $this->assertEquals(2, $entryList->count);
        $this->assertEquals('dd15cbc4-9085-4d66-af3d-8428f078a7da', $entry0['guid']);
        $this->assertEquals('chùuchìi mǔu krɔ̀ɔp', $entry0['lexeme']['th-fonipa']['value']); // NFC
        $this->assertCount(2, $entry0['senses']);
        $this->assertEquals('incorrect definition', $entry0['senses'][0]['definition']['en']['value']);
        $this->assertEquals('Adjective', $entry0['senses'][0]['partOfSpeech']['value']);
        $this->assertEquals('A kind of curry fried with crispy pork', $entry0['senses'][1]['definition']['en']['value']);
        $this->assertEquals('Noun', $entry0['senses'][1]['partOfSpeech']['value']);
        $this->assertEquals('05473cb0-4165-4923-8d81-02f8b8ed3f26', $entry1['guid']);
        $this->assertEquals('khâaw kài thɔ̂ɔt', $entry1['lexeme']['th-fonipa']['value']); // NFC
        $this->assertEquals(false, $importer->getReport()->hasError());
        $this->assertEquals(2, $importer->stats->existingEntries);
        $this->assertEquals(2, $importer->stats->importEntries);
        $this->assertEquals(0, $importer->stats->newEntries);
        $this->assertEquals(2, $importer->stats->entriesMerged);
        $this->assertEquals(0, $importer->stats->entriesDuplicated);
        $this->assertEquals(0, $importer->stats->entriesDeleted);
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
        $liftFilePath = self::$environ->createTestLiftFile(self::liftTwoEntriesV0_13, 'TwoEntriesV0_13.lift');
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        LiftImport::get()->merge($liftFilePath, $project);

        $liftFilePath = self::$environ->createTestLiftFile(self::liftTwoEntriesOneCorrectedOneDeletedV0_13, 'TwoEntriesOneCorrectedOneDeletedV0_13.lift');
        $mergeRule = LiftMergeRule::IMPORT_WINS;
        $skipSameModTime = false;
        $deleteMatchingEntry = true;

        $importer = LiftImport::get()->merge($liftFilePath, $project, $mergeRule, $skipSameModTime, $deleteMatchingEntry);

        $entryList = new LexEntryListModel($project);
        $entryList->read();
        $entries = $entryList->entries;
        $entriesByGuid = self::$environ->indexItemsBy($entries, 'guid');
        $entry0 = $entriesByGuid['dd15cbc4-9085-4d66-af3d-8428f078a7da'];

        $this->assertEquals(1, $entryList->count);
        $this->assertEquals('dd15cbc4-9085-4d66-af3d-8428f078a7da', $entry0['guid']);
        $this->assertEquals('chùuchìi mǔu krɔ̀ɔp', $entry0['lexeme']['th-fonipa']['value']); // NFC
        $this->assertEquals(false, $importer->getReport()->hasError());
        $this->assertEquals(2, $importer->stats->existingEntries);
        $this->assertEquals(2, $importer->stats->importEntries);
        $this->assertEquals(0, $importer->stats->newEntries);
        $this->assertEquals(1, $importer->stats->entriesMerged);
        $this->assertEquals(0, $importer->stats->entriesDuplicated);
        $this->assertEquals(1, $importer->stats->entriesDeleted);
    }

    public function testLiftImportMerge_ExistingDataAndImportWinsAndSkipSameModTimeAndDeleteMatchingEntry_EntryDeletedAndOtherEntryNotCorrected()
    {
        // create existing data
        $liftFilePath = self::$environ->createTestLiftFile(self::liftTwoEntriesV0_13, 'TwoEntriesV0_13.lift');
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        LiftImport::get()->merge($liftFilePath, $project);

        $liftFilePath = self::$environ->createTestLiftFile(self::liftTwoEntriesOneCorrectedOneDeletedV0_13, 'TwoEntriesOneCorrectedOneDeletedV0_13.lift');
        $mergeRule = LiftMergeRule::IMPORT_WINS;
        $skipSameModTime = true;
        $deleteMatchingEntry = true;

        $importer = LiftImport::get()->merge($liftFilePath, $project, $mergeRule, $skipSameModTime, $deleteMatchingEntry);

        $entryList = new LexEntryListModel($project);
        $entryList->read();
        $entries = $entryList->entries;
        $entriesByGuid = self::$environ->indexItemsBy($entries, 'guid');
        $entry0 = $entriesByGuid['dd15cbc4-9085-4d66-af3d-8428f078a7da'];

        $this->assertEquals(1, $entryList->count);
        $this->assertEquals('dd15cbc4-9085-4d66-af3d-8428f078a7da', $entry0['guid']);
        $this->assertEquals('chùuchìi mǔu krɔ̂ɔp', $entry0['lexeme']['th-fonipa']['value']); // NFC
        $this->assertEquals(false, $importer->getReport()->hasError());
        $this->assertEquals(2, $importer->stats->existingEntries);
        $this->assertEquals(2, $importer->stats->importEntries);
        $this->assertEquals(0, $importer->stats->newEntries);
        $this->assertEquals(0, $importer->stats->entriesMerged);
        $this->assertEquals(0, $importer->stats->entriesDuplicated);
        $this->assertEquals(1, $importer->stats->entriesDeleted);
    }

    public function testLiftImportMerge_ExistingDataAndImportWins_EntryNotDeleted()
    {
        // create existing data
        $liftFilePath = self::$environ->createTestLiftFile(self::liftTwoEntriesV0_13, 'TwoEntriesV0_13.lift');
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        LiftImport::get()->merge($liftFilePath, $project);

        $liftFilePath = self::$environ->createTestLiftFile(self::liftTwoEntriesOneCorrectedOneDeletedV0_13, 'TwoEntriesOneCorrectedOneDeletedV0_13.lift');
        $mergeRule = LiftMergeRule::IMPORT_WINS;
        $skipSameModTime = false;
        $deleteMatchingEntry = false;

        $importer = LiftImport::get()->merge($liftFilePath, $project, $mergeRule, $skipSameModTime, $deleteMatchingEntry);

        $entryList = new LexEntryListModel($project);
        $entryList->read();
        $entries = $entryList->entries;
        $entriesByGuid = self::$environ->indexItemsBy($entries, 'guid');
        $entry0 = $entriesByGuid['dd15cbc4-9085-4d66-af3d-8428f078a7da'];
        $entry1 = $entriesByGuid['05473cb0-4165-4923-8d81-02f8b8ed3f26'];

        $this->assertEquals(2, $entryList->count);
        $this->assertEquals('chùuchìi mǔu krɔ̀ɔp', $entry0['lexeme']['th-fonipa']['value']); // NFC
        $this->assertEquals('khâaw kài thɔ̀ɔt', $entry1['lexeme']['th-fonipa']['value']); // NFC
        $this->assertEquals(false, $importer->getReport()->hasError());
        $this->assertEquals(2, $importer->stats->existingEntries);
        $this->assertEquals(2, $importer->stats->importEntries);
        $this->assertEquals(0, $importer->stats->newEntries);
        $this->assertEquals(1, $importer->stats->entriesMerged);
        $this->assertEquals(0, $importer->stats->entriesDuplicated);
        $this->assertEquals(0, $importer->stats->entriesDeleted);
    }

    public function testLiftImportMerge_NoExistingDataAndImportLoses_MergeOk()
    {
        $liftFilePath = self::$environ->createTestLiftFile(self::liftTwoEntriesCorrectedV0_13, 'TwoEntriesCorrectedV0_13.lift');
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $mergeRule = LiftMergeRule::IMPORT_LOSES;
        $skipSameModTime = false;

        $importer = LiftImport::get()->merge($liftFilePath, $project, $mergeRule, $skipSameModTime);

        $entryList = new LexEntryListModel($project);
        $entryList->read();
        $entries = $entryList->entries;
        $entriesByGuid = self::$environ->indexItemsBy($entries, 'guid');
        $entry0 = $entriesByGuid['dd15cbc4-9085-4d66-af3d-8428f078a7da'];
        $entry1 = $entriesByGuid['05473cb0-4165-4923-8d81-02f8b8ed3f26'];

        $this->assertEquals(2, $entryList->count);
        $this->assertEquals('dd15cbc4-9085-4d66-af3d-8428f078a7da', $entry0['guid']);
        $this->assertEquals('chùuchìi mǔu krɔ̀ɔp', $entry0['lexeme']['th-fonipa']['value']); // NFC
        $this->assertCount(1, $entry0['senses']);
        $this->assertEquals('9d50e072-0206-4776-9ee6-bddf89b96aed', $entry0['senses'][0]['guid']);
        $this->assertEquals('A kind of curry fried with crispy pork', $entry0['senses'][0]['definition']['en']['value']);
        $this->assertEquals('Noun', $entry0['senses'][0]['partOfSpeech']['value']);
        $this->assertEquals('05473cb0-4165-4923-8d81-02f8b8ed3f26', $entry1['guid']);
        $this->assertEquals('khâaw kài thɔ̂ɔt', $entry1['lexeme']['th-fonipa']['value']); // NFC
        $this->assertEquals(false, $importer->getReport()->hasError());
        $this->assertEquals(0, $importer->stats->existingEntries);
        $this->assertEquals(2, $importer->stats->importEntries);
        $this->assertEquals(2, $importer->stats->newEntries);
        $this->assertEquals(0, $importer->stats->entriesMerged);
        $this->assertEquals(0, $importer->stats->entriesDuplicated);
        $this->assertEquals(0, $importer->stats->entriesDeleted);
    }

    public function testLiftImportMerge_ExistingDataAndImportLoses_NoMerge()
    {
        // create existing data
        $liftFilePath = self::$environ->createTestLiftFile(self::liftTwoEntriesV0_13, 'TwoEntriesV0_13.lift');
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        LiftImport::get()->merge($liftFilePath, $project);

        $liftFilePath = self::$environ->createTestLiftFile(self::liftTwoEntriesCorrectedV0_13, 'TwoEntriesCorrectedV0_13.lift');
        $mergeRule = LiftMergeRule::IMPORT_LOSES;
        $skipSameModTime = false;

        $importer = LiftImport::get()->merge($liftFilePath, $project, $mergeRule, $skipSameModTime);

        $entryList = new LexEntryListModel($project);
        $entryList->read();
        $entries = $entryList->entries;
        $entriesByGuid = self::$environ->indexItemsBy($entries, 'guid');
        $entry0 = $entriesByGuid['dd15cbc4-9085-4d66-af3d-8428f078a7da'];
        $entry1 = $entriesByGuid['05473cb0-4165-4923-8d81-02f8b8ed3f26'];

        $this->assertEquals(2, $entryList->count);
        $this->assertEquals('dd15cbc4-9085-4d66-af3d-8428f078a7da', $entry0['guid']);
        $this->assertEquals('chùuchìi mǔu krɔ̂ɔp', $entry0['lexeme']['th-fonipa']['value']); // NFC
        $this->assertCount(1, $entry0['senses']);
        $this->assertEquals('9d50e072-0206-4776-9ee6-bddf89b96aed', $entry0['senses'][0]['guid']);
        $this->assertEquals('incorrect definition', $entry0['senses'][0]['definition']['en']['value']);
        $this->assertEquals('Adjective', $entry0['senses'][0]['partOfSpeech']['value']);
        $this->assertEquals('05473cb0-4165-4923-8d81-02f8b8ed3f26', $entry1['guid']);
        $this->assertEquals('khâaw kài thɔ̀ɔt', $entry1['lexeme']['th-fonipa']['value']); // NFC
        $this->assertEquals(false, $importer->getReport()->hasError());
        $this->assertEquals(2, $importer->stats->existingEntries);
        $this->assertEquals(2, $importer->stats->importEntries);
        $this->assertEquals(0, $importer->stats->newEntries);
        $this->assertEquals(2, $importer->stats->entriesMerged);
        $this->assertEquals(0, $importer->stats->entriesDuplicated);
        $this->assertEquals(0, $importer->stats->entriesDeleted);
    }

    public function testLiftImportMerge_NoExistingDataAndCreateDuplicates_MergeOk()
    {
        $liftFilePath = self::$environ->createTestLiftFile(self::liftTwoEntriesCorrectedV0_13, 'TwoEntriesCorrectedV0_13.lift');
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $mergeRule = LiftMergeRule::CREATE_DUPLICATES;
        $skipSameModTime = false;

        $importer = LiftImport::get()->merge($liftFilePath, $project, $mergeRule, $skipSameModTime);

        $entryList = new LexEntryListModel($project);
        $entryList->read();
        $entries = $entryList->entries;
        $entriesByGuid = self::$environ->indexItemsBy($entries, 'guid');
        $entry0 = $entriesByGuid['dd15cbc4-9085-4d66-af3d-8428f078a7da'];
        $entry1 = $entriesByGuid['05473cb0-4165-4923-8d81-02f8b8ed3f26'];

        $this->assertEquals(2, $entryList->count);
        $this->assertEquals('dd15cbc4-9085-4d66-af3d-8428f078a7da', $entry0['guid']);
        $this->assertEquals('chùuchìi mǔu krɔ̀ɔp', $entry0['lexeme']['th-fonipa']['value']); // NFC
        $this->assertCount(1, $entry0['senses']);
        $this->assertEquals('A kind of curry fried with crispy pork', $entry0['senses'][0]['definition']['en']['value']);
        $this->assertEquals('Noun', $entry0['senses'][0]['partOfSpeech']['value']);
        $this->assertEquals('05473cb0-4165-4923-8d81-02f8b8ed3f26', $entry1['guid']);
        $this->assertEquals('khâaw kài thɔ̂ɔt', $entry1['lexeme']['th-fonipa']['value']); // NFC
        $this->assertEquals(false, $importer->getReport()->hasError());
        $this->assertEquals(0, $importer->stats->existingEntries);
        $this->assertEquals(2, $importer->stats->importEntries);
        $this->assertEquals(2, $importer->stats->newEntries);
        $this->assertEquals(0, $importer->stats->entriesMerged);
        $this->assertEquals(0, $importer->stats->entriesDuplicated);
        $this->assertEquals(0, $importer->stats->entriesDeleted);
    }

    public function testLiftImportMerge_ExistingDataAndCreateDuplicates_DuplicatesCreated()
    {
        // create existing data
        $liftFilePath = self::$environ->createTestLiftFile(self::liftTwoEntriesV0_13, 'TwoEntriesV0_13.lift');
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        LiftImport::get()->merge($liftFilePath, $project);

        $liftFilePath = self::$environ->createTestLiftFile(self::liftTwoEntriesCorrectedV0_13, 'TwoEntriesCorrectedV0_13.lift');
        $mergeRule = LiftMergeRule::CREATE_DUPLICATES;
        $skipSameModTime = false;

        $importer = LiftImport::get()->merge($liftFilePath, $project, $mergeRule, $skipSameModTime);

        $entryList = new LexEntryListModel($project);
        $entryList->read();
        $entries = $entryList->entries;
        $entriesByGuid = self::$environ->indexItemsBy($entries, 'guid');
        $entry0 = $entriesByGuid['dd15cbc4-9085-4d66-af3d-8428f078a7da'];
        $entry1 = $entriesByGuid['05473cb0-4165-4923-8d81-02f8b8ed3f26'];

        $this->assertEquals(4, $entryList->count);
        $this->assertEquals('dd15cbc4-9085-4d66-af3d-8428f078a7da', $entry0['guid']);
        $this->assertEquals('chùuchìi mǔu krɔ̂ɔp', $entry0['lexeme']['th-fonipa']['value']); // NFC
        $this->assertCount(1, $entry0['senses']);
        $this->assertEquals('incorrect definition', $entry0['senses'][0]['definition']['en']['value']);
        $this->assertEquals('Adjective', $entry0['senses'][0]['partOfSpeech']['value']);
        $this->assertEquals('05473cb0-4165-4923-8d81-02f8b8ed3f26', $entry1['guid']);
        $this->assertEquals('khâaw kài thɔ̀ɔt', $entry1['lexeme']['th-fonipa']['value']); // NFC
        $this->assertEquals('', $entries[2]['guid']);
        $this->assertEquals('chùuchìi mǔu krɔ̀ɔp', $entries[2]['lexeme']['th-fonipa']['value']); // NFC
        $this->assertCount(1, $entries[2]['senses']);
        $this->assertEquals('A kind of curry fried with crispy pork', $entries[2]['senses'][0]['definition']['en']['value']);
        $this->assertEquals('Noun', $entries[2]['senses'][0]['partOfSpeech']['value']);
        $this->assertEquals('', $entries[3]['guid']);
        $this->assertEquals('khâaw kài thɔ̂ɔt', $entries[3]['lexeme']['th-fonipa']['value']); // NFC
        $this->assertEquals(false, $importer->getReport()->hasError());
        $this->assertEquals(2, $importer->stats->existingEntries);
        $this->assertEquals(2, $importer->stats->importEntries);
        $this->assertEquals(0, $importer->stats->newEntries);
        $this->assertEquals(0, $importer->stats->entriesMerged);
        $this->assertEquals(2, $importer->stats->entriesDuplicated);
        $this->assertEquals(0, $importer->stats->entriesDeleted);
    }

    public function testLiftImportMerge_ExistingDataAndCreateDuplicatesAndSkip_NoMerge()
    {
        // create existing data
        $liftFilePath = self::$environ->createTestLiftFile(self::liftTwoEntriesV0_13, 'TwoEntriesV0_13.lift');
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        LiftImport::get()->merge($liftFilePath, $project);

        $liftFilePath = self::$environ->createTestLiftFile(self::liftTwoEntriesCorrectedV0_13, 'TwoEntriesCorrectedV0_13.lift');
        $mergeRule = LiftMergeRule::CREATE_DUPLICATES;
        $skipSameModTime = true;

        $importer = LiftImport::get()->merge($liftFilePath, $project, $mergeRule, $skipSameModTime);

        $entryList = new LexEntryListModel($project);
        $entryList->read();
        $entries = $entryList->entries;
        $entriesByGuid = self::$environ->indexItemsBy($entries, 'guid');
        $entry0 = $entriesByGuid['dd15cbc4-9085-4d66-af3d-8428f078a7da'];
        $entry1 = $entriesByGuid['05473cb0-4165-4923-8d81-02f8b8ed3f26'];

        $this->assertEquals(2, $entryList->count);
        $this->assertEquals('dd15cbc4-9085-4d66-af3d-8428f078a7da', $entry0['guid']);
        $this->assertEquals('chùuchìi mǔu krɔ̂ɔp', $entry0['lexeme']['th-fonipa']['value']); // NFC
        $this->assertCount(1, $entry0['senses']);
        $this->assertEquals('incorrect definition', $entry0['senses'][0]['definition']['en']['value']);
        $this->assertEquals('Adjective', $entry0['senses'][0]['partOfSpeech']['value']);
        $this->assertEquals('05473cb0-4165-4923-8d81-02f8b8ed3f26', $entry1['guid']);
        $this->assertEquals('khâaw kài thɔ̀ɔt', $entry1['lexeme']['th-fonipa']['value']); // NFC
        $this->assertEquals(false, $importer->getReport()->hasError());
        $this->assertEquals(2, $importer->stats->existingEntries);
        $this->assertEquals(2, $importer->stats->importEntries);
        $this->assertEquals(0, $importer->stats->newEntries);
        $this->assertEquals(0, $importer->stats->entriesMerged);
        $this->assertEquals(0, $importer->stats->entriesDuplicated);
        $this->assertEquals(0, $importer->stats->entriesDeleted);
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
                    <text>text before <span lang="th">ฉู่ฉี่หมูกรอบ</span> is a kind of curry fried with crispy pork</text>
                </form>
                <form
                    lang="th">
                    <text>ฉู่ฉี่หมูกรอบ<span lang="en"> is a kind of <i>curry <b>fried</b> with</i> crispy pork</span> text <i>to <b>test</b> after</i> the span</text>
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
        $liftFilePath = self::$environ->createTestLiftFile(self::liftTwoEntriesWithSpanV0_13, 'TwoEntriesWithSpanV0_13.lift');
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $mergeRule = LiftMergeRule::IMPORT_WINS;
        $skipSameModTime = false;

        $importer = LiftImport::get()->merge($liftFilePath, $project, $mergeRule, $skipSameModTime);

        $entryList = new LexEntryListModel($project);
        $entryList->read();
        $entries = $entryList->entries;
        $entriesByGuid = self::$environ->indexItemsBy($entries, 'guid');
        $entry0 = $entriesByGuid['dd15cbc4-9085-4d66-af3d-8428f078a7da'];
        $entry1 = $entriesByGuid['05473cb0-4165-4923-8d81-02f8b8ed3f26'];
        $report = $importer->getReport();
        $reportStr = $report->toString();

        $this->assertEquals(2, $entryList->count);
        $this->assertEquals('dd15cbc4-9085-4d66-af3d-8428f078a7da', $entry0['guid']);
        $this->assertEquals('chùuchìi mǔu krɔ̀ɔp', $entry0['lexeme']['th-fonipa']['value']); // NFC
        $this->assertEquals('ฉู่ฉี่หมูกรอบ', $entry0['lexeme']['th']['value']);
        $this->assertCount(1, $entry0['senses']);
        $this->assertEquals('text before <span lang="th">ฉู่ฉี่หมูกรอบ</span> is a kind of curry fried with crispy pork',
            $entry0['senses'][0]['definition']['en']['value']);
        $this->assertEquals('ฉู่ฉี่หมูกรอบ<span lang="en"> is a kind of curry fried with crispy pork</span> text to test after the span',
            $entry0['senses'][0]['definition']['th']['value']);
        $this->assertEquals('Noun', $entry0['senses'][0]['partOfSpeech']['value']);
        $this->assertEquals('05473cb0-4165-4923-8d81-02f8b8ed3f26', $entry1['guid']);
        $this->assertEquals('khâaw kài thɔ̂ɔt', $entry1['lexeme']['th-fonipa']['value']); // NFC
        $this->assertEquals('ข้าวไก่ทอด', $entry1['lexeme']['th']['value']);
        $this->assertEquals(true, $report->hasError());
        $this->assertRegExp("/processing multitext 'definition', unhandled element 'i', unhandled element 'b', unhandled element 'i', unhandled element 'b'/", $reportStr);
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
        $liftFilePath = self::$environ->createTestLiftFile(self::liftNotesWithoutSpansV0_13, 'NotesWithoutSpansV0_13.lift');
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $mergeRule = LiftMergeRule::IMPORT_WINS;
        $skipSameModTime = false;

        $importer = LiftImport::get()->merge($liftFilePath, $project, $mergeRule, $skipSameModTime);

        $entryList = new LexEntryListModel($project);
        $entryList->read();
        $entries = $entryList->entries;
        $entriesByGuid = self::$environ->indexItemsBy($entries, 'guid');
        $entry0 = $entriesByGuid['57a90e40-fdb4-47f8-89a0-c64bf947723d'];
        $entry1 = $entriesByGuid['8db0bd91-9120-4417-b6ff-d0bb35f552fc'];

        $this->assertEquals(2, $entryList->count);
        $this->assertEquals('57a90e40-fdb4-47f8-89a0-c64bf947723d', $entry0['guid']);
        $this->assertEquals('brown bear', $entry0['lexeme']['qaa-x-qaa']['value']);
        $this->assertEquals('This is not a black bear.', $entry0['note']['en']['value']);
        $this->assertEquals('8db0bd91-9120-4417-b6ff-d0bb35f552fc', $entry1['guid']);
        $this->assertEquals('black bear', $entry1['lexeme']['qaa-x-qaa']['value']);
        $this->assertEquals('This is not a brown bear.', $entry1['note']['en']['value']);
        $this->assertEquals(false, $importer->getReport()->hasError());
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
                <text>ceci <b>n'est</b> pas une pipe; <span lang="en">This is <b>not</b> a black bear</span>.</text>
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
        $liftFilePath = self::$environ->createTestLiftFile(self::liftNotesWithSpansV0_13, 'NotesWithSpansV0_13.lift');
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $mergeRule = LiftMergeRule::IMPORT_WINS;
        $skipSameModTime = false;

        $importer = LiftImport::get()->merge($liftFilePath, $project, $mergeRule, $skipSameModTime);

        $entryList = new LexEntryListModel($project);
        $entryList->read();
        $entries = $entryList->entries;
        $entriesByGuid = self::$environ->indexItemsBy($entries, 'guid');
        $entry0 = $entriesByGuid['57a90e40-fdb4-47f8-89a0-c64bf947723d'];
        $entry1 = $entriesByGuid['8db0bd91-9120-4417-b6ff-d0bb35f552fc'];
        $report = $importer->getReport();
        $reportStr = $report->toString();

        $this->assertEquals(2, $entryList->count);
        $this->assertEquals('57a90e40-fdb4-47f8-89a0-c64bf947723d', $entry0['guid']);
        $this->assertEquals('brown bear', $entry0['lexeme']['qaa-x-qaa']['value']);
        $this->assertEquals('This is not a black bear, and <span lang="fr">ceci n\'est pas une pipe</span>.',
            $entry0['note']['en']['value']);
        $this->assertEquals('ceci n\'est pas une pipe; <span lang="en">This is not a black bear</span>.',
            $entry0['note']['fr']['value']);
        $this->assertEquals('8db0bd91-9120-4417-b6ff-d0bb35f552fc', $entry1['guid']);
        $this->assertEquals('black bear', $entry1['lexeme']['qaa-x-qaa']['value']);
        $this->assertEquals('This is not a brown bear.', $entry1['note']['en']['value']);
        $this->assertEquals(true, $report->hasError());
        $this->assertRegExp("/processing multitext 'note', unhandled element 'b', unhandled element 'b'/", $reportStr);
    }

    // has correct th-fonipa form in each entry
    // has correct sense in first entry (same id)
    // has bogus (phony, rubbish, fake) tags inside Entry and Example
    const liftTwoEntriesCorrectedBogusTagsV0_13 = <<<EOD
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
            <phony>
            </phony>
            <form
                lang="th">
                <text>ฉู่ฉี่หมูกรอบ</text>
            </form>
        </lexical-unit>
        <bogus>
        </bogus>
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
                <fake>
                </fake>
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

    public function testLiftImportMerge_BogusTags_ReportOk()
    {
        $liftFilePath = self::$environ->createTestLiftFile(self::liftTwoEntriesCorrectedBogusTagsV0_13, 'TwoEntriesCorrectedBogusTagsV0_13.lift');
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $mergeRule = LiftMergeRule::IMPORT_WINS;
        $skipSameModTime = false;

        $importer = LiftImport::get()->merge($liftFilePath, $project, $mergeRule, $skipSameModTime);

        $entryList = new LexEntryListModel($project);
        $entryList->read();
        $entries = $entryList->entries;
        $entriesByGuid = self::$environ->indexItemsBy($entries, 'guid');
        $report = $importer->getReport();
        $reportStr = $report->toString();

        $this->assertEquals(2, $entryList->count);
        $this->assertEquals('chùuchìi mǔu krɔ̀ɔp', $entriesByGuid['dd15cbc4-9085-4d66-af3d-8428f078a7da']['lexeme']['th-fonipa']['value']); // NFC
        $this->assertEquals(1, count($entriesByGuid['dd15cbc4-9085-4d66-af3d-8428f078a7da']['senses']));
        $this->assertEquals('A kind of curry fried with crispy pork', $entriesByGuid['dd15cbc4-9085-4d66-af3d-8428f078a7da']['senses'][0]['definition']['en']['value']);
        $this->assertEquals('Noun', $entriesByGuid['dd15cbc4-9085-4d66-af3d-8428f078a7da']['senses'][0]['partOfSpeech']['value']);
        $this->assertEquals('khâaw kài thɔ̂ɔt', $entriesByGuid['05473cb0-4165-4923-8d81-02f8b8ed3f26']['lexeme']['th-fonipa']['value']); // NFC
        $this->assertCount(1, $report->nodeErrors);
        $this->assertTrue($report->nodeErrors[0]->getSubnodeError(0)->hasError(), 'should have phony and bogus tag entry errors');
        $this->assertRegExp("/unhandled element 'bogus'/", $reportStr);
        $this->assertRegExp("/processing multitext 'lexical-unit', unhandled element 'phony'/", $reportStr);
        $this->assertNotRegExp("/unhandled element 'translation'/", $reportStr);
        $this->assertTrue($report->nodeErrors[0]->getSubnodeError(0)->currentSubnodeError()->currentSubnodeError()->hasError(), 'should have rubbish tag example error');
        $this->assertRegExp("/unhandled element 'rubbish'/", $report->nodeErrors[0]->getSubnodeError(0)->currentSubnodeError()->currentSubnodeError()->toString());
        $this->assertRegExp("/unhandled element 'rubbish'/", $reportStr);
        $this->assertTrue($report->nodeErrors[0]->getSubnodeError(1)->currentSubnodeError()->currentSubnodeError()->hasError(), 'should have fake tag example error');
        $this->assertRegExp("/unhandled element 'fake'/", $report->nodeErrors[0]->getSubnodeError(1)->currentSubnodeError()->currentSubnodeError()->toString());
        $this->assertRegExp("/unhandled element 'fake'/", $reportStr);
    }

    // lift with ranges referencing lift-ranges file
    const liftWithRangesV0_13 = <<<EOD
<?xml version="1.0" encoding="UTF-8" ?>
<!-- See http://code.google.com/p/lift-standard for more information on the format used here. -->
<lift producer="SIL.FLEx 8.1.1.41891" version="0.13">
<header>
<ranges>
<range id="grammatical-info" href="file://C:/Users/zook/Desktop/TestLangProj/TestLangProj.lift-ranges"/>
<range id="status" href="file://C:/Users/zook/Desktop/TestLangProj/TestLangProj.lift-ranges"/>
<!-- The following ranges are produced by FieldWorks Language Explorer, and are not part of the LIFT standard. -->
<range id="anthro-code" href="file://C:/Users/zook/Desktop/TestLangProj/TestLangProj.lift-ranges"/>
<range id="domain-type" href="file://C:/Users/zook/Desktop/TestLangProj/TestLangProj.lift-ranges">
<range-element id="anatomy" guid="d7f713a1-e8cf-11d3-9764-00c04f186933">
<label>
<form lang="en"><text>anatomy</text></form>
<form lang="es"><text>anatomía</text></form>
<form lang="fr"><text>anatomie</text></form>
</label>
<abbrev>
<form lang="en"><text>Anat</text></form>
<form lang="es"><text>Anat</text></form>
<form lang="fr"><text>Anat</text></form>
</abbrev>
</range-element>
<range-element id="anthropology" guid="d7f713a2-e8cf-11d3-9764-00c04f186933">
<label>
<form lang="en"><text>anthropology</text></form>
<form lang="es"><text>antropología</text></form>
<form lang="fr"><text>anthropologie</text></form>
</label>
<abbrev>
<form lang="en"><text>Anthro</text></form>
<form lang="es"><text>Antro</text></form>
<form lang="fr"><text>Anthro</text></form>
</abbrev>
</range-element>
</range>
</ranges>
</header>
<entry dateCreated="2003-08-07T13:42:42Z" dateModified="2007-01-17T19:16:55Z" id="*hindoksa_016f2759-ed12-42a5-abcb-7fe3f53d05b0" guid="016f2759-ed12-42a5-abcb-7fe3f53d05b0">
<lexical-unit>
<form lang="qaa-fonipa-x-kal"><text>*dok</text></form>
<form lang="qaa-x-kal"><text>*dok</text></form>
</lexical-unit>
</entry>
</lift>
EOD;

    // lift-ranges
    const liftRangesV0_13 = <<<EOD
<?xml version="1.0" encoding="UTF-8"?>
<!-- See http://code.google.com/p/lift-standard for more information on the format used here. -->
<lift-ranges>
<range id="grammatical-info">
<!-- These are all the parts of speech in the FLEx db, used or unused.  These are used as the basic grammatical-info values. -->
<range-element id="article" guid="d7f7150e-e8cf-11d3-9764-00c04f186933">
<label>
<form lang="en"><text>article</text></form>
<form lang="es"><text>artículo</text></form>
<form lang="fr"><text>article</text></form>
</label>
<abbrev>
<form lang="en"><text>art</text></form>
<form lang="es"><text>art</text></form>
<form lang="fr"><text>art</text></form>
</abbrev>
<trait name="catalog-source-id" value="Article"/>
</range-element>
<range-element id="definite article" guid="d7f7150f-e8cf-11d3-9764-00c04f186933" parent="article">
<label>
<form lang="en"><text>definite article</text></form>
<form lang="es"><text>artículo definido</text></form>
<form lang="fr"><text>article défini</text></form>
</label>
<abbrev>
<form lang="en"><text>def</text></form>
<form lang="es"><text>def</text></form>
<form lang="fr"><text>déf</text></form>
</abbrev>
<trait name="catalog-source-id" value="DefiniteArticle"/>
</range-element>
<range-element id="indefinite article" guid="d7f71510-e8cf-11d3-9764-00c04f186933" parent="article">
<label>
<form lang="en"><text>indefinite article</text></form>
<form lang="es"><text>artículo indefinido</text></form>
<form lang="fr"><text>article indéfini</text></form>
</label>
<abbrev>
<form lang="en"><text>indef</text></form>
<form lang="es"><text>indef</text></form>
<form lang="fr"><text>indéf</text></form>
</abbrev>
<trait name="catalog-source-id" value="IndefiniteArticle"/>
</range-element>
</range>
<range id="status">
<range-element id="Confirmed" guid="2bdd10e4-f9b2-11d3-977b-00c04f186933">
<label>
<form lang="ar-IQ"><text>لا شك أن</text></form>
<form lang="en"><text>Confirmed</text></form>
<form lang="es"><text>sConfirmed</text></form>
<form lang="fr"><text>fConfirmed</text></form>
</label>
<abbrev>
<form lang="en"><text>Conf</text></form>
<form lang="es"><text>sConf</text></form>
<form lang="fr"><text>fConf</text></form>
</abbrev>
</range-element>
<range-element id="Disproved" guid="2bdd10eb-f9b2-11d3-977b-00c04f186933">
<label>
<form lang="en"><text>Disproved</text></form>
<form lang="es"><text>sDisproved</text></form>
<form lang="fr"><text>fDisproved</text></form>
</label>
<abbrev>
<form lang="en"><text>Dis</text></form>
<form lang="es"><text>sDis</text></form>
<form lang="fr"><text>fDis</text></form>
</abbrev>
</range-element>
<range-element id="Pending" guid="2bdd10f2-f9b2-11d3-977b-00c04f186933">
<label>
<form lang="en"><text>Pending</text></form>
<form lang="es"><text>sPending</text></form>
<form lang="fr"><text>fPending</text></form>
</label>
<abbrev>
<form lang="en"><text>Pend</text></form>
<form lang="es"><text>sPend</text></form>
<form lang="fr"><text>fPend</text></form>
</abbrev>
</range-element>
<range-element id="Tentative" guid="33bff305-6de5-4946-b983-4dbffeddfc28">
<label>
<form lang="en"><text>Tentative</text></form>
</label>
<abbrev>
<form lang="en"><text>Tent</text></form>
</abbrev>
</range-element>
</range>
<!-- This is a custom list or other list which is not output by default but if referenced in the data of a field.  -->
<range id="domain-type" guid="d7f713a0-e8cf-11d3-9764-00c04f186933">
<range-element id="anatomy" guid="d7f713a1-e8cf-11d3-9764-00c04f186933">
<label>
<form lang="en"><text>anatomy</text></form>
<form lang="es"><text>anatomía</text></form>
<form lang="fr"><text>anatomie</text></form>
</label>
<abbrev>
<form lang="en"><text>Anat</text></form>
<form lang="es"><text>Anat</text></form>
<form lang="fr"><text>Anat</text></form>
</abbrev>
</range-element>
</range>
</lift-ranges>
EOD;

    public function testLiftImportMerge_LiftRanges_ImportOk()
    {
        $liftFilePath = self::$environ->createTestLiftFile(self::liftWithRangesV0_13, 'LiftWithRangesV0_13.lift');
        self::$environ->createTestLiftFile(self::liftRangesV0_13, 'TestLangProj.lift-ranges');
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $mergeRule = LiftMergeRule::IMPORT_WINS;
        $skipSameModTime = false;

        $importer = LiftImport::get()->merge($liftFilePath, $project, $mergeRule, $skipSameModTime);

        $report = $importer->getReport();
        $reportStr = $report->toString();
        $this->assertEquals(true, $report->hasError());
        $this->assertRegExp("/the lift range 'anthro-code' was not found in the current file/", $reportStr);
        $this->assertEquals(1, $importer->stats->newEntries);

        $optionList = new LexOptionListModel($project);
        $optionList->readByProperty('code', LexConfig::flexOptionlistCode(LexConfig::ANTHROPOLOGYCATEGORIES));
        $this->assertEquals(0, $optionList->items->count());

        $optionList->readByProperty('code', LexConfig::flexOptionlistCode(LexConfig::POS));
        $this->assertEquals(3, $optionList->items->count());
        $this->assertEquals('art', $optionList->items[0]->abbreviation);
        $this->assertEquals('article', $optionList->items[0]->value);
        $this->assertEquals('def', $optionList->items[1]->abbreviation);
        $this->assertEquals('definite article', $optionList->items[1]->value);
        $this->assertEquals('indef', $optionList->items[2]->abbreviation);
        $this->assertEquals('indefinite article', $optionList->items[2]->value);

        $optionList->readByProperty('code', LexConfig::flexOptionlistCode(LexConfig::STATUS));
        $this->assertEquals(4, $optionList->items->count());
        $this->assertEquals('Conf', $optionList->items[0]->abbreviation);
        $this->assertEquals('Confirmed', $optionList->items[0]->value);
        $this->assertEquals('Dis', $optionList->items[1]->abbreviation);
        $this->assertEquals('Disproved', $optionList->items[1]->value);
        $this->assertEquals('Pend', $optionList->items[2]->abbreviation);
        $this->assertEquals('Pending', $optionList->items[2]->value);
        $this->assertEquals('Tent', $optionList->items[3]->abbreviation);
        $this->assertEquals('Tentative', $optionList->items[3]->value);

        $optionList->readByProperty('code', LexConfig::flexOptionlistCode(LexConfig::ACADEMICDOMAINS));
        $this->assertEquals(2, $optionList->items->count());
        $this->assertEquals('Anat', $optionList->items[0]->abbreviation);
        $this->assertEquals('anatomy', $optionList->items[0]->value);
        $this->assertEquals('Anthro', $optionList->items[1]->abbreviation);
        $this->assertEquals('anthropology', $optionList->items[1]->value);
    }

    // lift-ranges another POS
    const liftRangesAnotherPosV0_13 = <<<EOD
<?xml version="1.0" encoding="UTF-8"?>
<!-- See http://code.google.com/p/lift-standard for more information on the format used here. -->
<lift-ranges>
<range id="grammatical-info">
<!-- These are all the parts of speech in the FLEx db, used or unused.  These are used as the basic grammatical-info values. -->
<range-element id="adjunct" guid="d7f7150d-e8cf-11d3-9764-00c04f186933">
<label>
<form lang="en"><text>adjunct</text></form>
<form lang="es"><text>adjunto</text></form>
<form lang="fr"><text>accessoire</text></form>
</label>
<abbrev>
<form lang="en"><text>adjunct</text></form>
<form lang="es"><text>adjunto</text></form>
<form lang="fr"><text>accessoire</text></form>
</abbrev>
<trait name="catalog-source-id" value=""/>
</range-element>
</range>
</lift-ranges>
EOD;

    public function testLiftImportMerge_ExistingData_RangesChanged()
    {
        $liftFilePath = self::$environ->createTestLiftFile(self::liftWithRangesV0_13, 'LiftWithRangesV0_13.lift');
        self::$environ->createTestLiftFile(self::liftRangesV0_13, 'TestLangProj.lift-ranges');
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $mergeRule = LiftMergeRule::IMPORT_WINS;
        $skipSameModTime = false;
        LiftImport::get()->merge($liftFilePath, $project, $mergeRule, $skipSameModTime);

        $optionList = new LexOptionListModel($project);
        $optionList->readByProperty('code', LexConfig::flexOptionlistCode(LexConfig::POS));
        $this->assertEquals(3, $optionList->items->count());
        $this->assertEquals('article', $optionList->items[0]->value);

        self::$environ->createTestLiftFile(self::liftRangesAnotherPosV0_13, 'TestLangProj.lift-ranges');

        $importer = LiftImport::get()->merge($liftFilePath, $project, $mergeRule, $skipSameModTime);

        $this->assertEquals(1, $importer->stats->existingEntries);

        $optionList = new LexOptionListModel($project);
        $optionList->readByProperty('code', LexConfig::flexOptionlistCode(LexConfig::ANTHROPOLOGYCATEGORIES));
        $this->assertEquals(0, $optionList->items->count());

        $optionList->readByProperty('code', LexConfig::flexOptionlistCode(LexConfig::STATUS));
        $this->assertEquals(4, $optionList->items->count());

        $optionList->readByProperty('code', LexConfig::flexOptionlistCode(LexConfig::ACADEMICDOMAINS));
        $this->assertEquals(2, $optionList->items->count());

        $optionList->readByProperty('code', LexConfig::flexOptionlistCode(LexConfig::POS));
        $this->assertEquals(1, $optionList->items->count());
        $this->assertEquals('adjunct', $optionList->items[0]->value);
    }

    // lift-ranges another POS
    const liftUnknownRangeV0_13 = <<<EOD
<?xml version="1.0" encoding="UTF-8" ?>
<!-- See http://code.google.com/p/lift-standard for more information on the format used here. -->
<lift producer="SIL.FLEx 8.1.1.41891" version="0.13">
<header>
<ranges>
<range id="dialect" href="file://C:/Users/zook/Desktop/TestLangProj/TestLangProj.lift-ranges"/>
</ranges>
</header>
<entry dateCreated="2003-08-07T13:42:42Z" dateModified="2007-01-17T19:16:55Z" id="*hindoksa_016f2759-ed12-42a5-abcb-7fe3f53d05b0" guid="016f2759-ed12-42a5-abcb-7fe3f53d05b0">
<lexical-unit>
<form lang="qaa-fonipa-x-kal"><text>*dok</text></form>
<form lang="qaa-x-kal"><text>*dok</text></form>
</lexical-unit>
</entry>
</lift>
EOD;

    // lift-ranges with unknown range
    const liftRangesUnknownRangeV0_13 = <<<EOD
<?xml version="1.0" encoding="UTF-8"?>
<!-- See http://code.google.com/p/lift-standard for more information on the format used here. -->
<lift-ranges>
<range id="grammatical-info">
<!-- These are all the parts of speech in the FLEx db, used or unused.  These are used as the basic grammatical-info values. -->
<range-element id="Associativo" guid="8d0461bd-2b2e-4d65-9f17-0ab5b99d0736" parent="Preposição">
<label>
<form lang="en"><text>Associative</text></form>
<form lang="pt"><text>Associativo</text></form>
</label>
<abbrev>
<form lang="en"><text>Assoc</text></form>
<form lang="pt"><text>Assoc</text></form>
</abbrev>
<description>
<form lang="en"><text>As a word it functions as a preposition, it can also be a prefix to a possessive root. Q: should it be listed separtely as a preposion and a prefix- ?</text></form>
</description>
<trait name="catalog-source-id" value=""/>
</range-element>
</range>
</lift-ranges>
EOD;

    public function testLiftImportMerge_UnknownRange_RangeError()
    {
        $liftFilePath = self::$environ->createTestLiftFile(self::liftUnknownRangeV0_13, 'LiftUnknownRangeV0_13.lift');
        self::$environ->createTestLiftFile(self::liftRangesUnknownRangeV0_13, 'TestLangProj.lift-ranges');
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $mergeRule = LiftMergeRule::IMPORT_WINS;
        $skipSameModTime = false;

        $importer = LiftImport::get()->merge($liftFilePath, $project, $mergeRule, $skipSameModTime);

        $report = $importer->getReport();
        $reportStr = $report->toString();
        $this->assertEquals(true, $report->hasError());
        $this->assertRegExp("/the lift range 'dialect' was not found in the current file/", $reportStr);
    }

    public function testLiftImportMerge_NoLiftRanges_Error()
    {
        $liftFilePath = self::$environ->createTestLiftFile(self::liftWithRangesV0_13, 'LiftWithRangesV0_13.lift');
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $mergeRule = LiftMergeRule::IMPORT_WINS;
        $skipSameModTime = false;

        $importer = LiftImport::get()->merge($liftFilePath, $project, $mergeRule, $skipSameModTime);

        $report = $importer->getReport();
        $reportStr = $report->toString();
        $this->assertEquals(true, $report->hasError());
        $this->assertRegExp("/range file 'TestLangProj.lift-ranges' was not found alongside the 'LiftWithRangesV0_13.lift' file/", $reportStr);
        $this->assertNotRegExp("/the lift range 'anthro-code' was not found in the current file/", $reportStr);
    }

    public function testLiftImportMerge_NoExistingDataFrenchInputSystem_OnlyImportedInputSystems()
    {
        $liftFilePath = self::$environ->createTestLiftFile(self::liftTwoEntriesCorrectedV0_13, 'TwoEntriesCorrectedV0_13.lift');
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $mergeRule = LiftMergeRule::IMPORT_WINS;
        $skipSameModTime = false;

        $project->inputSystems->exchangeArray(array());
        $project->inputSystems['fr'] = new InputSystem('fr', 'French', 'fr');

        $this->assertArrayHasKey('fr', $project->inputSystems);
        $this->assertArrayNotHasKey('en', $project->inputSystems);
        $this->assertArrayNotHasKey('th', $project->inputSystems);
        $this->assertArrayNotHasKey('th-fonipa', $project->inputSystems);

        LiftImport::get()->merge($liftFilePath, $project, $mergeRule, $skipSameModTime);

        $entryList = new LexEntryListModel($project);
        $entryList->read();

        $this->assertEquals(2, $entryList->count);
        $this->assertEquals(3, $project->inputSystems->count());
        $this->assertArrayNotHasKey('fr', $project->inputSystems);
        $this->assertArrayHasKey('en', $project->inputSystems);
        $this->assertArrayHasKey('th', $project->inputSystems);
        $this->assertArrayHasKey('th-fonipa', $project->inputSystems);
    }

    // lift with no entries
    const liftNoEntriesV0_13 = <<<EOD
<?xml version="1.0" encoding="UTF-8" ?>
<lift producer="SIL.FLEx 8.1.1.41891" version="0.13">
</lift>
EOD;

    public function testLiftImportMerge_NoExistingDataNoImportEntries_DefaultInputSystemsUnchangedAndConfigFieldInputSystemsCleared()
    {
        $liftFilePath = self::$environ->createTestLiftFile(self::liftNoEntriesV0_13, 'LiftNoEntriesV0_13.lift');
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $mergeRule = LiftMergeRule::IMPORT_WINS;
        $skipSameModTime = false;

        $this->assertArrayHasKey('en', $project->inputSystems);
        $this->assertArrayHasKey('th', $project->inputSystems);

        LiftImport::get()->merge($liftFilePath, $project, $mergeRule, $skipSameModTime);

        $entryList = new LexEntryListModel($project);
        $entryList->read();

        $this->assertEquals(0, $entryList->count);
        $this->assertEquals(2, $project->inputSystems->count());
        $this->assertArrayHasKey('en', $project->inputSystems);
        $this->assertArrayHasKey('th', $project->inputSystems);

        $this->assertEquals(0, $project->config->entry->fields[LexConfig::LEXEME]->inputSystems->count());
        $this->assertEquals(0, $project->config->entry->fields[LexConfig::CITATIONFORM]->inputSystems->count());
        $this->assertEquals(0, $project->config->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::DEFINITION]->inputSystems->count());
        $this->assertEquals(0, $project->config->entry->fields[LexConfig::SENSES_LIST]->fields[LexConfig::EXAMPLES_LIST]->fields[LexConfig::EXAMPLE_SENTENCE]->inputSystems->count());
    }

    // has correct th-fonipa form in entry and mod date changed
    // has custom field with MultiPara
    const liftOneEntryMultiParaV0_13 = <<<EOD
<?xml version="1.0" encoding="utf-8"?>
<lift
    version="0.13"
    producer="SIL.FLEx 8.0.9.41689">
    <header>
        <fields>
            <field tag="Cust MultiPara">
                <form lang="en"><text></text></form>
                <form lang="qaa-x-spec"><text>Class=LexEntry; Type=OwningAtom; WsSelector=kwsAnal; DstCls=StText</text></form>
            </field>
        </fields>
    </header>
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
        <field type="Cust MultiPara">
            <form lang="en"><text><span lang="en">First paragraph with </span><span lang="th">ไทย</span> <span lang="en">Second Paragraph</span></text></form>
        </field>
    </entry>
</lift>
EOD;

    public function testLiftImportMerge_MultiPara_ParagraphMarkerFound()
    {
        $liftFilePath = self::$environ->createTestLiftFile(self::liftOneEntryMultiParaV0_13, 'LiftOneEntryMultiParaV0_13.lift');
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $mergeRule = LiftMergeRule::IMPORT_WINS;
        $skipSameModTime = false;

        LiftImport::get()->merge($liftFilePath, $project, $mergeRule, $skipSameModTime);

        $entryList = new LexEntryListModel($project);
        $entryList->read();
        $entry0 = $entryList->entries[0];

        $this->assertEquals(1, $entryList->count);
        $this->assertArrayHasKey('customField_entry_Cust_MultiPara', $entry0['customFields'], 'custom field MultiPara exists');
        $this->assertEquals('First paragraph with <span lang="th">ไทย</span>',
            $entry0['customFields']['customField_entry_Cust_MultiPara']['paragraphs'][0]['content'],
            'custom field MultiPara has paragraphs separated into paragraph 1 and native language spans removed');
        $this->assertEquals('Second Paragraph',
            $entry0['customFields']['customField_entry_Cust_MultiPara']['paragraphs'][1]['content'],
            'custom field MultiPara has paragraphs separated into paragraph 2 and native language spans removed');
    }


    // has range elements defined in the file rather than in external file
    const liftDataWithInlineRanges = <<<EOD
<?xml version="1.0" encoding="UTF-8" ?>
<?oxygen RNGSchema="lift.rng" type="xml"?>
<?blueprint schema="lift.rng"?>

<lift version="0.13" producer="LexiquePro.3.6">

 <header>
  <ranges>
  <range id="dialect">
   <range-element id="fr">
    <label>
     <form lang="en"><text>French</text></form>
    </label>
    <abbrev>
    </abbrev>
   </range-element>
   <range-element id="en">
    <label>
     <form lang="en"><text>English</text></form>
     <form lang="fr"><text>anglais</text></form>
     <form lang="es"><text>Inglés</text></form>
     <form lang="pt"><text>Inglês</text></form>
     <form lang="bg"><text>английски</text></form>
    </label>
    <abbrev>
    </abbrev>
   </range-element>
  </range>
  <range id="semantic-domain">
  </range>
  </ranges>
 </header>

 <entry id="a_c1eb9393-beeb-4098-9479-2cc69b689798" guid="5937b605-501e-450d-85b7-993baab79560">
  <lexical-unit>
   <form lang="fr"><text>a</text></form>
  </lexical-unit>

  <sense id="has (in the sense of possessing); has (past marker)_2e5346f1-fed7-4baa-9df1-d3489b296064">
   <grammatical-info value="prep"/>
   <gloss lang="en"><text>has (in the sense of possessing)</text></gloss>
   <gloss lang="en"><text>has (past marker)</text></gloss>
  </sense>
 </entry>
</lift>
EOD;

    public function testLiftImportMerge_InlineRanges_GetsInputSystems()
    {
        $liftFilePath = self::$environ->createTestLiftFile(self::liftDataWithInlineRanges, 'LiftDataWithInlineRanges.lift');
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $mergeRule = LiftMergeRule::IMPORT_WINS;
        $skipSameModTime = false;

        LiftImport::get()->merge($liftFilePath, $project, $mergeRule, $skipSameModTime);

        $entryList = new LexEntryListModel($project);
        $entryList->read();

        // Input systems should be set from LIFT file: English and French but NOT Thai
        $this->assertEquals(2, $project->inputSystems->count());
        $this->assertArrayHasKey('en', $project->inputSystems);
        $this->assertArrayHasKey('fr', $project->inputSystems);
        $this->assertArrayNotHasKey('th', $project->inputSystems);
    }

    public function testLiftImportMerge_MultipleGlossesInOneSense_AreSemicolonSeparated()
    {
        $liftFilePath = self::$environ->createTestLiftFile(self::liftDataWithInlineRanges, 'LiftDataWithInlineRanges.lift');
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $mergeRule = LiftMergeRule::IMPORT_WINS;
        $skipSameModTime = false;

        LiftImport::get()->merge($liftFilePath, $project, $mergeRule, $skipSameModTime);

        $entryList = new LexEntryListModel($project);
        $entryList->read();

        // Entry should have both glosses in one sense
        $this->assertEquals(1, $entryList->count);
        $entry0 = $entryList->entries[0];
        $this->assertEquals('a', $entry0['lexeme']['fr']['value']);
        $this->assertCount(1, $entry0['senses']);
        $sense0 = $entry0['senses'][0];
        $this->assertCount(1, $sense0['gloss']);
        $this->assertEquals('has (in the sense of possessing); has (past marker)', $sense0['gloss']['en']['value']);
    }

    public function testLiftDecoderGetGuid()
    {
        $guid = Guid::extract('');
        $this->assertEquals('', $guid);

        $guid = Guid::extract('does not contain guid');
        $this->assertEquals('', $guid);

        $liftGuid = Guid::create();
        $guid = Guid::extract('lexeme_' . $liftGuid);
        $this->assertEquals($liftGuid, $guid);
    }
}
