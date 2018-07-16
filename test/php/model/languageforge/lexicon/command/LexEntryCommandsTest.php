<?php

use Api\Model\Languageforge\Lexicon\Command\LexEntryCommands;
use Api\Model\Languageforge\Lexicon\Config\LexConfig;
use Api\Model\Languageforge\Lexicon\LexExample;
use Api\Model\Languageforge\Lexicon\Guid;
use Api\Model\Languageforge\Lexicon\LexEntryModel;
use Api\Model\Languageforge\Lexicon\LexPicture;
use Api\Model\Languageforge\Lexicon\LexSense;
use Api\Model\Shared\Command\ProjectCommands;
use Api\Model\Shared\Mapper\JsonEncoder;
use PHPUnit\Framework\TestCase;

class LexEntryCommandsTest extends TestCase
{
    /** @var LexiconMongoTestEnvironment Local store of mock test environment */
    private static $environ;

    public function setUp()
    {
        self::$environ = new LexiconMongoTestEnvironment();
        self::$environ->clean();
    }

    public function testLexEntryCrud_CreateUpdateDeleteListOk()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        // create an user and add to the project
        $userId = self::$environ->getProjectMember($projectId, 'user1');

        $entry = new LexEntryModel($project);
        $entry->lexeme->form('th', 'SomeEntry');

        $sense = new LexSense();
        $sense->definition->form('en', 'red fruit');
        $sense->partOfSpeech->value = 'noun';

        $example = new LexExample();
        $example->sentence->form('th', 'example1');
        $example->translation->form('en', 'trans1');

        $sense->examples[] = $example;

        $entry->senses[] = $sense;

        // List
        $dto = LexEntryCommands::listEntries($projectId);
        $this->assertEquals(0, $dto->count);

        // Create
        $params = JsonEncoder::encode($entry);
        $result1 = LexEntryCommands::updateEntry($projectId, $params, $userId);
        $entryId = $result1['id'];
        $this->assertNotNull($entryId);
        $this->assertEquals(24, strlen($entryId));

        // Read
        $result2 = LexEntryCommands::readEntry($projectId, $entryId);
        $this->assertNotNull($result2['id']);
        $this->assertEquals('SomeEntry', $result2['lexeme']['th']['value']);

        // Update
        $result2['lexeme']['th']['value'] = 'OtherEntry';
        $result3 = LexEntryCommands::updateEntry($projectId, $result2, $userId);
        $this->assertNotNull($result3);
        $this->assertEquals($entryId, $result3['id']);

        // Read back
        $result4 = LexEntryCommands::readEntry($projectId, $entryId);
        $this->assertNotNull($result4['id']);
        $this->assertEquals('OtherEntry', $result4['lexeme']['th']['value']);

        // List
        $dto = LexEntryCommands::listEntries($projectId);
        $this->assertEquals(1, $dto->count);

        // Delete
        $result5 = LexEntryCommands::removeEntry($projectId, $entryId, $userId);
        $this->assertTrue($result5);

        // List to confirm delete
        $dto = LexEntryCommands::listEntries($projectId);
        $this->assertEquals(0, $dto->count);

