<?php

use Api\Model\Languageforge\Lexicon\Command\LexEntryCommands;
use Api\Model\Languageforge\Lexicon\Dto\LexDbeDto;
use Api\Model\Languageforge\Lexicon\LexExample;
use Api\Model\Languageforge\Lexicon\LexCommentReply;
use Api\Model\Languageforge\Lexicon\LexCommentModel;
use Api\Model\Languageforge\Lexicon\LexEntryModel;
use Api\Model\Languageforge\Lexicon\LexValue;
use Api\Model\Languageforge\Lexicon\LexSense;
use Api\Model\Shared\Rights\ProjectRoles;
use Api\Model\Shared\Rights\SystemRoles;
use Api\Model\UserModel;

require_once __DIR__ . '/../../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPhpPath . 'common/MongoTestEnvironment.php';

class TestLexDbeDto extends UnitTestCase
{
    function testEncode_NoEntries_Ok() {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        $userId = $e->createUser("User", "Name", "name@example.com");
        $user = new UserModel($userId);
        $user->role = SystemRoles::USER;

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $project->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $user->addProject($projectId);
        $user->write();
        $project->write();

        $result = LexDbeDto::encode($projectId, $userId);

        $this->assertEqual(count($result['entries']), 0);
        $this->assertEqual($result['itemCount'], 0);
        $this->assertEqual($result['itemTotalCount'], 0);
    }

    function testEncode_Entries_SortsOk() {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        $userId = $e->createUser("User", "Name", "name@example.com");
        $user = new UserModel($userId);
        $user->role = SystemRoles::USER;

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $project->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $user->addProject($projectId);
        $user->write();
        $project->write();

        $sense = new LexSense();
        $sense->definition->form('en', 'apple');

        for ($i = 0; $i < 10; $i++) {
            $entry = new LexEntryModel($project);
            $entry->lexeme->form('th', 'Apfel' . $i);
            $entry->senses[] = $sense;
            $entry->write();
        }

        $entry = new LexEntryModel($project);
        $entry->lexeme->form('th', 'Aardvark');
        $entry->senses[] = $sense;
        $entry->write();

        $result = LexDbeDto::encode($projectId, $userId);

        $this->assertEqual(count($result['entries']), 11);
        $this->assertEqual($result['itemCount'], 11);
        $this->assertEqual($result['itemTotalCount'], 11);
        $this->assertEqual($result['entries'][0]['lexeme']['th']['value'], 'Aardvark', 'Aardvark should sort first');
    }

    function testEncode_EntriesAndLoadPartial_PartialOk() {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        $userId = $e->createUser("User", "Name", "name@example.com");
        $user = new UserModel($userId);
        $user->role = SystemRoles::USER;

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $project->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $user->addProject($projectId);
        $user->write();
        $project->write();

        $sense = new LexSense();
        $sense->definition->form('en', 'apple');

        for ($i = 9; $i >= 0; $i--) {
            $entry = new LexEntryModel($project);
            $entry->lexeme->form('th', 'Apfel' . $i);
            $entry->senses[] = $sense;
            $entry->write();
        }

        $result = LexDbeDto::encode($projectId, $userId, null, 5);

        $this->assertEqual(count($result['entries']), 5);
        $this->assertEqual($result['itemCount'], 5);
        $this->assertEqual($result['itemTotalCount'], 10);
        $this->assertEqual($result['entries'][0]['lexeme']['th']['value'], 'Apfel0', 'Apfel0 should sort first');
        $this->assertEqual($result['entries'][4]['lexeme']['th']['value'], 'Apfel4', 'Apfel4 should sort first');

        $result = LexDbeDto::encode($projectId, $userId, null, 9);

        $this->assertEqual(count($result['entries']), 1);
        $this->assertEqual($result['itemCount'], 1);
        $this->assertEqual($result['itemTotalCount'], 10);
        $this->assertEqual($result['entries'][0]['lexeme']['th']['value'], 'Apfel0', 'Apfel0 should sort first');
    }

    function testReadEntry_NoComments_ReadBackOk() {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $entry = new LexEntryModel($project);
        $entry->lexeme->form('th', 'apple');

        $sense = new LexSense();
        $sense->definition->form('en', 'red fruit');
        $sense->partOfSpeech = new LexValue('noun');

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

    // TODO: re-implement this test after the refactor - cjh 2014-07
/*
    function testReadEntry_HasComments_ReadBackOk() {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $entry = new LexEntryModel($project);
        $entry->lexeme->form('th', 'apple');

        $reply = new LexCommentReply('reply1');
        $comment = new LexCommentModel($project);
        $comment->content = 'this is a comment';
        $comment->score = 5;
        $comment->regarding = "apple";
        $comment->replies[] = $reply;

//        $entry->lexeme['th']->comments[] = $comment;

        $sense = new LexSense();
        $sense->definition->form('en', 'red fruit');
        $sense->partOfSpeech = new LexValue('noun');

        $entry->senses[] = $sense;

        $entryId = $entry->write();

        $newEntry = LexEntryCommands::readEntry($projectId, $entryId);

        echo '<pre>';
        var_dump($newEntry);
        echo '</pre>';

        $this->assertEqual($newEntry['lexeme']['th']['value'], 'apple');
        $this->assertEqual($newEntry['senses'][0]['definition']['en']['value'], 'red fruit');
        $this->assertEqual($newEntry['senses'][0]['partOfSpeech']['value'], 'noun');
        $this->assertEqual($newEntry['lexeme']['th']['comments'][0]['content'], 'this is a comment');
        $this->assertEqual($newEntry['lexeme']['th']['comments'][0]['score'], 5);
        $this->assertEqual($newEntry['lexeme']['th']['comments'][0]['regarding'], 'apple');
        $this->assertEqual($newEntry['lexeme']['th']['comments'][0]['replies'][0]['content'], 'reply1');
    }
*/
}
