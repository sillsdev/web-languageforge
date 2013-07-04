<?php
require_once(dirname(__FILE__) . '/../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

require_once(TestPath . 'common/MongoTestEnvironment.php');

require_once(SourcePath . "models/user_model.php");
require_once(SourcePath . "models/project_model.php");

require_once(SourcePath . "libraries/api/Project_user_commands.php");

class TestProjectUserCommands extends UnitTestCase {

	function __construct()
	{
	}
	
	function testAddUser_NoUsers_CreatesUser()
	{
		$e = new MongoTestEnvironment();
		$e->clean();
		// Create project
		$project = new Project_model();
		$project->language = "SomeLanguage";
		$project->projectname = "SomeProject";
		$projectId = $project->write();
		
		// Mock user object
		$object = array(
			"name" => "Some User"
		);
		$command = new Project_user_commands($project);
		$userId = $command->addUser($object);
		$this->assertTrue(is_string($userId), "userId is not a string");
		
		$user = new User_model($userId);
		$this->assertEqual('Some User', $user->name);
	}
	
	function testAddUser_ExistingUser_AddsOk() {
		
	}
	
	

}

?>