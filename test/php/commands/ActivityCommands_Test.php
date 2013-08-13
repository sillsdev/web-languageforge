<?php
use models\commands\ProjectCommands;

require_once(dirname(__FILE__) . '/../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

require_once(TestPath . 'common/MongoTestEnvironment.php');

class TestActivityCommands extends UnitTestCase {

	function __construct()
	{
	}
	
	function testUpdateComment_ActivityExists() {
		$e = new MongoTestEnvironment();
		$e->clean();
		
		$project = $e->createProject(SF_TESTPROJECT);
		$projectId = $project->id->asString();
	}

    function testUpdateAnswer_ActivityExists() {
    }

    function testAddText_ActivityExists() {
    }

    function testAddQuestion_ActivityExists() {
    }

    function testAddUserToProject_ActivityExists() {
    }

    function testUpdateScore_ActivityExists() {
    }


	
}

?>
