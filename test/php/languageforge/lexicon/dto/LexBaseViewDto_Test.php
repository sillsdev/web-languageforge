<?php

use models\languageforge\lexicon\dto\LexBaseViewDto;

require_once(dirname(__FILE__) . '/../../../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');
require_once(TestPath . 'common/MongoTestEnvironment.php');

class TestLexBaseViewDto extends UnitTestCase {
	
	function testEncode_Project_DtoCorrect() {
		$e = new LexiconMongoTestEnvironment();
		$e->clean();
		
		$project = $e->createProject(SF_TESTPROJECT);
		$projectId = $project->id->asString();
		
		$dto = LexBaseViewDto::encode($projectId);
		
		// test for a few default values
		$this->assertEqual($dto['config']['inputSystems']['en']['tag'], 'en');
		$this->assertTrue($dto['config']['tasks']['dbe']['visible']);
		$this->assertEqual($dto['config']['entry']['type'], 'fields', 'dto config is not valid');
		$this->assertEqual($dto['config']['entry']['fields']['lexeme']['label'], 'Word');
		$this->assertEqual($dto['config']['entry']['fields']['lexeme']['label'], 'Word');
		$this->assertEqual($dto['config']['entry']['fields']['senses']['fields']['partOfSpeech']['label'], 'Part of Speech');
		$this->assertEqual($dto['project']['projectname'], SF_TESTPROJECT);
	}
	
}

?>
