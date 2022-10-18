<?php

use Api\Model\Languageforge\Lexicon\Import\LiftImport;
use Api\Model\Languageforge\Lexicon\Import\LiftMergeRule;
use Api\Model\Languageforge\Lexicon\LexEntryListModel;
use Api\Model\Languageforge\Lexicon\LexEntryModel;
use Api\Model\Languageforge\Lexicon\LexExample;
use Api\Model\Languageforge\Lexicon\LexMultiValue;
use Api\Model\Languageforge\Lexicon\LexPicture;
use Api\Model\Languageforge\Lexicon\LexSense;
use Api\Model\Languageforge\Lexicon\LexValue;
use PHPUnit\Framework\TestCase;

class LiftImportFlexTest extends TestCase
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

    const liftAllFlexFields = <<<EOD
<lift producer="SIL.FLEx 8.0.9.41689" version="0.13">
<header>
<ranges>
<range id="dialect" href="file://C:/src/ScriptureForge/sfwebchecks/docs/lift/AllFLExFields/AllFLExFields.lift-ranges"/>
<range id="etymology" href="file://C:/src/ScriptureForge/sfwebchecks/docs/lift/AllFLExFields/AllFLExFields.lift-ranges"/>
<range id="grammatical-info" href="file://C:/src/ScriptureForge/sfwebchecks/docs/lift/AllFLExFields/AllFLExFields.lift-ranges"/>
<range id="lexical-relation" href="file://C:/src/ScriptureForge/sfwebchecks/docs/lift/AllFLExFields/AllFLExFields.lift-ranges"/>
<range id="note-type" href="file://C:/src/ScriptureForge/sfwebchecks/docs/lift/AllFLExFields/AllFLExFields.lift-ranges"/>
<range id="paradigm" href="file://C:/src/ScriptureForge/sfwebchecks/docs/lift/AllFLExFields/AllFLExFields.lift-ranges"/>
<range id="reversal-type" href="file://C:/src/ScriptureForge/sfwebchecks/docs/lift/AllFLExFields/AllFLExFields.lift-ranges"/>
<range id="semantic-domain-ddp4" href="file://C:/src/ScriptureForge/sfwebchecks/docs/lift/AllFLExFields/AllFLExFields.lift-ranges"/>
<range id="status" href="file://C:/src/ScriptureForge/sfwebchecks/docs/lift/AllFLExFields/AllFLExFields.lift-ranges"/>
<range id="users" href="file://C:/src/ScriptureForge/sfwebchecks/docs/lift/AllFLExFields/AllFLExFields.lift-ranges"/>
<range id="location" href="file://C:/src/ScriptureForge/sfwebchecks/docs/lift/AllFLExFields/AllFLExFields.lift-ranges"/>
<!-- The following ranges are produced by FieldWorks Language Explorer, and are not part of the LIFT standard. -->
<range id="anthro-code" href="file://C:/src/ScriptureForge/sfwebchecks/docs/lift/AllFLExFields/AllFLExFields.lift-ranges"/>
<range id="translation-type" href="file://C:/src/ScriptureForge/sfwebchecks/docs/lift/AllFLExFields/AllFLExFields.lift-ranges"/>
<!-- The parts of speech are duplicated in another range because derivational affixes require a "From" PartOfSpeech as well as a "To" PartOfSpeech. -->
<range id="from-part-of-speech" href="file://C:/src/ScriptureForge/sfwebchecks/docs/lift/AllFLExFields/AllFLExFields.lift-ranges"/>
<range id="morph-type" href="file://C:/src/ScriptureForge/sfwebchecks/docs/lift/AllFLExFields/AllFLExFields.lift-ranges"/>
<range id="exception-feature" href="file://C:/src/ScriptureForge/sfwebchecks/docs/lift/AllFLExFields/AllFLExFields.lift-ranges"/>
<range id="inflection-feature" href="file://C:/src/ScriptureForge/sfwebchecks/docs/lift/AllFLExFields/AllFLExFields.lift-ranges"/>
<range id="inflection-feature-type" href="file://C:/src/ScriptureForge/sfwebchecks/docs/lift/AllFLExFields/AllFLExFields.lift-ranges"/>
<range id="do-not-publish-in" href="file://C:/src/ScriptureForge/sfwebchecks/docs/lift/AllFLExFields/AllFLExFields.lift-ranges"/>
<range id="domain-type" href="file://C:/src/ScriptureForge/sfwebchecks/docs/lift/AllFLExFields/AllFLExFields.lift-ranges"/>
<range id="sense-type" href="file://C:/src/ScriptureForge/sfwebchecks/docs/lift/AllFLExFields/AllFLExFields.lift-ranges"/>
<range id="usage-type" href="file://C:/src/ScriptureForge/sfwebchecks/docs/lift/AllFLExFields/AllFLExFields.lift-ranges"/>
</ranges>
<fields>
<field tag="cv-pattern">
<form lang="en"><text>This records the syllable pattern for a LexPronunciation in FieldWorks.</text></form>
</field>
<field tag="tone">
<form lang="en"><text>This records the tone information for a LexPronunciation in FieldWorks.</text></form>
</field>
<field tag="comment">
<form lang="en"><text>This records a comment (note) in a LexEtymology in FieldWorks.</text></form>
</field>
<field tag="import-residue">
<form lang="en"><text>This records residue left over from importing a standard format file into FieldWorks (or LinguaLinks).</text></form>
</field>
<field tag="literal-meaning">
<form lang="en"><text>This field is used to store a literal meaning of the entry.  Typically, this field is necessary only for a compound or an idiom where the meaning of the whole is different from the sum of its parts.</text></form>
</field>
<field tag="summary-definition">
<form lang="en"><text>A summary definition (located at the entry level in the Entry pane) is a general definition summarizing all the senses of a primary entry. It has no theoretical value; its use is solely pragmatic.</text></form>
</field>
<field tag="scientific-name">
<form lang="en"><text>This field stores the scientific name pertinent to the current sense.</text></form>
</field>
</fields>
</header>
<entry dateCreated="2014-09-25T09:13:41Z" dateModified="2014-09-25T10:10:31Z" id="คาม_0a18bb95-0eb2-422e-bf7e-c1fd90274670" guid="0a18bb95-0eb2-422e-bf7e-c1fd90274670">
<lexical-unit>
<form lang="th"><text>คาม</text></form>
</lexical-unit>
<trait  name="morph-type" value="stem"/>
<citation>
<form lang="th"><text>คาม</text></form>
</citation>
<note type="bibliography">
<form lang="en"><text>A Bibliography</text></form>
</note>
<note>
<form lang="en"><text>A Note</text></form>
</note>
<field type="literal-meaning">
<form lang="en"><text>A Literal Meaning</text></form>
</field>
<note type="restrictions">
<form lang="en"><text>A Restrictions</text></form>
</note>
<field type="summary-definition">
<form lang="en"><text>A Summary Defn</text></form>
</field>
<field type="import-residue">
<form lang="en"><text>A Import Residue</text></form>
</field>
<etymology type="proto" source="A Etymology Source">
<form lang="th"><text>คาม</text></form>
<form lang="en"><text>A Etymology</text></form>
<gloss lang="en"><text>A Etymology Gloss</text></gloss>
<field type="comment">
<form lang="en"><text>A Etymology Comment</text></form>
</field>
</etymology>
<relation type="_component-lexeme" ref="คาม ๒_dc4106ac-13fd-4ae0-a32b-b737f413d515" order="0">
<trait  name="variant-type" value="Dialectal Variant"/>
<field type="summary">
<form lang="en"><text>Secondary relationship</text></form>
</field>
</relation>
<pronunciation>
<form lang="th"><text>คาม</text></form>
<media href="Kalimba.mp3">
</media><field type="cv-pattern">
<form lang="en"><text>A CV Pattern</text></form>
</field>
<field type="tone">
<form lang="en"><text>Mid</text></form>
</field>
</pronunciation>
<sense id="aa7fce82-adf5-42f0-a22f-7b8394d48b86">
<grammatical-info value="Noun">
</grammatical-info>
<gloss lang="en"><text>A Word</text></gloss>
<definition>
<form lang="en"><text>A Word Defn</text></form>
</definition>
<example>
<form lang="th"><text>ใหท่ มี</text></form>
<translation type="Free translation">
<form lang="en"><text>A Translation</text></form>
</translation>
</example>
<trait name ="semantic-domain-ddp4" value="9.1.3.1 Physical, non-physical"/>
<note type="anthropology">
<form lang="en"><text>A Anthropology Note</text></form>
</note>
<note type="bibliography">
<form lang="en"><text>A Sense Biliography</text></form>
</note>
<note type="discourse">
<form lang="en"><text>A Discourse Note</text></form>
</note>
<note type="encyclopedic">
<form lang="en"><text>A <span href="http://angular.github.io/" class="Hyperlink">Encylopdeic</span> Info</text></form>
</note>
<note>
<form lang="en"><text>A General Note</text></form>
</note>
<note type="grammar">
<form lang="en"><text>A Grammar Note</text></form>
</note>
<field type="import-residue">
<form lang="en"><text>A Sense Import Resdue</text></form>
</field>
<note type="phonology">
<form lang="en"><text>A Phonolgy Note</text></form>
</note>
<note type="restrictions">
<form lang="en"><text>A Restrictions</text></form>
</note>
<field type="scientific-name">
<form lang="en"><text>A Scientific Name</text></form>
</field>
<note type="semantics">
<form lang="en"><text>A Semantics Note</text></form>
</note>
<note type="sociolinguistics">
<form lang="en"><text>A Sociolinguistics Note<span href="file://others/Hydrangeas.jpg" class="Hyperlink">C:\ProgramData\SIL\FieldWorks\Projects\AllFLExFields\LinkedFiles\Others\Hydrangeas.jpg</span></text></form>
</note>
<note type="source">
<form lang="en"><text>A Sense Source</text></form>
</note>
<trait  name="anthro-code" value="901"/>
<trait  name="domain-type" value="applied linguistics"/>
<reversal type="en"><form lang="en"><text>A Reversal Entries</text></form>
</reversal>
<trait  name="sense-type" value="primary"/>
<trait  name="status" value="Tentative"/>
<trait  name="usage-type" value="colloquial"/>
<illustration href="Desert.jpg">
<label>
<form lang="th"><text>รูป</text></form>
<form lang="en"><text>image</text></form>
<form lang="fr"><text>photo</text></form>
</label>
</illustration></sense>
</entry>
<entry dateCreated="2014-09-25T09:40:25Z" dateModified="2014-09-25T09:46:34Z" id="คาม ๒_dc4106ac-13fd-4ae0-a32b-b737f413d515" guid="dc4106ac-13fd-4ae0-a32b-b737f413d515">
<lexical-unit>
<form lang="th"><text>คาม ๒</text></form>
</lexical-unit>
<trait  name="morph-type" value="phrase"/>
<relation type="_component-lexeme" ref="aa7fce82-adf5-42f0-a22f-7b8394d48b86" order="0">
<trait name="is-primary" value="true"/>
<trait name="complex-form-type" value=""/>
</relation>
<relation type="_component-lexeme" ref="คาม_0a18bb95-0eb2-422e-bf7e-c1fd90274670" order="1">
<trait name="is-primary" value="true"/>
<trait name="complex-form-type" value=""/>
</relation>
<sense id="9335e15c-7efa-49ad-8a37-42b5b2db8ee3">
<grammatical-info value="Verb">
</grammatical-info>
<gloss lang="en"><text>B Word</text></gloss>
</sense>
</entry>
</lift>
EOD;

    public function testLiftImportMerge_FlexAllFields_HasAllFields()
    {
        $liftFilePath = self::$environ->createTestLiftFile(self::liftAllFlexFields, "LiftAllFlexFields.lift");
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $mergeRule = LiftMergeRule::IMPORT_WINS;
        $skipSameModTime = false;

        LiftImport::get()->merge($liftFilePath, $project, $mergeRule, $skipSameModTime);

        $entryList = new LexEntryListModel($project);
        $entryList->read();

        $entries = $entryList->entries;
        $this->assertEquals(2, $entryList->count);
        $entriesByGuid = self::$environ->indexItemsBy($entries, "guid");

        $entry0 = new LexEntryModel($project, $entriesByGuid["0a18bb95-0eb2-422e-bf7e-c1fd90274670"]["id"]);
        new LexEntryModel($project, $entriesByGuid["dc4106ac-13fd-4ae0-a32b-b737f413d515"]["id"]);

        $this->assertEquals("0a18bb95-0eb2-422e-bf7e-c1fd90274670", $entry0->guid);
        $this->assertEquals("คาม", $entry0->lexeme["th"]);
        $this->assertEquals("คาม", $entry0->citationForm["th"]);
        $this->assertEquals("คาม", $entry0->etymology["th"]);
        $this->assertEquals("A Etymology", $entry0->etymology["en"]);
        $this->assertEquals("A Etymology Gloss", $entry0->etymologyGloss["en"]);
        $this->assertEquals("A Etymology Comment", $entry0->etymologyComment["en"]);
        $this->assertEquals("คาม", $entry0->pronunciation["th"]);
        $this->assertEquals("stem", $entry0->morphologyType);
        $this->assertEquals("A Literal Meaning", $entry0->literalMeaning["en"]);

        /* @var $sense00 LexSense */
        $sense00 = $entry0->senses[0];

        $this->assertEquals("Noun", $sense00->partOfSpeech->value);
        $this->assertEquals("A Word", $sense00->gloss["en"]->value);
        $this->assertEquals("A Word Defn", $sense00->definition["en"]->value);
        $this->assertEquals(LexMultiValue::createFromArray(["9.1.3.1"]), $sense00->semanticDomain);
        $this->assertEquals(LexMultiValue::createFromArray(["901"]), $sense00->anthropologyCategories);
        $this->assertEquals(LexMultiValue::createFromArray(["applied linguistics"]), $sense00->academicDomains);
        $this->assertEquals(new LexValue("primary"), $sense00->senseType);
        $this->assertEquals(LexMultiValue::createFromArray(["Tentative"]), $sense00->status);
        $this->assertEquals(LexMultiValue::createFromArray(["colloquial"]), $sense00->usages);

        $expected = new LexPicture("Desert.jpg", $sense00->pictures[0]->guid);
        $expected->caption["th"] = "รูป";
        $expected->caption["en"] = "image";
        $expected->caption["fr"] = "photo";
        $this->assertEquals($expected, $sense00->pictures[0]);

        /* @var $example000 LexExample */
        $example000 = $sense00->examples[0];
        $this->assertEquals("ใหท่ มี", $example000->sentence["th"]);
        $this->assertEquals("A Translation", $example000->translation["en"]->value);
    }
}
