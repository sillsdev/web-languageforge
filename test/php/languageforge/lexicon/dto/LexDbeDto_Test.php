<?php

use models\shared\rights\SystemRoles;

use models\languageforge\lexicon\commands\LexEntryCommands;
use models\languageforge\lexicon\dto\LexDbeDto;
use models\languageforge\lexicon\LexCommentReply;
use models\languageforge\lexicon\LexEntryModel;
use models\languageforge\lexicon\Example;
use models\languageforge\lexicon\Sense;
use models\shared\rights\ProjectRoles;
use models\UserModel;

require_once dirname(__FILE__) . '/../../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPath . 'common/MongoTestEnvironment.php';

class TestLexDbeDto extends UnitTestCase
{
    // TODO: reimplement these tests after the refactor - cjh 2014-07
    /*
	function testEncode_NoEntries_Ok()
	{
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
		$this->assertEqual($result['entriesTotalCount'], 0);
		$this->assertEqual(get_class($result['entry']['lexeme']), 'stdClass', 'blank first entry is not valid');
	}

	function testEncode_Entries_SortsOk()
	{
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

		$sense = new Sense();
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
		$this->assertEqual($result['entriesTotalCount'], 11);
		$this->assertEqual($result['entry']['lexeme']['th']['value'], 'Aardvark', 'Aardvark should sort first');
	}

	function testEncode_EntriesAndLoadPartial_PartialOk()
	{
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

		$sense = new Sense();
		$sense->definition->form('en', 'apple');

		for ($i = 9; $i >= 0; $i--) {
			$entry = new LexEntryModel($project);
			$entry->lexeme->form('th', 'Apfel' . $i);
			$entry->senses[] = $sense;
			$entry->write();
		}

		$result = LexDbeDto::encode($projectId, $userId, 0, 5);

		$this->assertEqual(count($result['entries']), 5);
		$this->assertEqual($result['entriesTotalCount'], 10);
		$this->assertEqual($result['entry']['lexeme']['th']['value'], 'Apfel0', 'Apfel0 should sort first');

		$result = LexDbeDto::encode($projectId, $userId, 4, 5);

		$this->assertEqual(count($result['entries']), 5);
		$this->assertEqual($result['entriesTotalCount'], 10);
		$this->assertEqual($result['entry']['lexeme']['th']['value'], 'Apfel4', 'Apfel4 should sort first');
	}

	function testReadEntry_NoComments_ReadBackOk()
	{
		$e = new LexiconMongoTestEnvironment();
		$e->clean();

		$project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
		$projectId = $project->id->asString();

		$entry = new LexEntryModel($project);
		$entry->lexeme['th'] = new LexiconFieldWithComments('apple');

		$sense = new Sense();
		$sense->definition['en'] = new LexiconFieldWithComments('red fruit');
		$sense->partOfSpeech = new LexiconFieldWithComments('noun');

		$example = new Example();
		$example->sentence['th'] = new LexiconFieldWithComments('example1');
		$example->translation['en'] = new LexiconFieldWithComments('trans1');

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

	function testReadEntry_HasComments_ReadBackOk()
	{
		$e = new LexiconMongoTestEnvironment();
		$e->clean();

		$project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
		$projectId = $project->id->asString();

		$entry = new LexEntryModel($project);
		$entry->lexeme['th'] = new LexiconFieldWithComments('apple');

		$reply = new LexCommentReply('reply1');
		$comment = new LexComment('this is a comment');
		$comment->score = 5;
		$comment->regarding = "apple";
		$comment->replies[] = $reply;

		$entry->lexeme['th']->comments[] = $comment;

		$sense = new Sense();
		$sense->definition['en'] = new LexiconFieldWithComments('red fruit');
		$sense->partOfSpeech = new LexiconFieldWithComments('noun');

		$entry->senses[] = $sense;

		$entryId = $entry->write();

		$newEntry = LexEntryCommands::readEntry($projectId, $entryId);

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
