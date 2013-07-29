<?php

use models\commands\TextCommands;
use models\TextModel;

require_once(dirname(__FILE__) . '/../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

require_once(TestPath . 'common/MongoTestEnvironment.php');

class TestTextCommands extends UnitTestCase {

	function __construct()
	{
	}
	
	function testDeleteTexts_NoThrow() {
		$e = new MongoTestEnvironment();
		$e->clean();
		
		$project = $e->createProject(SF_TESTPROJECT);
		$text = new TextModel($project);
		$text->title = "Some Title";
		$text->write();
		
		TextCommands::deleteTexts($project->id, array($text->id));
		
	}
	
}

?>