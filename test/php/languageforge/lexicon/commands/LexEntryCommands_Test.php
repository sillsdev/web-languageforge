<?php

use Api\Model\Command\ProjectCommands;
use Api\Model\Languageforge\Lexicon\Command\LexEntryCommands;
use Api\Model\Languageforge\Lexicon\Config\LexConfig;
use Api\Model\Languageforge\Lexicon\LexExample;
use Api\Model\Languageforge\Lexicon\Guid;
use Api\Model\Languageforge\Lexicon\LexEntryModel;
use Api\Model\Languageforge\Lexicon\LexPicture;
use Api\Model\Languageforge\Lexicon\LexSense;
use Api\Model\Mapper\JsonEncoder;

require_once __DIR__ . '/../../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPhpPath . 'common/MongoTestEnvironment.php';

class TestLexEntryCommands extends UnitTestCase
{
    public function testLexEntryCrud_CreateUpdateDeleteListOk()
    {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        // create an user and add to the project
        $userId = $e->getProjectMember($projectId, 'user1');

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
        $this->assertEqual($dto->count, 0);

        // Create
        $params = JsonEncoder::encode($entry);
        $result1 = LexEntryCommands::updateEntry($projectId, $params, $userId);
        $entryId = $result1['id'];
        $this->assertNotNull($entryId);
        $this->assertEqual(24, strlen($entryId));

        // Read
        $result2 = LexEntryCommands::readEntry($projectId, $entryId);
        $this->assertNotNull($result2['id']);
        $this->assertEqual('SomeEntry', $result2['lexeme']['th']['value']);

        // Update
        $result2['lexeme']['th']['value'] = 'OtherEntry';
        $result3 = LexEntryCommands::updateEntry($projectId, $result2, $userId);
        $this->assertNotNull($result3);
        $this->assertEqual($result3['id'], $entryId);

        // Read back
        $result4 = LexEntryCommands::readEntry($projectId, $entryId);
        $this->assertNotNull($result4['id']);
        $this->assertEqual('OtherEntry', $result4['lexeme']['th']['value']);

        // List
        $dto = LexEntryCommands::listEntries($projectId);
        $this->assertEqual($dto->count, 1);

        // Delete
        $result5 = LexEntryCommands::removeEntry($projectId, $entryId, $userId);
        $this->assertTrue($result5);

        // List to confirm delete
        $dto = LexEntryCommands::listEntries($projectId);
        $this->assertEqual($dto->count, 0);

        // Clean up after ourselves
        ProjectCommands::deleteProjects(array($projectId));
    }

    public function testReadEntry_ReadBackOk()
    {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
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

        $this->assertEqual($newEntry['lexeme']['th']['value'], 'apple');
        $this->assertEqual($newEntry['senses'][0]['definition']['en']['value'], 'red fruit');
        $this->assertEqual($newEntry['senses'][0]['partOfSpeech']['value'], 'noun');
        $this->assertEqual($newEntry['senses'][0]['examples'][0]['sentence']['th']['value'], 'example1');
        $this->assertEqual($newEntry['senses'][0]['examples'][0]['translation']['en']['value'], 'trans1');

    }

    public function testUpdateEntry_DataPersists()
    {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $userId = $e->createUser('john', 'john', 'john');

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

        $this->assertEqual($newEntry['lexeme']['th']['value'], 'rose apple');
        $this->assertEqual($newEntry['senses'][0]['guid'], $senseGuid);
        $this->assertFalse(array_key_exists('liftId', $newEntry['senses'][0]), 'sense liftId should be private');
        $this->assertEqual($newEntry['senses'][0]['definition']['en']['value'], 'red fruit');
        $this->assertEqual($newEntry['senses'][0]['gloss']['en']['value'], 'rose fruit');
        $this->assertEqual($newEntry['senses'][0]['partOfSpeech']['value'], 'noun');
        $this->assertEqual($newEntry['senses'][0]['examples'][0]['guid'], $exampleGuid);
        $this->assertEqual($newEntry['senses'][0]['pictures'][0]['guid'], $pictureGuid);
        $this->assertFalse(array_key_exists('scientificName', $newEntry['senses'][0]), 'should be no empty fields');
        $this->assertFalse(array_key_exists('liftId', $newEntry['senses'][0]['examples'][0]), 'example liftId should be private');
        $this->assertEqual($newEntry['senses'][0]['examples'][0]['sentence']['th']['value'], 'example1');
        $this->assertEqual($newEntry['senses'][0]['examples'][0]['translation']['en']['value'], 'trans1');
    }

