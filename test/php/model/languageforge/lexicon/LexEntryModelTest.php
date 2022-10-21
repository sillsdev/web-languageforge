<?php

use Api\Model\Languageforge\Lexicon\LexAuthorInfo;
use Api\Model\Languageforge\Lexicon\LexEntryModel;
use Api\Model\Languageforge\Lexicon\LexMultiText;
use Api\Model\Languageforge\Lexicon\LexMultiValue;
use Api\Model\Languageforge\Lexicon\LexProjectModel;
use Api\Model\Languageforge\Lexicon\LexSense;
use Api\Model\Languageforge\Lexicon\LexValue;
use Api\Model\Shared\Mapper\ArrayOf;
use Api\Model\Shared\Mapper\MapOf;
use PHPUnit\Framework\TestCase;

class LexEntryModelTest extends TestCase
{
    public function testGetProperties_ConstructsCorrectTypes()
    {
        $environ = new MongoTestEnvironment();
        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $entry = new LexEntryModel($project);

        $this->assertInstanceOf(ArrayOf::class, $entry->senses);
        $this->assertInstanceOf(MapOf::class, $entry->customFields);
        $this->assertInstanceOf(LexAuthorInfo::class, $entry->authorInfo);
        $this->assertInstanceOf(LexMultiText::class, $entry->lexeme);
        $this->assertInstanceOf(LexMultiText::class, $entry->pronunciation);
        $this->assertInstanceOf(LexMultiText::class, $entry->cvPattern);
        $this->assertInstanceOf(LexMultiText::class, $entry->citationForm);
        $this->assertInstanceOf(LexMultiText::class, $entry->etymology);
        $this->assertInstanceOf(LexMultiText::class, $entry->etymologyGloss);
        $this->assertInstanceOf(LexMultiText::class, $entry->etymologyComment);
        $this->assertInstanceOf(LexMultiText::class, $entry->etymologySource);
        $this->assertInstanceOf(LexMultiText::class, $entry->note);
        $this->assertInstanceOf(LexMultiText::class, $entry->literalMeaning);
        $this->assertInstanceOf(LexMultiText::class, $entry->entryBibliography);
        $this->assertInstanceOf(LexMultiText::class, $entry->entryRestrictions);
        $this->assertInstanceOf(LexMultiText::class, $entry->summaryDefinition);
        // Removed import residue. Its no longer a field we import CP 2014-10
        // $this->assertInstanceOf(LexMultiText::class, $entry->entryImportResidue);
        $this->assertInstanceOf(LexMultiText::class, $entry->tone);
        $this->assertInstanceOf(LexMultiValue::class, $entry->environments);
        $this->assertInstanceOf(LexValue::class, $entry->location);
    }

    public function createEntry(LexProjectModel $projectModel, array $params)
    {
        $vernacularWs = $params["vernacularWs"] ?? "fr";
        $analysisWs = $params["analysisWs"] ?? "en";
        $entry = new LexEntryModel($projectModel);

        if (isset($params["word"])) {
            $entry->lexeme->form($vernacularWs, $params["word"]);
        }
        if (isset($params["cite"])) {
            $entry->citationForm->form($vernacularWs, $params["cite"]);
        }
        if (isset($params["tone"])) {
            $entry->tone->form($analysisWs, $params["tone"]);
        }
        if (isset($params["etymology"])) {
            $entry->etymology->form($vernacularWs, $params["etymology"]);
        }

        $sense = new LexSense();
        if (isset($params["meaning"])) {
            $sense->definition->form($analysisWs, $params["meaning"]);
        }
        if (isset($params["gloss"])) {
            $sense->gloss->form($analysisWs, $params["gloss"]);
        }
        if (isset($params["note"])) {
            $sense->generalNote->form($analysisWs, $params["note"]);
        }
        $entry->senses->append($sense);

        if (isset($params["meaning2"]) || isset($params["gloss2"]) || isset($params["note2"])) {
            $sense2 = new LexSense();
            if (isset($params["meaning2"])) {
                $sense2->definition->form($analysisWs, $params["meaning2"]);
            }
            if (isset($params["gloss2"])) {
                $sense2->gloss->form($analysisWs, $params["gloss2"]);
            }
            if (isset($params["note2"])) {
                $sense2->generalNote->form($analysisWs, $params["note2"]);
            }
            $entry->senses->append($sense2);
        }
        // string $vernacularWs, string $analysisWs, string $word, string $citationForm, string $definition, string $gloss
        $entry->write();
        return $entry;
    }

