<?php

use models\languageforge\lexicon\commands\LexEntryCommands;
use models\languageforge\lexicon\commands\LexProjectCommands;
use models\languageforge\lexicon\dto\LexConfigurationDto;
use models\languageforge\lexicon\dto\LexDbeDto;
use models\languageforge\lexicon\settings\LexiconConfigObj;
use models\languageforge\lexicon\Example;
use models\languageforge\lexicon\LexComment;
use models\languageforge\lexicon\LexCommentReply;
use models\languageforge\lexicon\LexEntryModel;
use models\languageforge\lexicon\LexiconFieldWithComments;
use models\languageforge\lexicon\LexiconProjectModel;
use models\languageforge\lexicon\Sense;

require_once(dirname(__FILE__) . '/../../../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');
require_once(TestPath . 'common/MongoTestEnvironment.php');

class TestLexConfigurationDto extends UnitTestCase {
	
	function testEncode_DefaultsOk() {
		$e = new LexiconMongoTestEnvironment();
		$e->clean();
		
		$project = $e->createProject(SF_TESTPROJECT);
		$projectId = $project->id->asString();
		
		$dto = LexConfigurationDto::encode($projectId);
		
		// test for a few default values
		$this->assertEqual($dto['inputSystems']['en']['tag'], 'en');
		$this->assertTrue($dto['tasks']['dbe']['visible']);
		$this->assertEqual($dto['entry']['fields']['lexeme']['label'], 'Word');
		$this->assertEqual($dto['entry']['fields']['lexeme']['label'], 'Word');
		$this->assertEqual($dto['entry']['fields']['senses']['fields']['partOfSpeech']['label'], 'Part of Speech');
	}
}

?>
