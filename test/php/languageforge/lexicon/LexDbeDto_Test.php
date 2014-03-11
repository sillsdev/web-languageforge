<?php

use models\languageforge\lexicon\dto\LexDbeDto;

use models\languageforge\lexicon\settings\LexiconConfigObj;

use models\languageforge\lexicon\commands\LexProjectCommands;

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

class TestLexDbeDto extends UnitTestCase {
	
	function testEncode_noEntries_ok() {
		$e = new LexiconMongoTestEnvironment();
		$e->clean();
		
		$project = $e->createProject(SF_TESTPROJECT);
		$projectId = $project->id->asString();
		
		$result = LexDbeDto::encode($projectId);
		$this->assertEqual($result['config']['entry']['type'], 'fields', 'dto config is not valid');
		$this->assertEqual(count($result['entries']), 0);
		$this->assertEqual(get_class($result['entry']['lexeme']), 'stdClass', 'blank first entry is not valid');
		
	}
	
	function testEncode_entries_sortsOk() {
		$e = new LexiconMongoTestEnvironment();
		$e->clean();
		
		$project = $e->createProject(SF_TESTPROJECT);
		$projectId = $project->id->asString();
		
		
		$sense = new Sense();
		$sense->definition->form('en', 'apple');
		
		for ($i = 0; $i < 10; $i++) {
			$entry = new LexEntryModel($project);
			$entry->lexeme->form('en', 'Apfel' . $i);
			$entry->senses[] = $sense;
			$entry->write();
		}
		
		$entry = new LexEntryModel($project);
		$entry->lexeme->form('en', 'Aardvark');
		$entry->senses[] = $sense;
		$entry->write();

		$result = LexDbeDto::encode($projectId);
		$this->assertEqual($result['config']['entry']['type'], 'fields', 'dto config is not valid');
		$this->assertEqual(count($result['entries']), 11);
		$this->assertEqual($result['entry']['lexeme']['en']['value'], 'Aardvark', 'Aardvark should sort first');
		
	}
	
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
	
	function testListEntries_allEntries() {
		$e = new LexiconMongoTestEnvironment();
		$e->clean();
		
		$project = $e->createProject(SF_TESTPROJECT);
		$projectId = $project->id->asString();
		
		$sense = new Sense();
		$sense->definition['en'] = new LexiconFieldWithComments('apple');
		
		for ($i = 0; $i < 10; $i++) {
			$entry = new LexEntryModel($project);
			$entry->lexeme['de'] = new LexiconFieldWithComments('Apfel' . $i);
			$entry->senses[] = $sense;
			$entry->write();
		}
		
		$result = LexEntryCommands::listEntries($projectId);
		$this->assertEqual($result->count, 10);
		$this->assertEqual($result->entries[5]['lexeme']['de']['value'], 'Apfel5');
	}
	
	function testListEntries_missingInfoDefinition_someEntries() {
		$e = new LexiconMongoTestEnvironment();
		$e->clean();
		
		$project = $e->createProject(SF_TESTPROJECT);
		$projectId = $project->id->asString();
		
		$sense = new Sense();
		$sense->definition['en'] = new LexiconFieldWithComments('apple');
		
		$senseNoDef = new Sense();
		$senseNoDef->definition['en'] = new LexiconFieldWithComments();
		
		for ($i = 0; $i < 10; $i++) {
			$entry = new LexEntryModel($project);
			$entry->lexeme['de'] = new LexiconFieldWithComments('Apfel' . $i);
			if ($i % 2 == 0) {
				$entry->senses[] = $sense;
			}
			$entry->write();
		}
		$entry = new LexEntryModel($project);
		$entry->lexeme['de'] = new LexiconFieldWithComments('Apfel');
		$entry->senses[] = $senseNoDef;
		$entry->write();
		
		$result = LexEntryCommands::listEntries($projectId, LexiconConfigObj::DEFINITION);
		$this->assertEqual($result->count, 6);
	}

	function testListEntries_missingInfoPartOfSpeech_someEntries() {
		$e = new LexiconMongoTestEnvironment();
		$e->clean();
		
		$project = $e->createProject(SF_TESTPROJECT);
		$projectId = $project->id->asString();
		
		$sense = new Sense();
		$sense->definition['en'] = new LexiconFieldWithComments('apple');
		$sense->partOfSpeech = new LexiconFieldWithComments('noun');
		
		$senseNoPos = new Sense();
		$senseNoPos->definition['en'] = new LexiconFieldWithComments('orange');
		
		for ($i = 0; $i < 10; $i++) {
			$entry = new LexEntryModel($project);
			$entry->lexeme['de'] = new LexiconFieldWithComments('Apfel' . $i);
			$entry->senses[] = $sense;
			if ($i % 2 == 0) {
				$entry->senses[] = $senseNoPos;
			}
			$entry->write();
		}
		
		$result = LexEntryCommands::listEntries($projectId, LexiconConfigObj::POS);
		$this->assertEqual($result->count, 5);
		
	}

	function testListEntries_missingInfoExamples_someEntries() {
		$e = new LexiconMongoTestEnvironment();
		$e->clean();
		
		$project = $e->createProject(SF_TESTPROJECT);
		$projectId = $project->id->asString();
		
		
		
		for ($i = 0; $i < 10; $i++) {
			$entry = new LexEntryModel($project);
			$entry->lexeme['de'] = new LexiconFieldWithComments('Apfel' . $i);
			$sense = new Sense();
			$sense->definition['en'] = new LexiconFieldWithComments('apple');
			$sense->partOfSpeech = new LexiconFieldWithComments('noun');
			$example = new Example();
			if ($i % 2 == 0) {
				$example->sentence['de'] = new LexiconFieldWithComments('Ich esse Apfeln oft');
			}
			if ($i % 3 == 0) {
				$example->translation['en'] = new LexiconFieldWithComments('I eat Apples often');
			}
			$sense->examples[] = $example;
			$entry->senses[] = $sense;
			$entry->write();
		}
		
		$result = LexEntryCommands::listEntries($projectId, LexiconConfigObj::EXAMPLE_SENTENCE);
		$this->assertEqual($result->count, 5);

		$result = LexEntryCommands::listEntries($projectId, LexiconConfigObj::EXAMPLE_TRANSLATION);
		$this->assertEqual($result->count, 6);
	}
}

?>