    public function testGetDifferences_OneFieldChanged_ContainsOnlyThatChange()
    {
        $environ = new LexiconMongoTestEnvironment();
        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        $entry = $this->createEntry($project, [
            "vernacularWs" => "fr",
            "anaylsisWs" => "en",
            "word" => "bonjour",
            "meaning" => "hello",
            "gloss" => "hello",
        ]);
        $entry2 = new LexEntryModel($project, $entry->id->asString());
        /** @var LexSense $sense */
        $sense = $entry2->senses[0];
        $sense->definition->form("en", "hi there");
        $guid = $sense->guid;

        $differences = $entry->calculateDifferences($entry2);
        $this->assertEquals(
            [
                "oldValue.senses@0#$guid.definition.en" => "hello",
                "newValue.senses@0#$guid.definition.en" => "hi there",
            ],
            $differences
        );
    }

    public function testGetDifferences_NullField_DoesNotThrowException()
    {
        $environ = new LexiconMongoTestEnvironment();
        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        $entry = $this->createEntry($project, [
            "vernacularWs" => "fr",
            "anaylsisWs" => "en",
            "word" => "bonjour",
            "meaning" => "hello",
            "gloss" => "hello",
        ]);
        $entry2 = new LexEntryModel($project, $entry->id->asString());
        /** @var LexSense $sense */
        $sense = $entry2->senses[0];
        $sense->definition->form("en", "hi there");
        $sense->senseType->value = null;
        $guid = $sense->guid;

        $differences = $entry->calculateDifferences($entry2);
        $this->assertEquals(
            [
                "oldValue.senses@0#$guid.definition.en" => "hello",
                "newValue.senses@0#$guid.definition.en" => "hi there",
            ],
            $differences
        );
    }

    public function testGetDifferences_TwoFieldsChanged_ContainsBothChanges()
    {
        $environ = new LexiconMongoTestEnvironment();
        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        $entry = $this->createEntry($project, [
            "vernacularWs" => "fr",
            "anaylsisWs" => "en",
            "word" => "bonjour",
            "meaning" => "hello",
            "gloss" => "hello",
        ]);
        $entry2 = new LexEntryModel($project, $entry->id->asString());
        /** @var LexSense $sense */
        $sense = $entry2->senses[0];
        $sense->definition->form("en", "hi there");
        $sense->gloss->form("en", "hi");
        $guid = $sense->guid;

        $differences = $entry->calculateDifferences($entry2);
        $this->assertEquals(
            [
                "oldValue.senses@0#$guid.definition.en" => "hello",
                "newValue.senses@0#$guid.definition.en" => "hi there",
                "oldValue.senses@0#$guid.gloss.en" => "hello",
                "newValue.senses@0#$guid.gloss.en" => "hi",
            ],
            $differences
        );
    }

    public function testGetDifferences_TwoFieldsChangedButOneChangedToTheOriginalValue_ContainsOnlyOneChange()
    {
        $environ = new LexiconMongoTestEnvironment();
        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        $entry = $this->createEntry($project, [
            "vernacularWs" => "fr",
            "anaylsisWs" => "en",
            "word" => "bonjour",
            "meaning" => "hello",
            "gloss" => "hello",
        ]);
        $entry2 = new LexEntryModel($project, $entry->id->asString());
        /** @var LexSense $sense */
        $sense = $entry2->senses[0];
        $sense->definition->form("en", "hi there");
        $sense->gloss->form("en", "hello");
        $guid = $sense->guid;

        $differences = $entry->calculateDifferences($entry2);
        $this->assertEquals(
            [
                "oldValue.senses@0#$guid.definition.en" => "hello",
                "newValue.senses@0#$guid.definition.en" => "hi there",
            ],
            $differences
        );
    }

