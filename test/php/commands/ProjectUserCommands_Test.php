<?php

use models\commands\ProjectUserCommands;
use models\ProjectModel;
use models\UserModel;

require_once(dirname(__FILE__) . '/../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

require_once(TestPath . 'common/MongoTestEnvironment.php');

require_once(SourcePath . "models/UserModel.php");
require_once(SourcePath . "models/ProjectModel.php");

class TestProjectUserCommands extends UnitTestCase {

	function testUpdateUser_CreateUserForProject_UserUpdatedAndJoinProject() {
		$e = new MongoTestEnvironment();
		$e->clean();
		
		$project = $e->createProject(SF_TESTPROJECT);
		$projectId = $project->id->asString();
		$params = array(
				'name' => 'New Name',
		);
		
		$command = new ProjectUserCommands($project);
		$newUserID =  $command->updateUser($params);
		
		$newUser = new UserModel($newUserID);
		$this->assertNotEqual($newUserID, '');
		$this->assertEqual($newUser->name, "New Name");
		$this->assertEqual($project->listUsers()->count, 1);
		$this->assertEqual($newUser->listProjects()->count, 1);
	}

	function testUpdateUser_ExistingUserAndProject_UserJoinedProject() {
		$e = new MongoTestEnvironment();
		$e->clean();
	
		$userId = $e->createUser("existinguser", "Existing Name", "existing@example.com");
		$user = new UserModel($userId);
		$project = $e->createProject(SF_TESTPROJECT);
		$projectId = $project->id->asString();
		$params = array(
				'id' => $user->id->asString(),
				'name' => 'New Name',
				'email' => 'newname@example.com'
		);
		
		$command = new ProjectUserCommands($project);
		$updatedUserID =  $command->updateUser($params);
		
		$updatedUser = new UserModel($updatedUserID);
		$this->assertEqual($updatedUser->id, $userId);
		$this->assertEqual($updatedUser->name, "New Name");
		$this->assertEqual($updatedUser->email, "newname@example.com");
		$this->assertEqual($project->listUsers()->count, 1);
		$this->assertEqual($updatedUser->listProjects()->count, 1);
	}
	
	function testAddUser_NoUsers_CreatesUser()
	{
		$e = new MongoTestEnvironment();
		$e->clean();
		// Create project
		$project = $e->createProject(SF_TESTPROJECT);
		$project->language = "SomeLanguage";
		$project->projectname = "SomeProject";
		$projectId = $project->write();
		$currentUserId = '';
		
		// Mock user params
		$params = array(
			"name" => "Some User"
		);
		$command = new models\commands\ProjectUserCommands($project);
		$userId = $command->updateUser($params);
		$this->assertIsA($userId, 'string');
		
		$user = new models\UserModel($userId);
		$this->assertEqual('Some User', $user->name);
	}

}

?>