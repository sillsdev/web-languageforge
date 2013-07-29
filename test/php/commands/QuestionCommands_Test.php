<?php

use models\commands\QuestionCommands;
use models\QuestionModel;

require_once(dirname(__FILE__) . '/../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

require_once(TestPath . 'common/MongoTestEnvironment.php');

class TestQuestionCommands extends UnitTestCase {

	function __construct()
	{
	}
	
	function testDeleteQuestions_NoThrow() {
		$e = new MongoTestEnvironment();
		$e->clean();
		
		$project = $e->createProject(SF_TESTPROJECT);
		$question = new QuestionModel($project);
		$question->write();
		
		QuestionCommands::deleteQuestions($project->id, array($question->id));
		
	}
	
}

?>