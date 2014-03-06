<?php

use models\languageforge\lexicon\commands\LexEntryCommands;

use models\languageforge\lexicon\LexCommentReply;

use models\languageforge\lexicon\LexComment;

use models\languageforge\lexicon\Example;

use models\languageforge\lexicon\Sense;

use models\languageforge\lexicon\LexiconFieldWithComments;

use models\languageforge\lexicon\LexEntryModel;

use models\languageforge\lexicon\LexiconProjectModel;

require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

require_once(TestPath . 'common/MongoTestEnvironment.php');

class TestLexEntryCommands extends UnitTestCase {
	
	function testReadEntry_NoComments_ReadBackOk() {
		$e = new LexiconMongoTestEnvironment();
		$e->clean();
		
		$project = $e->createProject(SF_TESTPROJECT);
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

	function testReadEntry_HasComments_ReadBackOk() {
		$e = new LexiconMongoTestEnvironment();
		$e->clean();
		
		$project = $e->createProject(SF_TESTPROJECT);
		$projectId = $project->id->asString();
		
		$entry = new LexEntryModel($project);
		$entry->lexeme['th'] = new LexiconFieldWithComments('apple');
		
		$reply = new LexCommentReply('reply1');
		$comment = new LexComment('this is a comment');
		$comment->score = 5;
		$comment->regarding = "apple";
		$comment->subcomments[] = $reply;
		
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
		$this->assertEqual($newEntry['lexeme']['th']['comments'][0]['subcomments'][0]['content'], 'reply1');


	}
	
	function testUpdateEntry_DataPersists() {
		$e = new LexiconMongoTestEnvironment();
		$e->clean();
		
		$project = $e->createProject(SF_TESTPROJECT);
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

		$params = LexEntryCommands::readEntry($projectId, $entryId);
		$params['lexeme']['th']['value'] = 'rose apple';
		$params['senses'][0]['partOfSpeech']['comments'] = array(array('content' => 'i vote for adj'));
		
		LexEntryCommands::updateEntry($projectId, $entryId, $params);
		
		$newEntry = LexEntryCommands::readEntry($projectId, $entryId);

		$this->assertEqual($newEntry['lexeme']['th']['value'], 'rose apple');
		$this->assertEqual($newEntry['senses'][0]['definition']['en']['value'], 'red fruit');
		$this->assertEqual($newEntry['senses'][0]['partOfSpeech']['value'], 'noun');
		$this->assertEqual($newEntry['senses'][0]['examples'][0]['sentence']['th']['value'], 'example1');
		$this->assertEqual($newEntry['senses'][0]['examples'][0]['translation']['en']['value'], 'trans1');
		$this->assertEqual($newEntry['senses'][0]['partOfSpeech']['comments'][0]['content'], 'i vote for adj');
		
	}
}

?>
