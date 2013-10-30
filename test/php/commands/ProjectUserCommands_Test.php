<?php
require_once(dirname(__FILE__) . '/../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

require_once(TestPath . 'common/MongoTestEnvironment.php');

require_once(SourcePath . "models/UserModel.php");
require_once(SourcePath . "models/ProjectModel.php");

class TestProjectUserCommands extends UnitTestCase {

	function __construct()
	{
	}
	
	function testAddUser_NoUsers_CreatesUser()
	{
		$e = new MongoTestEnvironment();
		$e->clean();
		// Create project
		$project = new models\ProjectModel();
		$project->language = "SomeLanguage";
		$project->projectname = "SomeProject";
		$projectId = $project->write();
		$currentUserId = '';
		
		// Mock user params
		$params = array(
			"name" => "Some User"
		);
		$command = new models\commands\ProjectUserCommands($project);
		$userId = $command->updateUser($params, $currentUserId);
		$this->assertIsA($userId, 'string');
		
		$user = new models\UserModel($userId);
		$this->assertEqual('Some User', $user->name);
	}
	
	function testAddUser_ExistingUser_AddsOk() {
		
	}
	
	

}

?>