        // Clean up after ourselves
        ProjectCommands::deleteProjects(array($projectId), $project->ownerRef->asString());
    }

    public function testReadEntry_ReadBackOk()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $entry = new LexEntryModel($project);
        $entry->lexeme->form('th', 'apple');

        $sense = new LexSense();
        $sense->definition->form('en', 'red fruit');
        $sense->partOfSpeech->value = 'noun';

        $example = new LexExample();
        $example->sentence->form('th', 'example1');
        $example->translation->form('en', 'trans1');

        $sense->examples[] = $example;

        $entry->senses[] = $sense;

        $entryId = $entry->write();

        $newEntry = LexEntryCommands::readEntry($projectId, $entryId);

        $this->assertEquals('apple', $newEntry['lexeme']['th']['value']);
        $this->assertEquals('red fruit', $newEntry['senses'][0]['definition']['en']['value']);
        $this->assertEquals('noun', $newEntry['senses'][0]['partOfSpeech']['value']);
        $this->assertEquals('example1', $newEntry['senses'][0]['examples'][0]['sentence']['th']['value']);
        $this->assertEquals('trans1', $newEntry['senses'][0]['examples'][0]['translation']['en']['value']);

    }

    public function testUpdateEntry_DataPersists()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $userId = self::$environ->createUser('john', 'john', 'john');

        $exampleGuid = Guid::create();
        $example = new LexExample($exampleGuid, $exampleGuid);
        $example->sentence->form('th', 'example1');
        $example->translation->form('en', 'trans1');

        $pictureGuid = Guid::create();
        $picture = new LexPicture('someFilename', $pictureGuid);

        $senseGuid = Guid::create();
        $sense = new LexSense($senseGuid, $senseGuid);
        $sense->definition->form('en', 'red fruit');
        $sense->gloss->form('en', 'rose fruit');
        $sense->partOfSpeech->value = 'noun';
        $sense->examples[] = $example;
        $sense->pictures[] = $picture;

        $entry = new LexEntryModel($project);
        $entry->lexeme->form('th', 'apple');
        $entry->senses[] = $sense;
        $entryId = $entry->write();

        $params = json_decode(json_encode(LexEntryCommands::readEntry($projectId, $entryId)), true);
        $params['lexeme']['th']['value'] = 'rose apple';

        LexEntryCommands::updateEntry($projectId, $params, $userId);

        $newEntry = LexEntryCommands::readEntry($projectId, $entryId);

        $this->assertEquals('rose apple', $newEntry['lexeme']['th']['value']);
        $this->assertEquals($senseGuid, $newEntry['senses'][0]['guid']);
        $this->assertArrayNotHasKey('liftId', $newEntry['senses'][0], 'sense liftId should be private');
        $this->assertEquals('red fruit', $newEntry['senses'][0]['definition']['en']['value']);
        $this->assertEquals('rose fruit', $newEntry['senses'][0]['gloss']['en']['value']);
        $this->assertEquals('noun', $newEntry['senses'][0]['partOfSpeech']['value']);
        $this->assertEquals($exampleGuid, $newEntry['senses'][0]['examples'][0]['guid']);
        $this->assertEquals($pictureGuid, $newEntry['senses'][0]['pictures'][0]['guid']);
        // $this->assertArrayNotHasKey('scientificName', $newEntry['senses'][0], 'should be no empty fields');  // Commented out 2018-02 by RM until the Mongo changes are merged into master
        $this->assertArrayNotHasKey('liftId', $newEntry['senses'][0]['examples'][0], 'example liftId should be private');
        $this->assertEquals('example1', $newEntry['senses'][0]['examples'][0]['sentence']['th']['value']);
        $this->assertEquals('trans1', $newEntry['senses'][0]['examples'][0]['translation']['en']['value']);
    }

    public function testUpdateEntry_ClearedData_DataIsCleared()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $entry = new LexEntryModel($project);
        $entry->lexeme->form('th', 'apple');
        $entryId = $entry->write();

        $params = json_decode(json_encode(LexEntryCommands::readEntry($projectId, $entryId)), true);
        $params['lexeme']['th']['value'] = '';

        $userId = self::$environ->createUser('john', 'john', 'john');

        LexEntryCommands::updateEntry($projectId, $params, $userId);

        $updatedEntry = LexEntryCommands::readEntry($projectId, $entryId);
        $this->assertFalse(isset($updatedEntry['lexeme']['th']['value']));
    }

    public function testUpdateEntry_UpdateTwice_DifferencesAreCorrect()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $entry = new LexEntryModel($project);
        $entry->lexeme->form('th', 'apple');
        $entryId = $entry->write();

        $params = json_decode(json_encode(LexEntryCommands::readEntry($projectId, $entryId)), true);
        $params['lexeme']['th']['value'] = 'first edit';

        $userId = self::$environ->createUser('john', 'john', 'john');

        LexEntryCommands::updateEntry($projectId, $params, $userId);

        $updatedEntry = new LexEntryModel($project, $entryId);
        $differences = $entry->calculateDifferences($updatedEntry);
        $this->assertEquals(['oldValue.lexeme.th' => 'apple', 'newValue.lexeme.th' => 'first edit'], $differences);
        $withLabels = LexEntryCommands::addFieldLabelsToDifferences($project->config, $differences);
        $this->assertEquals(['oldValue.lexeme.th' => 'apple', 'newValue.lexeme.th' => 'first edit', 'fieldLabel.lexeme.th' => 'Word'], $withLabels);

        $params['lexeme']['th']['value'] = 'second edit';
        LexEntryCommands::updateEntry($projectId, $params, $userId);

        $secondUpdatedEntry = new LexEntryModel($project, $entryId);
        $differences = $updatedEntry->calculateDifferences($secondUpdatedEntry);
        $this->assertEquals(['oldValue.lexeme.th' => 'first edit', 'newValue.lexeme.th' => 'second edit'], $differences);
        $withLabels = LexEntryCommands::addFieldLabelsToDifferences($project->config, $differences);
        $this->assertEquals(['oldValue.lexeme.th' => 'first edit', 'newValue.lexeme.th' => 'second edit', 'fieldLabel.lexeme.th' => 'Word'], $withLabels);
    }

    public function testUpdateEntry_UpdateWithNull_DifferencesHasEmptyStringInsteadOfNull()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $entry = new LexEntryModel($project);
        $entry->lexeme->form('th', 'apple');
        $entryId = $entry->write();

        $params = json_decode(json_encode(LexEntryCommands::readEntry($projectId, $entryId)), true);
        $params['lexeme']['th']['value'] = null;

        $userId = self::$environ->createUser('john', 'john', 'john');

        LexEntryCommands::updateEntry($projectId, $params, $userId);

        $updatedEntry = new LexEntryModel($project, $entryId);
        $differences = $entry->calculateDifferences($updatedEntry);
        $this->assertEquals(['oldValue.lexeme.th' => 'apple', 'newValue.lexeme.th' => ''], $differences);
        $withLabels = LexEntryCommands::addFieldLabelsToDifferences($project->config, $differences);
        $this->assertEquals(['oldValue.lexeme.th' => 'apple', 'newValue.lexeme.th' => '', 'fieldLabel.lexeme.th' => 'Word'], $withLabels);
    }

    public function testUpdateEntry_DeleteSense_ProducesDifferencesForTheSenseAndAllItsFields()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $entry = new LexEntryModel($project);
        $entry->lexeme->form('th', 'apple');
        $sense = new LexSense();
        $sense->definition->form('en', 'apple');
        $entry->senses[] = $sense;
        $entryId = $entry->write();

        $params = json_decode(json_encode(LexEntryCommands::readEntry($projectId, $entryId)), true);
        $params['senses'] = [];

        $userId = self::$environ->createUser('john', 'john', 'john');

        LexEntryCommands::updateEntry($projectId, $params, $userId);

        $updatedEntry = new LexEntryModel($project, $entryId);
        $differences = $entry->calculateDifferences($updatedEntry);
        $this->assertEquals([
            'deleted.senses@0#'  . $sense->guid => 'apple',
            'oldValue.senses@0#' . $sense->guid . '.definition.en' => 'apple',
            'newValue.senses@0#' . $sense->guid . '.definition.en' => '',
        ], $differences);
        $withLabels = LexEntryCommands::addFieldLabelsToDifferences($project->config, $differences);
        $this->assertEquals([
            'deleted.senses@0#'    . $sense->guid => 'apple',
            'oldValue.senses@0#'   . $sense->guid . '.definition.en' => 'apple',
            'newValue.senses@0#'   . $sense->guid . '.definition.en' => '',
            'fieldLabel.senses@0#' . $sense->guid => 'Meaning',
            'fieldLabel.senses@0#' . $sense->guid . '.definition.en' => 'Definition',
        ], $withLabels);
    }

    public function testUpdateEntry_DeleteTwoSensesOutOfTwoTotal_ProducesTwoDeletedDifferences()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $entry = new LexEntryModel($project);
        $entry->lexeme->form('th', 'apple');
        $sense1 = new LexSense();
        $sense1->definition->form('en', 'apple');
        $entry->senses[] = $sense1;
        $sense2 = new LexSense();
        $sense2->definition->form('en', 'also an apple');
        $entry->senses[] = $sense2;
        $entryId = $entry->write();

        $params = json_decode(json_encode(LexEntryCommands::readEntry($projectId, $entryId)), true);
        $params['senses'] = [];

        $userId = self::$environ->createUser('john', 'john', 'john');

        LexEntryCommands::updateEntry($projectId, $params, $userId);

        $updatedEntry = new LexEntryModel($project, $entryId);
        $differences = $entry->calculateDifferences($updatedEntry);
        $this->assertEquals([
            'deleted.senses@0#'  . $sense1->guid => 'apple',
            'oldValue.senses@0#' . $sense1->guid . '.definition.en' => 'apple',
            'newValue.senses@0#' . $sense1->guid . '.definition.en' => '',
            'deleted.senses@1#'  . $sense2->guid => 'also an apple',
            'oldValue.senses@1#' . $sense2->guid . '.definition.en' => 'also an apple',
            'newValue.senses@1#' . $sense2->guid . '.definition.en' => '',
        ], $differences);
        $withLabels = LexEntryCommands::addFieldLabelsToDifferences($project->config, $differences);
        $this->assertEquals([
            'deleted.senses@0#'    . $sense1->guid => 'apple',
            'oldValue.senses@0#'   . $sense1->guid . '.definition.en' => 'apple',
            'newValue.senses@0#'   . $sense1->guid . '.definition.en' => '',
            'fieldLabel.senses@0#' . $sense1->guid => 'Meaning',
            'fieldLabel.senses@0#' . $sense1->guid . '.definition.en' => 'Definition',
            'deleted.senses@1#'    . $sense2->guid => 'also an apple',
            'oldValue.senses@1#'   . $sense2->guid . '.definition.en' => 'also an apple',
            'newValue.senses@1#'   . $sense2->guid . '.definition.en' => '',
            'fieldLabel.senses@1#' . $sense2->guid => 'Meaning',
            'fieldLabel.senses@1#' . $sense2->guid . '.definition.en' => 'Definition',
        ], $withLabels);
    }

    public function testUpdateEntry_RearrangeTwoSensesOutOfTwoTotal_ProducesTwoMovedDifferences()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $entry = new LexEntryModel($project);
        $entry->lexeme->form('th', 'apple');
        $sense1 = new LexSense();
        $sense1->definition->form('en', 'apple');
        $entry->senses[] = $sense1;
        $sense2 = new LexSense();
        $sense2->definition->form('en', 'also an apple');
        $entry->senses[] = $sense2;
        $entryId = $entry->write();

        $params = json_decode(json_encode(LexEntryCommands::readEntry($projectId, $entryId)), true);
        $sense1Json = array_shift($params['senses']);
        $params['senses'][] = $sense1Json;

        $userId = self::$environ->createUser('john', 'john', 'john');

        LexEntryCommands::updateEntry($projectId, $params, $userId);

        $updatedEntry = new LexEntryModel($project, $entryId);
        $differences = $entry->calculateDifferences($updatedEntry);
        $this->assertEquals([
            'moved.senses@0#'  . $sense1->guid => '1',
            'moved.senses@1#'  . $sense2->guid => '0',
        ], $differences);
        $withLabels = LexEntryCommands::addFieldLabelsToDifferences($project->config, $differences);
        $this->assertEquals([
            'moved.senses@0#'  . $sense1->guid => '1',
            'moved.senses@1#'  . $sense2->guid => '0',
            'fieldLabel.senses@0#' . $sense1->guid => 'Meaning',
            'fieldLabel.senses@1#' . $sense2->guid => 'Meaning',
        ], $withLabels);
    }

    public function testUpdateEntry_DeleteFirstSenseOfTwo_ProducesBothDeletedAndMovedDifferences()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $entry = new LexEntryModel($project);
        $entry->lexeme->form('th', 'apple');
        $sense1 = new LexSense();
        $sense1->definition->form('en', 'apple');
        $entry->senses[] = $sense1;
        $sense2 = new LexSense();
        $sense2->definition->form('en', 'also an apple');
        $entry->senses[] = $sense2;
        $entryId = $entry->write();

        $params = json_decode(json_encode(LexEntryCommands::readEntry($projectId, $entryId)), true);
        array_shift($params['senses']);

        $userId = self::$environ->createUser('john', 'john', 'john');

        LexEntryCommands::updateEntry($projectId, $params, $userId);

        $updatedEntry = new LexEntryModel($project, $entryId);
        $differences = $entry->calculateDifferences($updatedEntry);
        $this->assertEquals([
            'deleted.senses@0#' . $sense1->guid => 'apple',
            'oldValue.senses@0#' . $sense1->guid . '.definition.en' => 'apple',
            'newValue.senses@0#' . $sense1->guid . '.definition.en' => '',
            'moved.senses@1#' . $sense2->guid => 0,
        ], $differences);
        $withLabels = LexEntryCommands::addFieldLabelsToDifferences($project->config, $differences);
        $this->assertEquals([
            'deleted.senses@0#' . $sense1->guid => 'apple',
            'oldValue.senses@0#' . $sense1->guid . '.definition.en' => 'apple',
            'newValue.senses@0#' . $sense1->guid . '.definition.en' => '',
            'fieldLabel.senses@0#' . $sense1->guid => 'Meaning',
            'fieldLabel.senses@0#' . $sense1->guid . '.definition.en' => 'Definition',
            'moved.senses@1#' . $sense2->guid => 0,
            'fieldLabel.senses@1#' . $sense2->guid => 'Meaning',
        ], $withLabels);
    }

    public function testUpdateEntry_DeleteSecondSenseOfTwo_ProducesDeleteDifferencesButNoMovedDifferences()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $entry = new LexEntryModel($project);
        $entry->lexeme->form('th', 'apple');
        $sense1 = new LexSense();
        $sense1->definition->form('en', 'apple');
        $entry->senses[] = $sense1;
        $sense2 = new LexSense();
        $sense2->definition->form('en', 'also an apple');
        $entry->senses[] = $sense2;
        $entryId = $entry->write();

        $params = json_decode(json_encode(LexEntryCommands::readEntry($projectId, $entryId)), true);
        array_pop($params['senses']);  // Remove last element (in this case, second)

        $userId = self::$environ->createUser('john', 'john', 'john');

        LexEntryCommands::updateEntry($projectId, $params, $userId);

        $updatedEntry = new LexEntryModel($project, $entryId);
        $differences = $entry->calculateDifferences($updatedEntry);
        $this->assertEquals([
            'deleted.senses@1#' . $sense2->guid => 'also an apple',
            'oldValue.senses@1#' . $sense2->guid . '.definition.en' => 'also an apple',
            'newValue.senses@1#' . $sense2->guid . '.definition.en' => '',
        ], $differences);
        $withLabels = LexEntryCommands::addFieldLabelsToDifferences($project->config, $differences);
        $this->assertEquals([
            'deleted.senses@1#' . $sense2->guid => 'also an apple',
            'oldValue.senses@1#' . $sense2->guid . '.definition.en' => 'also an apple',
            'newValue.senses@1#' . $sense2->guid . '.definition.en' => '',
            'fieldLabel.senses@1#' . $sense2->guid => 'Meaning',
            'fieldLabel.senses@1#' . $sense2->guid . '.definition.en' => 'Definition',
        ], $withLabels);
    }

    public function testUpdateEntry_AddSecondSense_ProducesNewValuesForSenseFields()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $entry = new LexEntryModel($project);
        $entry->lexeme->form('th', 'apple');
        $sense1 = new LexSense();
        $sense1->definition->form('en', 'apple');
        $entry->senses[] = $sense1;
        $entryId = $entry->write();

        $params = json_decode(json_encode(LexEntryCommands::readEntry($projectId, $entryId)), true);
        $params['senses'][] = [
            'definition' => [
                'en' => ['value' => 'also an apple'],
                'fr' => ['value' => 'une pomme']
            ],
            'generalNote' => [
                'en' => ['value' => 'note about the apple']
            ]
        ];

        $userId = self::$environ->createUser('john', 'john', 'john');

        LexEntryCommands::updateEntry($projectId, $params, $userId);

        $updatedEntry = new LexEntryModel($project, $entryId);
        $sense2Guid = $updatedEntry->senses[1]->guid;
        $differences = $entry->calculateDifferences($updatedEntry);
        $this->assertEquals([
            'added.senses@1#' . $sense2Guid => 'also an apple',
            'oldValue.senses@1#' . $sense2Guid . '.definition.en' => '',
            'newValue.senses@1#' . $sense2Guid . '.definition.en' => 'also an apple',
            'oldValue.senses@1#' . $sense2Guid . '.definition.fr' => '',
            'newValue.senses@1#' . $sense2Guid . '.definition.fr' => 'une pomme',
            'oldValue.senses@1#' . $sense2Guid . '.generalNote.en' => '',
            'newValue.senses@1#' . $sense2Guid . '.generalNote.en' => 'note about the apple',
        ], $differences);
        $withLabels = LexEntryCommands::addFieldLabelsToDifferences($project->config, $differences);
        $this->assertEquals([
            'added.senses@1#' . $sense2Guid => 'also an apple',
            'oldValue.senses@1#' . $sense2Guid . '.definition.en' => '',
            'newValue.senses@1#' . $sense2Guid . '.definition.en' => 'also an apple',
            'oldValue.senses@1#' . $sense2Guid . '.definition.fr' => '',
            'newValue.senses@1#' . $sense2Guid . '.definition.fr' => 'une pomme',
            'oldValue.senses@1#' . $sense2Guid . '.generalNote.en' => '',
            'newValue.senses@1#' . $sense2Guid . '.generalNote.en' => 'note about the apple',
            'fieldLabel.senses@1#' . $sense2Guid => 'Meaning',
            'fieldLabel.senses@1#' . $sense2Guid . '.definition.en' => 'Definition',
            'fieldLabel.senses@1#' . $sense2Guid . '.definition.fr' => 'Definition',
            'fieldLabel.senses@1#' . $sense2Guid . '.generalNote.en' => 'General Note',
        ], $withLabels);
    }

    public function testUpdateEntry_AddSenseInFirstPosition_ProducesAddedDifferenceAndMovedDifference()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $entry = new LexEntryModel($project);
        $entry->lexeme->form('th', 'apple');
        $sense2 = new LexSense();  // sense2 because it will end up in second position
        $sense2->definition->form('en', 'apple');
        $entry->senses[] = $sense2;
        $entryId = $entry->write();

        $params = json_decode(json_encode(LexEntryCommands::readEntry($projectId, $entryId)), true);
        // Add new sense in first position
        array_unshift($params['senses'], [
            'definition' => [
                'en' => ['value' => 'also an apple'],
                'fr' => ['value' => 'une pomme']
            ],
            'generalNote' => [
                'en' => ['value' => 'note about the apple']
            ]
        ]);

        $userId = self::$environ->createUser('john', 'john', 'john');

        LexEntryCommands::updateEntry($projectId, $params, $userId);

        $updatedEntry = new LexEntryModel($project, $entryId);
        $newSenseGuid = $updatedEntry->senses[0]->guid;
        $differences = $entry->calculateDifferences($updatedEntry);
        $this->assertEquals([
            'moved.senses@0#' . $sense2->guid => 1,
            'added.senses@0#' . $newSenseGuid => 'also an apple',
            'oldValue.senses@0#' . $newSenseGuid . '.definition.en' => '',
            'newValue.senses@0#' . $newSenseGuid . '.definition.en' => 'also an apple',
            'oldValue.senses@0#' . $newSenseGuid . '.definition.fr' => '',
            'newValue.senses@0#' . $newSenseGuid . '.definition.fr' => 'une pomme',
            'oldValue.senses@0#' . $newSenseGuid . '.generalNote.en' => '',
            'newValue.senses@0#' . $newSenseGuid . '.generalNote.en' => 'note about the apple',
        ], $differences);
        $withLabels = LexEntryCommands::addFieldLabelsToDifferences($project->config, $differences);
        $this->assertEquals([
            'moved.senses@0#' . $sense2->guid => 1,
            'fieldLabel.senses@0#' . $sense2->guid => 'Meaning',
            'added.senses@0#' . $newSenseGuid => 'also an apple',
            'oldValue.senses@0#' . $newSenseGuid . '.definition.en' => '',
            'newValue.senses@0#' . $newSenseGuid . '.definition.en' => 'also an apple',
            'oldValue.senses@0#' . $newSenseGuid . '.definition.fr' => '',
            'newValue.senses@0#' . $newSenseGuid . '.definition.fr' => 'une pomme',
            'oldValue.senses@0#' . $newSenseGuid . '.generalNote.en' => '',
            'newValue.senses@0#' . $newSenseGuid . '.generalNote.en' => 'note about the apple',
            'fieldLabel.senses@0#' . $newSenseGuid => 'Meaning',
            'fieldLabel.senses@0#' . $newSenseGuid . '.definition.en' => 'Definition',
            'fieldLabel.senses@0#' . $newSenseGuid . '.definition.fr' => 'Definition',
            'fieldLabel.senses@0#' . $newSenseGuid . '.generalNote.en' => 'General Note'
        ], $withLabels);
    }

    public function testUpdateEntry_AddOneSenseDeleteOneSenseUpdateOneSenseAndRearrange_ProducesAddedDifferenceAndDeletedDifferenceAndMovedDifference()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $entry = new LexEntryModel($project);
        $entry->lexeme->form('th', 'apple');
        $senseA = new LexSense();
        $senseA->definition->form('en', 'A');
        $entry->senses[] = $senseA;
        $senseB = new LexSense();
        $senseB->definition->form('en', 'B');
        $entry->senses[] = $senseB;
        $senseC = new LexSense();
        $senseC->definition->form('en', 'C');
        $entry->senses[] = $senseC;
        $entryId = $entry->write();

        $params = json_decode(json_encode(LexEntryCommands::readEntry($projectId, $entryId)), true);

        // Set up senses for
        // Original senses: A, B, C
        // New senses: D, C, A (where D is a new sense)
        list($jsonSenseA, $jsonSenseB, $jsonSenseC) = $params['senses'];
        $jsonSenseD = [
            'definition' => [
                'en' => ['value' => 'D'],
            ],
        ];
        $jsonSenseC['definition']['en']['value'] = 'C2';
        $params['senses'] = [$jsonSenseD, $jsonSenseC, $jsonSenseA];

        $userId = self::$environ->createUser('john', 'john', 'john');

        LexEntryCommands::updateEntry($projectId, $params, $userId);

        $updatedEntry = new LexEntryModel($project, $entryId);
        $newSenseGuid = $updatedEntry->senses[0]->guid;

        // Updated entry should have GUIDs for D, C and A in that order, and definitions that line up
        $this->assertEquals('D',  $updatedEntry->senses[0]->definition['en']->value);
        $this->assertEquals('C2', $updatedEntry->senses[1]->definition['en']->value);
        $this->assertEquals('A',  $updatedEntry->senses[2]->definition['en']->value);
        $this->assertEquals($newSenseGuid, $updatedEntry->senses[0]->guid);
        $this->assertEquals($senseC->guid, $updatedEntry->senses[1]->guid);
        $this->assertEquals($senseA->guid, $updatedEntry->senses[2]->guid);

        $differences = $entry->calculateDifferences($updatedEntry);
        $this->assertEquals([
            'moved.senses@0#'   . $senseA->guid => 2,
            'deleted.senses@1#' . $senseB->guid => 'B',
            'moved.senses@2#'   . $senseC->guid => 1,
            'added.senses@0#'   . $newSenseGuid => 'D',
            'oldValue.senses@0#' . $newSenseGuid . '.definition.en' => '',
            'newValue.senses@0#' . $newSenseGuid . '.definition.en' => 'D',
            'oldValue.senses@1#' . $senseB->guid . '.definition.en' => 'B',
            'newValue.senses@1#' . $senseB->guid . '.definition.en' => '',
            'oldValue.senses@2#' . $senseC->guid . '.definition.en' => 'C',
            'newValue.senses@2#' . $senseC->guid . '.definition.en' => 'C2',
        ], $differences);
        $withLabels = LexEntryCommands::addFieldLabelsToDifferences($project->config, $differences);
        $this->assertEquals([
            'moved.senses@0#'   . $senseA->guid => 2,
            'deleted.senses@1#' . $senseB->guid => 'B',
            'moved.senses@2#'   . $senseC->guid => 1,
            'added.senses@0#'   . $newSenseGuid => 'D',
            'oldValue.senses@0#' . $newSenseGuid . '.definition.en' => '',
            'newValue.senses@0#' . $newSenseGuid . '.definition.en' => 'D',
            'oldValue.senses@1#' . $senseB->guid . '.definition.en' => 'B',
            'newValue.senses@1#' . $senseB->guid . '.definition.en' => '',
            'oldValue.senses@2#' . $senseC->guid . '.definition.en' => 'C',
            'newValue.senses@2#' . $senseC->guid . '.definition.en' => 'C2',
            'fieldLabel.senses@0#' . $senseA->guid => 'Meaning',
            'fieldLabel.senses@1#' . $senseB->guid => 'Meaning',
            'fieldLabel.senses@1#' . $senseB->guid . '.definition.en' => 'Definition',
            'fieldLabel.senses@2#' . $senseC->guid => 'Meaning',
            'fieldLabel.senses@2#' . $senseC->guid . '.definition.en' => 'Definition',
            'fieldLabel.senses@0#' . $newSenseGuid => 'Meaning',
            'fieldLabel.senses@0#' . $newSenseGuid . '.definition.en' => 'Definition',
        ], $withLabels);
    }

    public function testUpdateEntry_AddOneExampleDeleteOneExampleUpdateOneExampleAndRearrange_ProducesAddedDifferenceAndDeletedDifferenceAndMovedDifference()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $entry = new LexEntryModel($project);
        $entry->lexeme->form('th', 'apple');
        $sense = new LexSense();
        $sense->definition->form('en', 'apple');
        $entry->senses[] = $sense;
        $exampleA = new LexExample();
        $exampleA->sentence->form('en', 'A');
        $sense->examples[] = $exampleA;
        $exampleB = new LexExample();
        $exampleB->sentence->form('en', 'B');
        $sense->examples[] = $exampleB;
        $exampleC = new LexExample();
        $exampleC->sentence->form('en', 'C');
        $sense->examples[] = $exampleC;
        $entryId = $entry->write();

        $params = json_decode(json_encode(LexEntryCommands::readEntry($projectId, $entryId)), true);

        // Set up senses for
        // Original senses: A, B, C
        // New senses: D, C, A (where D is a new sense)
        list($jsonExampleA, $jsonExampleB, $jsonExampleC) = $params['senses'][0]['examples'];
        $jsonExampleD = [
            'sentence' => [
                'en' => ['value' => 'D'],
            ],
        ];
        $jsonExampleC['sentence']['en']['value'] = 'C2';
        $params['senses'][0]['examples'] = [$jsonExampleD, $jsonExampleC, $jsonExampleA];

        $userId = self::$environ->createUser('john', 'john', 'john');

        LexEntryCommands::updateEntry($projectId, $params, $userId);

        $updatedEntry = new LexEntryModel($project, $entryId);
        $newExampleGuid = $updatedEntry->senses[0]->examples[0]->guid;

        // Updated entry should have GUIDs for D, C and A in that order, and sentences that line up
        $this->assertEquals('D',  $updatedEntry->senses[0]->examples[0]->sentence['en']->value);
        $this->assertEquals('C2', $updatedEntry->senses[0]->examples[1]->sentence['en']->value);
        $this->assertEquals('A',  $updatedEntry->senses[0]->examples[2]->sentence['en']->value);
        $this->assertEquals($newExampleGuid, $updatedEntry->senses[0]->examples[0]->guid);
        $this->assertEquals($exampleC->guid, $updatedEntry->senses[0]->examples[1]->guid);
        $this->assertEquals($exampleA->guid, $updatedEntry->senses[0]->examples[2]->guid);

        $differences = $entry->calculateDifferences($updatedEntry);
        $this->assertEquals([
            'moved.senses@0#' . $sense->guid . '.examples@0#'   . $exampleA->guid => 2,
            'deleted.senses@0#' . $sense->guid . '.examples@1#' . $exampleB->guid => 'B',
            'moved.senses@0#' . $sense->guid . '.examples@2#'   . $exampleC->guid => 1,
            'added.senses@0#' . $sense->guid . '.examples@0#'   . $newExampleGuid => 'D',
            'oldValue.senses@0#' . $sense->guid . '.examples@0#' . $newExampleGuid . '.sentence.en' => '',
            'newValue.senses@0#' . $sense->guid . '.examples@0#' . $newExampleGuid . '.sentence.en' => 'D',
            'oldValue.senses@0#' . $sense->guid . '.examples@1#' . $exampleB->guid . '.sentence.en' => 'B',
            'newValue.senses@0#' . $sense->guid . '.examples@1#' . $exampleB->guid . '.sentence.en' => '',
            'oldValue.senses@0#' . $sense->guid . '.examples@2#' . $exampleC->guid . '.sentence.en' => 'C',
            'newValue.senses@0#' . $sense->guid . '.examples@2#' . $exampleC->guid . '.sentence.en' => 'C2',
        ], $differences);
        $withLabels = LexEntryCommands::addFieldLabelsToDifferences($project->config, $differences);
        $this->assertEquals([
            'moved.senses@0#' . $sense->guid . '.examples@0#'   . $exampleA->guid => 2,
            'deleted.senses@0#' . $sense->guid . '.examples@1#' . $exampleB->guid => 'B',
            'moved.senses@0#' . $sense->guid . '.examples@2#'   . $exampleC->guid => 1,
            'added.senses@0#' . $sense->guid . '.examples@0#'   . $newExampleGuid => 'D',
            'oldValue.senses@0#' . $sense->guid . '.examples@0#' . $newExampleGuid . '.sentence.en' => '',
            'newValue.senses@0#' . $sense->guid . '.examples@0#' . $newExampleGuid . '.sentence.en' => 'D',
            'oldValue.senses@0#' . $sense->guid . '.examples@1#' . $exampleB->guid . '.sentence.en' => 'B',
            'newValue.senses@0#' . $sense->guid . '.examples@1#' . $exampleB->guid . '.sentence.en' => '',
            'oldValue.senses@0#' . $sense->guid . '.examples@2#' . $exampleC->guid . '.sentence.en' => 'C',
            'newValue.senses@0#' . $sense->guid . '.examples@2#' . $exampleC->guid . '.sentence.en' => 'C2',
            'fieldLabel.senses@0#' . $sense->guid . '.examples@0#' . $exampleA->guid => 'Example',
            'fieldLabel.senses@0#' . $sense->guid . '.examples@1#' . $exampleB->guid => 'Example',
            'fieldLabel.senses@0#' . $sense->guid . '.examples@1#' . $exampleB->guid . '.sentence.en' => 'Sentence',
            'fieldLabel.senses@0#' . $sense->guid . '.examples@2#' . $exampleC->guid => 'Example',
            'fieldLabel.senses@0#' . $sense->guid . '.examples@2#' . $exampleC->guid . '.sentence.en' => 'Sentence',
            'fieldLabel.senses@0#' . $sense->guid . '.examples@0#' . $newExampleGuid => 'Example',
            'fieldLabel.senses@0#' . $sense->guid . '.examples@0#' . $newExampleGuid . '.sentence.en' => 'Sentence',
        ], $withLabels);
    }

    // TODO: Write one more test, that rearranges both senses *and* examples at the same time

    public function testUpdateEntry_DeleteOnlyExample_ProducesOneDeletedDifferenceForTheExampleAndOldValueDifferencesForAllFields()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $entry = new LexEntryModel($project);
        $entry->lexeme->form('th', 'apple');
        $sense = new LexSense();
        $sense->definition->form('en', 'apple');
        $entry->senses[] = $sense;
        $example = new LexExample();
        $example->sentence->form('en', 'eat an apple');
        $sense->examples[] = $example;
        $entryId = $entry->write();

        $params = json_decode(json_encode(LexEntryCommands::readEntry($projectId, $entryId)), true);
        $params['senses'][0]['examples'] = [];

        $userId = self::$environ->createUser('john', 'john', 'john');

        LexEntryCommands::updateEntry($projectId, $params, $userId);

        $updatedEntry = new LexEntryModel($project, $entryId);
        $differences = $entry->calculateDifferences($updatedEntry);
        $this->assertEquals([
            'deleted.senses@0#' . $sense->guid . '.examples@0#' . $example->guid => 'eat an apple',
            'oldValue.senses@0#' . $sense->guid . '.examples@0#' . $example->guid . '.sentence.en' => 'eat an apple',
            'newValue.senses@0#' . $sense->guid . '.examples@0#' . $example->guid . '.sentence.en' => ''
        ], $differences);
        $withLabels = LexEntryCommands::addFieldLabelsToDifferences($project->config, $differences);
        $this->assertEquals([
            'deleted.senses@0#' . $sense->guid . '.examples@0#' . $example->guid => 'eat an apple',
            'oldValue.senses@0#' . $sense->guid . '.examples@0#' . $example->guid . '.sentence.en' => 'eat an apple',
            'newValue.senses@0#' . $sense->guid . '.examples@0#' . $example->guid . '.sentence.en' => '',
            'fieldLabel.senses@0#' . $sense->guid . '.examples@0#' . $example->guid => 'Example',
            'fieldLabel.senses@0#' . $sense->guid . '.examples@0#' . $example->guid . '.sentence.en' => 'Sentence',
        ], $withLabels);
    }

    public function testUpdateEntry_DeleteTwoExamplesOutOfTwoTotal_ProducesTwoDeletedDifferences()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $entry = new LexEntryModel($project);
        $entry->lexeme->form('th', 'apple');
        $sense = new LexSense();
        $sense->definition->form('en', 'apple');
        $entry->senses[] = $sense;
        $example1 = new LexExample();
        $example1->sentence->form('en', 'eat an apple');
        $sense->examples[] = $example1;
        $example2 = new LexExample();
        $example2->sentence->form('fr', 'manger une pomme');
        $sense->examples[] = $example2;
        $entryId = $entry->write();

        $params = json_decode(json_encode(LexEntryCommands::readEntry($projectId, $entryId)), true);
        $params['senses'][0]['examples'] = [];

        $userId = self::$environ->createUser('john', 'john', 'john');

        LexEntryCommands::updateEntry($projectId, $params, $userId);

        $updatedEntry = new LexEntryModel($project, $entryId);
        $differences = $entry->calculateDifferences($updatedEntry);
        $this->assertEquals([
            'deleted.senses@0#'  . $sense->guid . '.examples@0#' . $example1->guid => 'eat an apple',
            'oldValue.senses@0#' . $sense->guid . '.examples@0#' . $example1->guid . '.sentence.en' => 'eat an apple',
            'newValue.senses@0#' . $sense->guid . '.examples@0#' . $example1->guid . '.sentence.en' => '',
            'deleted.senses@0#'  . $sense->guid . '.examples@1#' . $example2->guid => 'manger une pomme',
            'oldValue.senses@0#' . $sense->guid . '.examples@1#' . $example2->guid . '.sentence.fr' => 'manger une pomme',
            'newValue.senses@0#' . $sense->guid . '.examples@1#' . $example2->guid . '.sentence.fr' => '',
        ], $differences);
        $withLabels = LexEntryCommands::addFieldLabelsToDifferences($project->config, $differences);
        $this->assertEquals([
            'deleted.senses@0#'  . $sense->guid . '.examples@0#' . $example1->guid => 'eat an apple',
            'oldValue.senses@0#' . $sense->guid . '.examples@0#' . $example1->guid . '.sentence.en' => 'eat an apple',
            'newValue.senses@0#' . $sense->guid . '.examples@0#' . $example1->guid . '.sentence.en' => '',
            'deleted.senses@0#'  . $sense->guid . '.examples@1#' . $example2->guid => 'manger une pomme',
            'oldValue.senses@0#' . $sense->guid . '.examples@1#' . $example2->guid . '.sentence.fr' => 'manger une pomme',
            'newValue.senses@0#' . $sense->guid . '.examples@1#' . $example2->guid . '.sentence.fr' => '',
            'fieldLabel.senses@0#' . $sense->guid . '.examples@0#' . $example1->guid => 'Example',
            'fieldLabel.senses@0#' . $sense->guid . '.examples@1#' . $example2->guid => 'Example',
            'fieldLabel.senses@0#' . $sense->guid . '.examples@0#' . $example1->guid . '.sentence.en' => 'Sentence',
            'fieldLabel.senses@0#' . $sense->guid . '.examples@1#' . $example2->guid . '.sentence.fr' => 'Sentence',
        ], $withLabels);
    }

    public function testUpdateEntry_DeleteFirstExampleOfTwo_ProducesADeletedDifferenceAndAMovedDifference()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $entry = new LexEntryModel($project);
        $entry->lexeme->form('th', 'apple');
        $sense = new LexSense();
        $sense->definition->form('en', 'apple');
        $entry->senses[] = $sense;
        $example1 = new LexExample();
        $example1->sentence->form('en', 'eat an apple');
        $sense->examples[] = $example1;
        $example2 = new LexExample();
        $example2->sentence->form('fr', 'manger une pomme');
        $sense->examples[] = $example2;
        $entryId = $entry->write();

        $params = json_decode(json_encode(LexEntryCommands::readEntry($projectId, $entryId)), true);
        unset($params['senses'][0]['examples'][0]);

        $userId = self::$environ->createUser('john', 'john', 'john');

        LexEntryCommands::updateEntry($projectId, $params, $userId);

        $updatedEntry = new LexEntryModel($project, $entryId);
        $differences = $entry->calculateDifferences($updatedEntry);
        $this->assertEquals([
            'deleted.senses@0#' . $sense->guid . '.examples@0#' . $example1->guid => 'eat an apple',
            'deleted.senses@0#'  . $sense->guid . '.examples@0#' . $example1->guid => 'eat an apple',
            'oldValue.senses@0#' . $sense->guid . '.examples@0#' . $example1->guid . '.sentence.en' => 'eat an apple',
            'newValue.senses@0#' . $sense->guid . '.examples@0#' . $example1->guid . '.sentence.en' => '',
            'moved.senses@0#' . $sense->guid . '.examples@1#' . $example2->guid => '0',
        ], $differences);
        $withLabels = LexEntryCommands::addFieldLabelsToDifferences($project->config, $differences);
        $this->assertEquals([
            'deleted.senses@0#' . $sense->guid . '.examples@0#' . $example1->guid => 'eat an apple',
            'deleted.senses@0#'  . $sense->guid . '.examples@0#' . $example1->guid => 'eat an apple',
            'oldValue.senses@0#' . $sense->guid . '.examples@0#' . $example1->guid . '.sentence.en' => 'eat an apple',
            'newValue.senses@0#' . $sense->guid . '.examples@0#' . $example1->guid . '.sentence.en' => '',
            'moved.senses@0#' . $sense->guid . '.examples@1#' . $example2->guid => '0',
            'fieldLabel.senses@0#' . $sense->guid . '.examples@0#' . $example1->guid => 'Example',
            'fieldLabel.senses@0#' . $sense->guid . '.examples@0#' . $example1->guid . '.sentence.en' => 'Sentence',
            'fieldLabel.senses@0#' . $sense->guid . '.examples@1#' . $example2->guid => 'Example',
        ], $withLabels);
    }

    public function testUpdateEntry_DeleteSecondExampleOfTwo_ProducesADeletedDifferenceButNoMovedDifference()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $entry = new LexEntryModel($project);
        $entry->lexeme->form('th', 'apple');
        $sense = new LexSense();
        $sense->definition->form('en', 'apple');
        $entry->senses[] = $sense;
        $example1 = new LexExample();
        $example1->sentence->form('en', 'eat an apple');
        $sense->examples[] = $example1;
        $example2 = new LexExample();
        $example2->sentence->form('fr', 'manger une pomme');
        $sense->examples[] = $example2;
        $entryId = $entry->write();

        $params = json_decode(json_encode(LexEntryCommands::readEntry($projectId, $entryId)), true);
        array_pop($params['senses'][0]['examples']);  // Remove last element (in this case, second)

        $userId = self::$environ->createUser('john', 'john', 'john');

        LexEntryCommands::updateEntry($projectId, $params, $userId);

        $updatedEntry = new LexEntryModel($project, $entryId);
        $differences = $entry->calculateDifferences($updatedEntry);
        $this->assertEquals([
            'deleted.senses@0#'  . $sense->guid . '.examples@1#' . $example2->guid => 'manger une pomme',
            'oldValue.senses@0#' . $sense->guid . '.examples@1#' . $example2->guid . '.sentence.fr' => 'manger une pomme',
            'newValue.senses@0#' . $sense->guid . '.examples@1#' . $example2->guid . '.sentence.fr' => '',
        ], $differences);
        $withLabels = LexEntryCommands::addFieldLabelsToDifferences($project->config, $differences);
        $this->assertEquals([
            'deleted.senses@0#'  . $sense->guid . '.examples@1#' . $example2->guid => 'manger une pomme',
            'oldValue.senses@0#' . $sense->guid . '.examples@1#' . $example2->guid . '.sentence.fr' => 'manger une pomme',
            'newValue.senses@0#' . $sense->guid . '.examples@1#' . $example2->guid . '.sentence.fr' => '',
            'fieldLabel.senses@0#' . $sense->guid . '.examples@1#' . $example2->guid . '.sentence.fr' => 'Sentence',
            'fieldLabel.senses@0#' . $sense->guid . '.examples@1#' . $example2->guid => 'Example',
        ], $withLabels);
    }

    public function testUpdateEntry_UpdateFirstExampleOfTwo_ProducesOldValueAndNewValueDifferencesOnlyForTheUpdatedExample()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $entry = new LexEntryModel($project);
        $entry->lexeme->form('th', 'apple');
        $sense = new LexSense();
        $sense->definition->form('en', 'apple');
        $entry->senses[] = $sense;
        $example1 = new LexExample();
        $example1->sentence->form('en', 'eat an apple');
        $sense->examples[] = $example1;
        $example2 = new LexExample();
        $example2->sentence->form('fr', 'manger une pomme');
        $sense->examples[] = $example2;
        $entryId = $entry->write();

        $params = json_decode(json_encode(LexEntryCommands::readEntry($projectId, $entryId)), true);
        $params['senses'][0]['examples'][0]['sentence']['en']['value'] = 'also eat an apple';

        $userId = self::$environ->createUser('john', 'john', 'john');

        LexEntryCommands::updateEntry($projectId, $params, $userId);

        $updatedEntry = new LexEntryModel($project, $entryId);
        $differences = $entry->calculateDifferences($updatedEntry);
        $this->assertEquals(['oldValue.senses@0#'   . $sense->guid . '.examples@0#' . $example1->guid . '.sentence.en' => 'eat an apple',
                             'newValue.senses@0#'   . $sense->guid . '.examples@0#' . $example1->guid . '.sentence.en' => 'also eat an apple'], $differences);
        $withLabels = LexEntryCommands::addFieldLabelsToDifferences($project->config, $differences);
        $this->assertEquals(['oldValue.senses@0#'   . $sense->guid . '.examples@0#' . $example1->guid . '.sentence.en' => 'eat an apple',
                             'newValue.senses@0#'   . $sense->guid . '.examples@0#' . $example1->guid . '.sentence.en' => 'also eat an apple',
                             'fieldLabel.senses@0#' . $sense->guid . '.examples@0#' . $example1->guid . '.sentence.en' => 'Sentence'], $withLabels);
    }

    public function testUpdateEntry_UpdateSecondExampleOfTwo_ProducesOldValueAndNewValueDifferencesOnlyForTheUpdatedExample()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $entry = new LexEntryModel($project);
        $entry->lexeme->form('th', 'apple');
        $sense = new LexSense();
        $sense->definition->form('en', 'apple');
        $entry->senses[] = $sense;
        $example1 = new LexExample();
        $example1->sentence->form('en', 'eat an apple');
        $sense->examples[] = $example1;
        $example2 = new LexExample();
        $example2->sentence->form('fr', 'manger une pomme');
        $sense->examples[] = $example2;
        $entryId = $entry->write();

        $params = json_decode(json_encode(LexEntryCommands::readEntry($projectId, $entryId)), true);
        $params['senses'][0]['examples'][1]['sentence']['fr']['value'] = 'also eat an apple';

        $userId = self::$environ->createUser('john', 'john', 'john');

        LexEntryCommands::updateEntry($projectId, $params, $userId);

        $updatedEntry = new LexEntryModel($project, $entryId);
        $differences = $entry->calculateDifferences($updatedEntry);
        $this->assertEquals(['oldValue.senses@0#'   . $sense->guid . '.examples@1#' . $example2->guid . '.sentence.fr' => 'manger une pomme',
                             'newValue.senses@0#'   . $sense->guid . '.examples@1#' . $example2->guid . '.sentence.fr' => 'also eat an apple'], $differences);
        $withLabels = LexEntryCommands::addFieldLabelsToDifferences($project->config, $differences);
        $this->assertEquals(['oldValue.senses@0#'   . $sense->guid . '.examples@1#' . $example2->guid . '.sentence.fr' => 'manger une pomme',
                             'newValue.senses@0#'   . $sense->guid . '.examples@1#' . $example2->guid . '.sentence.fr' => 'also eat an apple',
                             'fieldLabel.senses@0#' . $sense->guid . '.examples@1#' . $example2->guid . '.sentence.fr' => 'Sentence'], $withLabels);
    }

    public function testUpdateEntry_UpdateTwoExamplesInTwoSenses_DifferencesHaveCorrectSenseGuidsAndValues()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $entry = new LexEntryModel($project);
        $entry->lexeme->form('th', 'apple');
        $sense1 = new LexSense();
        $sense1->definition->form('en', 'apple');
        $entry->senses[] = $sense1;
        $sense2 = new LexSense();
        $sense2->definition->form('fr', 'pomme');
        $entry->senses[] = $sense2;
        $example1 = new LexExample();
        $example1->sentence->form('en', 'eat an apple');
        $sense1->examples[] = $example1;
        $example2 = new LexExample();
        $example2->sentence->form('fr', 'manger une pomme');
        $sense2->examples[] = $example2;
        $entryId = $entry->write();

        $params = json_decode(json_encode(LexEntryCommands::readEntry($projectId, $entryId)), true);
        $params['senses'][0]['examples'][0]['sentence']['en']['value'] = 'also eat an apple';
        $params['senses'][1]['examples'][0]['sentence']['fr']['value'] = 'aussi manger une pomme';

        $userId = self::$environ->createUser('john', 'john', 'john');

        LexEntryCommands::updateEntry($projectId, $params, $userId);

        $updatedEntry = new LexEntryModel($project, $entryId);
        $differences = $entry->calculateDifferences($updatedEntry);
        $this->assertEquals(['oldValue.senses@0#'   . $sense1->guid . '.examples@0#' . $example1->guid . '.sentence.en' => 'eat an apple',
                             'newValue.senses@0#'   . $sense1->guid . '.examples@0#' . $example1->guid . '.sentence.en' => 'also eat an apple',
                             'oldValue.senses@1#'   . $sense2->guid . '.examples@0#' . $example2->guid . '.sentence.fr' => 'manger une pomme',
                             'newValue.senses@1#'   . $sense2->guid . '.examples@0#' . $example2->guid . '.sentence.fr' => 'aussi manger une pomme'], $differences);
        $withLabels = LexEntryCommands::addFieldLabelsToDifferences($project->config, $differences);
        $this->assertEquals(['oldValue.senses@0#'   . $sense1->guid . '.examples@0#' . $example1->guid . '.sentence.en' => 'eat an apple',
                             'newValue.senses@0#'   . $sense1->guid . '.examples@0#' . $example1->guid . '.sentence.en' => 'also eat an apple',
                             'fieldLabel.senses@0#' . $sense1->guid . '.examples@0#' . $example1->guid . '.sentence.en' => 'Sentence',
                             'oldValue.senses@1#'   . $sense2->guid . '.examples@0#' . $example2->guid . '.sentence.fr' => 'manger une pomme',
                             'newValue.senses@1#'   . $sense2->guid . '.examples@0#' . $example2->guid . '.sentence.fr' => 'aussi manger une pomme',
                             'fieldLabel.senses@1#' . $sense2->guid . '.examples@0#' . $example2->guid . '.sentence.fr' => 'Sentence'], $withLabels);
    }

    public function testUpdateEntry_UpdateExamplesInOneSenseAndDeleteExampleInTheOther_DifferencesHaveCorrectSenseGuidsAndValues()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $entry = new LexEntryModel($project);
        $entry->lexeme->form('th', 'apple');
        $sense1 = new LexSense();
        $sense1->definition->form('en', 'apple');
        $entry->senses[] = $sense1;
        $sense2 = new LexSense();
        $sense2->definition->form('fr', 'pomme');
        $entry->senses[] = $sense2;
        $example1 = new LexExample();
        $example1->sentence->form('en', 'eat an apple');
        $sense1->examples[] = $example1;
        $example2 = new LexExample();
        $example2->sentence->form('fr', 'manger une pomme');
        $sense2->examples[] = $example2;
        $entryId = $entry->write();

        $params = json_decode(json_encode(LexEntryCommands::readEntry($projectId, $entryId)), true);
        $params['senses'][0]['examples'][0]['sentence']['en']['value'] = 'also eat an apple';
        $params['senses'][1]['examples'] = [];

        $userId = self::$environ->createUser('john', 'john', 'john');

        LexEntryCommands::updateEntry($projectId, $params, $userId);

        $updatedEntry = new LexEntryModel($project, $entryId);
        $differences = $entry->calculateDifferences($updatedEntry);
        $this->assertEquals([
            'oldValue.senses@0#' . $sense1->guid . '.examples@0#' . $example1->guid . '.sentence.en' => 'eat an apple',
            'newValue.senses@0#' . $sense1->guid . '.examples@0#' . $example1->guid . '.sentence.en' => 'also eat an apple',
            'deleted.senses@1#'  . $sense2->guid . '.examples@0#' . $example2->guid => 'manger une pomme',
            'oldValue.senses@1#' . $sense2->guid . '.examples@0#' . $example2->guid . '.sentence.fr' => 'manger une pomme',
            'newValue.senses@1#' . $sense2->guid . '.examples@0#' . $example2->guid . '.sentence.fr' => '',
        ], $differences);
        $withLabels = LexEntryCommands::addFieldLabelsToDifferences($project->config, $differences);
        $this->assertEquals([
            'oldValue.senses@0#' . $sense1->guid . '.examples@0#' . $example1->guid . '.sentence.en' => 'eat an apple',
            'newValue.senses@0#' . $sense1->guid . '.examples@0#' . $example1->guid . '.sentence.en' => 'also eat an apple',
            'fieldLabel.senses@0#' . $sense1->guid . '.examples@0#' . $example1->guid . '.sentence.en' => 'Sentence',
            'deleted.senses@1#'  . $sense2->guid . '.examples@0#' . $example2->guid => 'manger une pomme',
            'oldValue.senses@1#' . $sense2->guid . '.examples@0#' . $example2->guid . '.sentence.fr' => 'manger une pomme',
            'newValue.senses@1#' . $sense2->guid . '.examples@0#' . $example2->guid . '.sentence.fr' => '',
            'fieldLabel.senses@1#' . $sense2->guid . '.examples@0#' . $example2->guid => 'Example',
            'fieldLabel.senses@1#' . $sense2->guid . '.examples@0#' . $example2->guid . '.sentence.fr' => 'Sentence',
        ], $withLabels);
    }

    public function testUpdateEntry_AddSecondExample_ProducesNewValuesForExampleFields()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $entry = new LexEntryModel($project);
        $entry->lexeme->form('th', 'apple');
        $sense1 = new LexSense();
        $sense1->definition->form('en', 'apple');
        $entry->senses[] = $sense1;
        $sense2 = new LexSense();
        $sense2->definition->form('fr', 'pomme');
        $entry->senses[] = $sense2;
        $example1 = new LexExample();
        $example1->sentence->form('en', 'eat an apple');
        $sense1->examples[] = $example1;
        $entryId = $entry->write();

        $params = json_decode(json_encode(LexEntryCommands::readEntry($projectId, $entryId)), true);
        $params['senses'][1]['examples'][] = [
            'sentence' => [
                'fr' => ['value' => 'manger une pomme']
            ]
        ];

        $userId = self::$environ->createUser('john', 'john', 'john');

        LexEntryCommands::updateEntry($projectId, $params, $userId);


        $updatedEntry = new LexEntryModel($project, $entryId);
        $example2Guid = $updatedEntry->senses[1]->examples[0]->guid;
        $differences = $entry->calculateDifferences($updatedEntry);
        $this->assertEquals([
            'added.senses@1#' . $sense2->guid . '.examples@0#' . $example2Guid => 'manger une pomme',
            'oldValue.senses@1#' . $sense2->guid . '.examples@0#' . $example2Guid  . '.sentence.fr' => '',
            'newValue.senses@1#' . $sense2->guid . '.examples@0#' . $example2Guid  . '.sentence.fr' => 'manger une pomme',
        ], $differences);
        $withLabels = LexEntryCommands::addFieldLabelsToDifferences($project->config, $differences);
        $this->assertEquals([
            'added.senses@1#' . $sense2->guid . '.examples@0#' . $example2Guid => 'manger une pomme',
            'oldValue.senses@1#' . $sense2->guid . '.examples@0#' . $example2Guid . '.sentence.fr' => '',
            'newValue.senses@1#' . $sense2->guid . '.examples@0#' . $example2Guid . '.sentence.fr' => 'manger une pomme',
            'fieldLabel.senses@1#' . $sense2->guid . '.examples@0#' . $example2Guid => 'Example',
            'fieldLabel.senses@1#' . $sense2->guid . '.examples@0#' . $example2Guid . '.sentence.fr' => 'Sentence',
        ], $withLabels);
    }

    public function testUpdateEntry_AddNewExampleInFirstPosition_ProducesNewValuesForExampleFields()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $entry = new LexEntryModel($project);
        $entry->lexeme->form('th', 'apple');
        $sense = new LexSense();
        $sense->definition->form('en', 'apple');
        $entry->senses[] = $sense;
        $example2 = new LexExample();  // example2 because it will end up in second position
        $example2->sentence->form('en', 'eat an apple');
        $sense->examples[] = $example2;
        $entryId = $entry->write();

        $params = json_decode(json_encode(LexEntryCommands::readEntry($projectId, $entryId)), true);
        // Add new example in first position
        array_unshift($params['senses'][0]['examples'], [
            'sentence' => [
                'fr' => ['value' => 'manger une pomme']
            ]
        ]);

        $userId = self::$environ->createUser('john', 'john', 'john');

        LexEntryCommands::updateEntry($projectId, $params, $userId);

        $updatedEntry = new LexEntryModel($project, $entryId);
        $newExampleGuid = $updatedEntry->senses[0]->examples[0]->guid;
        $differences = $entry->calculateDifferences($updatedEntry);
        $this->assertEquals([
            'moved.senses@0#' . $sense->guid . '.examples@0#' . $example2->guid => '1',
            'added.senses@0#' . $sense->guid . '.examples@0#' . $newExampleGuid => 'manger une pomme',
            'oldValue.senses@0#' . $sense->guid . '.examples@0#' . $newExampleGuid  . '.sentence.fr' => '',
            'newValue.senses@0#' . $sense->guid . '.examples@0#' . $newExampleGuid  . '.sentence.fr' => 'manger une pomme',
        ], $differences);
        $withLabels = LexEntryCommands::addFieldLabelsToDifferences($project->config, $differences);
        $this->assertEquals([
            'moved.senses@0#' . $sense->guid . '.examples@0#' . $example2->guid => '1',
            'added.senses@0#' . $sense->guid . '.examples@0#' . $newExampleGuid => 'manger une pomme',
            'oldValue.senses@0#' . $sense->guid . '.examples@0#' . $newExampleGuid . '.sentence.fr' => '',
            'newValue.senses@0#' . $sense->guid . '.examples@0#' . $newExampleGuid . '.sentence.fr' => 'manger une pomme',
            'fieldLabel.senses@0#' . $sense->guid . '.examples@0#' . $example2->guid => 'Example',
            'fieldLabel.senses@0#' . $sense->guid . '.examples@0#' . $newExampleGuid => 'Example',
            'fieldLabel.senses@0#' . $sense->guid . '.examples@0#' . $newExampleGuid . '.sentence.fr' => 'Sentence',
        ], $withLabels);
    }

    /* Ignore test for send receive v1.1 since dirtySR counter is not being incremented on edit. IJH 2015-02
        public function testUpdateEntry_ProjectHasSendReceive_EntryHasGuidAndDirtySRIncremented()
        {
            $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
            $project->sendReceiveProject = new SendReceiveProjectModel('sr_id', 'sr_name', '', 'manager');
            $projectId = $project->write();
            $pidFilePath = sys_get_temp_dir() . '/mockLFMerge.pid';
            $command = 'php mockLFMergeExe.php';
            $mockMergeQueuePath = sys_get_temp_dir() . '/mockLFMergeQueue';
            FileUtilities::createAllFolders($mockMergeQueuePath);

            $userId = self::$environ->createUser('john', 'john', 'john');

            $params['id'] = '';
            $params['lexeme']['th']['value'] = 'apple';

            $newParams = LexEntryCommands::updateEntry($projectId, $params, $userId, $mockMergeQueuePath, $pidFilePath, $command);

            $newEntry = new LexEntryModel($project, $newParams['id']);
            $this->assertTrue(Uuid::isValid($newEntry->guid));
            $this->assertEquals('apple', $newEntry->lexeme['th']);
            $this->assertEquals(1, $newEntry->dirtySR);

            $newParams['lexeme']['th']['value'] = 'rose apple';

            $updatedParams = LexEntryCommands::updateEntry($projectId, $newParams, $userId, $mockMergeQueuePath, $pidFilePath, $command);

            $updatedEntry = new LexEntryModel($project, $updatedParams['id']);
            $this->assertTrue(Uuid::isValid($updatedEntry->guid));
            $this->assertEqual($updatedEntry->guid, $newEntry->guid);
            $this->assertEquals('rose apple', $updatedEntry->lexeme['th']);
            $this->assertEquals(2, $updatedEntry->dirtySR);
            FileUtilities::removeFolderAndAllContents($mockMergeQueuePath);
        }
    */
    public function testListEntries_allEntries()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $sense = new LexSense();
        $sense->definition->form('en', 'apple');

        for ($i = 0; $i < 10; $i++) {
            $entry = new LexEntryModel($project);
            $entry->lexeme->form('th', 'Apfel' . $i);
            $entry->senses[] = $sense;
            $entry->write();
        }

        $result = LexEntryCommands::listEntries($projectId);
        $this->assertEquals(10, $result->count);
        $this->assertEquals('Apfel5', $result->entries[5]['lexeme']['th']['value']);
    }

    public function testListEntries_missingInfoDefinition_someEntries()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $sense = new LexSense();
        $sense->definition->form('en', 'apple');

        $senseNoDef = new LexSense();
        $senseNoDef->definition->form('en', '');

        for ($i = 0; $i < 10; $i++) {
            $entry = new LexEntryModel($project);
            $entry->lexeme->form('th', 'Apfel' . $i);
            if ($i % 2 == 0) {
                $entry->senses[] = $sense;
            }
            $entry->write();
        }
        $entry = new LexEntryModel($project);
        $entry->lexeme->form('th', 'Apfel');
        $entry->senses[] = $senseNoDef;
        $entry->write();

        $result = LexEntryCommands::listEntries($projectId, LexConfig::DEFINITION);
        $this->assertEquals(6, $result->count);
    }

    public function testListEntries_missingInfoPartOfSpeech_someEntries()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $sense = new LexSense();
        $sense->definition->form('en', 'apple');
        $sense->partOfSpeech->value = 'noun';

        $senseNoPos = new LexSense();
        $senseNoPos->definition->form('en', 'orange');

        for ($i = 0; $i < 10; $i++) {
            $entry = new LexEntryModel($project);
            $entry->lexeme->form('th', 'Apfel' . $i);
            $entry->senses[] = $sense;
            if ($i % 2 == 0) {
                $entry->senses[] = $senseNoPos;
            }
            $entry->write();
        }

        $result = LexEntryCommands::listEntries($projectId, LexConfig::POS);
        $this->assertEquals(5, $result->count);

    }

    public function testListEntries_missingInfoExamples_someEntries()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        for ($i = 0; $i < 10; $i++) {
            $entry = new LexEntryModel($project);
            $entry->lexeme->form('th', 'Apfel' . $i);
            $sense = new LexSense();
            $sense->definition->form('en', 'apple');
            $sense->partOfSpeech->value = 'noun';
            $example = new LexExample();
            if ($i % 2 == 0) {
                $example->sentence->form('th', 'Ich esse Apfeln oft');
            }
            if ($i % 3 == 0) {
                $example->translation->form('en', 'I eat Apples often');
            }
            $sense->examples[] = $example;
            $entry->senses[] = $sense;
            $entry->write();
        }

        $result = LexEntryCommands::listEntries($projectId, LexConfig::EXAMPLE_SENTENCE);
        $this->assertEquals(5, $result->count);

        $result = LexEntryCommands::listEntries($projectId, LexConfig::EXAMPLE_TRANSLATION);
        $this->assertEquals(6, $result->count);
    }

    public function testListEntries_someEntriesWithNoDefinition_Ok()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        for ($i = 0; $i < 10; $i++) {
            $entry = new LexEntryModel($project);
            $entry->lexeme->form('th', 'Apfel' . $i);
            if ($i % 2 == 0) {
                $sense = new LexSense();
                $entry->senses[] = $sense;
            }
            if ($i % 3 == 0) {
                $sense = new LexSense();
                $sense->definition->form('en', 'apple');
                $sense->partOfSpeech->value = 'noun';
                $entry->senses[] = $sense;
            }
            $entry->write();
        }

        $result = LexEntryCommands::listEntries($projectId);

        $this->assertEquals('Apfel0', $result->entries[0]['lexeme']['th']['value']);
        $this->assertTrue(!array_key_exists('definition', $result->entries[0]['senses'][0]));
        $this->assertEquals('apple', $result->entries[3]['senses'][0]['definition']['en']['value']);
    }
}