    public function testGetDifferences_DeletingSecondSense_DifferencesIncludeOnlyTheDeletionAsASingleChange()
    {
        $environ = new LexiconMongoTestEnvironment();
        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        $entry = $this->createEntry($project, [
            "vernacularWs" => "fr",
            "anaylsisWs" => "en",
            "word" => "bonjour",
            "meaning" => "hello",
            "meaning2" => "hi",
        ]);
        $entry2 = new LexEntryModel($project, $entry->id->asString());
        /** @var LexSense $sense */
        $sense1 = $entry2->senses[0];
        $guid1 = $sense1->guid;
        $sense2 = $entry2->senses[1];
        $guid2 = $sense2->guid;
        $entry2->senses = new ArrayOf("Api\Model\Languageforge\Lexicon\generateSense");
        $entry2->senses->append($sense1);

        $differences = $entry->calculateDifferences($entry2);
        $this->assertEquals(
            [
                "deleted.senses@1#$guid2" => "hi",
                "oldValue.senses@1#$guid2.definition.en" => "hi",
                "newValue.senses@1#$guid2.definition.en" => "",
            ],
            $differences
        );
    }

    public function testGetDifferences_DeletingFirstSense_DifferencesIncludeTheDeletionAndPositionChanges()
    {
        $environ = new LexiconMongoTestEnvironment();
        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        $entry = $this->createEntry($project, [
            "vernacularWs" => "fr",
            "anaylsisWs" => "en",
            "word" => "bonjour",
            "meaning" => "hello",
            "meaning2" => "hi",
        ]);
        $entry2 = new LexEntryModel($project, $entry->id->asString());
        /** @var LexSense $sense */
        $sense1 = $entry2->senses[0];
        $guid1 = $sense1->guid;
        $sense2 = $entry2->senses[1];
        $guid2 = $sense2->guid;
        $entry2->senses = new ArrayOf("Api\Model\Languageforge\Lexicon\generateSense");
        $entry2->senses->append($sense2);

        $differences = $entry->calculateDifferences($entry2);
        $this->assertEquals(
            [
                "deleted.senses@0#$guid1" => "hello",
                "oldValue.senses@0#$guid1.definition.en" => "hello",
                "newValue.senses@0#$guid1.definition.en" => "",
                "moved.senses@1#$guid2" => 0,
            ],
            $differences
        );
    }

    public function testGetDifferences_DeletingBothSenses_DifferencesIncludeOnlyTheTwoDeletions()
    {
        $environ = new LexiconMongoTestEnvironment();
        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        $entry = $this->createEntry($project, [
            "vernacularWs" => "fr",
            "anaylsisWs" => "en",
            "word" => "bonjour",
            "meaning" => "hello",
            "meaning2" => "hi",
        ]);
        $entry2 = new LexEntryModel($project, $entry->id->asString());
        /** @var LexSense $sense */
        $sense1 = $entry2->senses[0];
        $guid1 = $sense1->guid;
        $sense2 = $entry2->senses[1];
        $guid2 = $sense2->guid;
        $entry2->senses = new ArrayOf("Api\Model\Languageforge\Lexicon\generateSense");

        $differences = $entry->calculateDifferences($entry2);
        $this->assertEquals(
            [
                "deleted.senses@0#$guid1" => "hello",
                "oldValue.senses@0#$guid1.definition.en" => "hello",
                "newValue.senses@0#$guid1.definition.en" => "",
                "deleted.senses@1#$guid2" => "hi",
                "oldValue.senses@1#$guid2.definition.en" => "hi",
                "newValue.senses@1#$guid2.definition.en" => "",
            ],
            $differences
        );
    }
}
