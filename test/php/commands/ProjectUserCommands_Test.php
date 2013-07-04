<?php
require_once(dirname(__FILE__) . '/../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

require_once(TestPath . 'common/MongoTestEnvironment.php');

//require_once(SourcePath . "models/user_model.php");
//require_once(SourcePath . "models/project_model.php");

require_once(SourcePath . "libraries/api/Project_user_commands.php");

class TestProjectUserCommands extends UnitTestCase {

	function __construct()
	{
		$e = new MongoTestEnvironment();
		$e->clean();
	}
	
	function testAddUser_NoUsers_CreatesUser()
	{
		//$command = new Project_user_commands($projectModel)
	}
	
	function testAddUser_ExistingUser_AddsOk() {
		
	}
	
	

}

?>