    public function testUpdateEntry_ClearedData_DataIsCleared() {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $entry = new LexEntryModel($project);
        $entry->lexeme->form('th', 'apple');
        $entryId = $entry->write();

        $params = json_decode(json_encode(LexEntryCommands::readEntry($projectId, $entryId)), true);
        $params['lexeme']['th']['value'] = '';

        $userId = $e->createUser('john', 'john', 'john');

        LexEntryCommands::updateEntry($projectId, $params, $userId);

        $updatedEntry = LexEntryCommands::readEntry($projectId, $entryId);
        $this->assertEqual($updatedEntry['lexeme']['th']['value'], '');
    }
/* Ignore test for send receive v1.1 since dirtySR counter is not being incremented on edit. IJH 2015-02
    public function testUpdateEntry_ProjectHasSendReceive_EntryHasGuidAndDirtySRIncremented()
    {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $project->sendReceiveProject = new SendReceiveProjectModel('sr_id', 'sr_name', '', 'manager');
        $projectId = $project->write();
        $pidFilePath = sys_get_temp_dir() . '/mockLFMerge.pid';
        $command = 'php mockLFMergeExe.php';
        $mockMergeQueuePath = sys_get_temp_dir() . '/mockLFMergeQueue';
        FileUtilities::createAllFolders($mockMergeQueuePath);

        $userId = $e->createUser('john', 'john', 'john');

        $params['id'] = '';
        $params['lexeme']['th']['value'] = 'apple';

        $newParams = LexEntryCommands::updateEntry($projectId, $params, $userId, $mockMergeQueuePath, $pidFilePath, $command);

        $newEntry = new LexEntryModel($project, $newParams['id']);
        $this->assertTrue(Uuid::isValid($newEntry->guid));
        $this->assertEqual($newEntry->lexeme['th'], 'apple');
        $this->assertEqual($newEntry->dirtySR, 1);

        $newParams['lexeme']['th']['value'] = 'rose apple';

        $updatedParams = LexEntryCommands::updateEntry($projectId, $newParams, $userId, $mockMergeQueuePath, $pidFilePath, $command);

        $updatedEntry = new LexEntryModel($project, $updatedParams['id']);
        $this->assertTrue(Uuid::isValid($updatedEntry->guid));
        $this->assertEqual($updatedEntry->guid, $newEntry->guid);
        $this->assertEqual($updatedEntry->lexeme['th'], 'rose apple');
        $this->assertEqual($updatedEntry->dirtySR, 2);
        FileUtilities::removeFolderAndAllContents($mockMergeQueuePath);
    }
*/
    public function testListEntries_allEntries()
    {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
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
        $this->assertEqual($result->count, 10);
        $this->assertEqual($result->entries[5]['lexeme']['th']['value'], 'Apfel5');
    }

    public function testListEntries_missingInfoDefinition_someEntries()
    {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
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
        $this->assertEqual($result->count, 6);
    }

    public function testListEntries_missingInfoPartOfSpeech_someEntries()
    {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
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
        $this->assertEqual($result->count, 5);

    }

    public function testListEntries_missingInfoExamples_someEntries()
    {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
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
        $this->assertEqual($result->count, 5);

        $result = LexEntryCommands::listEntries($projectId, LexConfig::EXAMPLE_TRANSLATION);
        $this->assertEqual($result->count, 6);
    }

    public function testListEntries_someEntriesWithNoDefinition_Ok()
    {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
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

        $this->assertEqual($result->entries[0]['lexeme']['th']['value'], 'Apfel0');
        $this->assertTrue(!array_key_exists('definition', $result->entries[0]['senses'][0]));
        $this->assertEqual($result->entries[3]['senses'][0]['definition']['en']['value'], 'apple');
    }
}
