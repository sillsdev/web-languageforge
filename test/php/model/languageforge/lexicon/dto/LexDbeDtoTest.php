<?php

use Api\Model\Languageforge\Lexicon\Command\LexEntryCommands;
use Api\Model\Languageforge\Lexicon\Dto\LexDbeDto;
use Api\Model\Languageforge\Lexicon\LexEntryModel;
use Api\Model\Languageforge\Lexicon\LexExample;
use Api\Model\Languageforge\Lexicon\LexSense;
use Api\Model\Languageforge\Lexicon\LexValue;
use Api\Model\Shared\Rights\ProjectRoles;
use Api\Model\Shared\Rights\SystemRoles;
use Api\Model\Shared\UserModel;
use PHPUnit\Framework\TestCase;

class LexDbeDtoTest extends TestCase
{
    /** @var LexiconMongoTestEnvironment Local store of mock test environment */
    private static $environ;

    public function setUp(): void
    {
        self::$environ = new LexiconMongoTestEnvironment();
        self::$environ->clean();
    }

    function testEncode_NoEntries_Ok()
    {
        $userId = self::$environ->createUser("User", "Name", "name@example.com");
        $user = new UserModel($userId);
        $user->role = SystemRoles::USER;

        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $project->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $user->addProject($projectId);
        $user->write();
        $project->write();

        $result = LexDbeDto::encode($projectId, $userId);

        $this->assertCount(0, $result["entries"]);
        $this->assertEquals(0, $result["itemCount"]);
        $this->assertEquals(0, $result["itemTotalCount"]);
    }

    function testEncode_Entries_SortsOk()
    {
        $userId = self::$environ->createUser("User", "Name", "name@example.com");
        $user = new UserModel($userId);
        $user->role = SystemRoles::USER;

        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $project->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $user->addProject($projectId);
        $user->write();
        $project->write();

        $sense = new LexSense();
        $sense->definition->form("en", "apple");

        for ($i = 0; $i < 10; $i++) {
            $entry = new LexEntryModel($project);
            $entry->lexeme->form("th", "Apfel" . $i);
            $entry->senses[] = $sense;
            $entry->write();
        }

        $entry = new LexEntryModel($project);
        $entry->lexeme->form("th", "Aardvark");
        $entry->senses[] = $sense;
        $entry->write();

        $result = LexDbeDto::encode($projectId, $userId);

        $this->assertCount(11, $result["entries"]);
        $this->assertEquals(11, $result["itemCount"]);
        $this->assertEquals(11, $result["itemTotalCount"]);
        $this->assertEquals("Aardvark", $result["entries"][0]["lexeme"]["th"]["value"], "Aardvark should sort first");
    }

    function testEncode_EntriesAndLoadPartial_PartialOk()
    {
        $userId = self::$environ->createUser("User", "Name", "name@example.com");
        $user = new UserModel($userId);
        $user->role = SystemRoles::USER;

        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $project->addUser($userId, ProjectRoles::CONTRIBUTOR);
        $user->addProject($projectId);
        $user->write();
        $project->write();

        $sense = new LexSense();
        $sense->definition->form("en", "apple");

        for ($i = 9; $i >= 0; $i--) {
            $entry = new LexEntryModel($project);
            $entry->lexeme->form("th", "Apfel" . $i);
            $entry->senses[] = $sense;
            $entry->write();
        }

        $result = LexDbeDto::encode($projectId, $userId, null, 5);

        $this->assertCount(5, $result["entries"]);
        $this->assertEquals(5, $result["itemCount"]);
        $this->assertEquals(10, $result["itemTotalCount"]);
        $this->assertEquals("Apfel0", $result["entries"][0]["lexeme"]["th"]["value"], "Apfel0 should sort first");
        $this->assertEquals("Apfel4", $result["entries"][4]["lexeme"]["th"]["value"], "Apfel4 should sort first");

        $result = LexDbeDto::encode($projectId, $userId, null, 9);

        $this->assertCount(1, $result["entries"]);
        $this->assertEquals(1, $result["itemCount"]);
        $this->assertEquals(10, $result["itemTotalCount"]);
        $this->assertEquals("Apfel0", $result["entries"][0]["lexeme"]["th"]["value"], "Apfel0 should sort first");
    }

    function testReadEntry_NoComments_ReadBackOk()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $entry = new LexEntryModel($project);
        $entry->lexeme->form("th", "apple");

        $sense = new LexSense();
        $sense->definition->form("en", "red fruit");
        $sense->partOfSpeech = new LexValue("noun");

        $example = new LexExample();
        $example->sentence->form("th", "example1");
        $example->translation->form("en", "trans1");

        $sense->examples[] = $example;

        $entry->senses[] = $sense;

        $entryId = $entry->write();

        $newEntry = LexEntryCommands::readEntry($projectId, $entryId);

        $this->assertEquals("apple", $newEntry["lexeme"]["th"]["value"]);
        $this->assertEquals("red fruit", $newEntry["senses"][0]["definition"]["en"]["value"]);
        $this->assertEquals("noun", $newEntry["senses"][0]["partOfSpeech"]["value"]);
        $this->assertEquals("example1", $newEntry["senses"][0]["examples"][0]["sentence"]["th"]["value"]);
        $this->assertEquals("trans1", $newEntry["senses"][0]["examples"][0]["translation"]["en"]["value"]);
    }

    // TODO: re-implement this test after the refactor - cjh 2014-07
    /*
    function testReadEntry_HasComments_ReadBackOk() {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $projectId = $project->id->asString();

        $entry = new LexEntryModel($project);
        $entry->lexeme->form('th', 'apple');

        $reply = new LexCommentReply('reply1');
        $comment = new LexCommentModel($project);
        $comment->content = 'this is a comment';
        $comment->score = 5;
        $comment->regarding = 'apple';
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

        $this->assertEquals('apple', $newEntry['lexeme']['th']['value']);
        $this->assertEquals('red fruit', $newEntry['senses'][0]['definition']['en']['value']);
        $this->assertEquals('noun', $newEntry['senses'][0]['partOfSpeech']['value']);
        $this->assertEquals('this is a comment', $newEntry['lexeme']['th']['comments'][0]['content']);
        $this->assertEquals(5, $newEntry['lexeme']['th']['comments'][0]['score']);
        $this->assertEquals('apple', $newEntry['lexeme']['th']['comments'][0]['regarding']);
        $this->assertEquals('reply1', $newEntry['lexeme']['th']['comments'][0]['replies'][0]['content']);
    }
*/
}
