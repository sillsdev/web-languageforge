<?php
use models\commands\LinkCommands;

require_once(dirname(__FILE__) . '/../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

require_once(TestPath . 'common/MongoTestEnvironment.php');

use models\UserModel;
use models\ProjectModel;

//require_once(SourcePath . "models/UserModel.php");
//require_once(SourcePath . "models/ProjectModel.php");

class TestLinkCommands extends UnitTestCase {

	function __construct()
	{
		$e = new MongoTestEnvironment();
		$e->clean();
	}
	
	// TODO move Project <--> User operations to a separate ProjectUserCommands tests
	
	function testLinkUserAndProject_ExistingUserAndProject_ReadBackAdded() {
		$e = new MongoTestEnvironment();
		
		// setup user and projects
		$userId = $e->createUser('jsmith', 'joe smith', 'joe@email.com');
		$userModel = new UserModel($userId);
		$projectModel = $e->createProject(SF_TESTPROJECT);
		$projectId = $projectModel->id->asString();
		
		// link project and user
		LinkCommands::LinkUserAndProject($projectModel, $userModel);
		
		// read from disk
		$otherUser = new UserModel($userId);
		$otherProject = new ProjectModel($projectId);
		
		$this->assertTrue(in_array($projectId, $otherUser->projects->refs), "project $projectId not found in user->projects");
		$this->assertTrue(in_array($userId, $otherProject->users->refs), "user $userId not found in project->users");
	}

	function testUnlinkUserAndProject_UserInProject_Unlinked() {
		$e = new MongoTestEnvironment();
		
		// setup user and projects
		$userId = $e->createUser('jsmith', 'joe smith', 'joe@email.com');
		$userModel = new UserModel($userId);
		$projectModel = $e->createProject(SF_TESTPROJECT);
		$projectId = $projectModel->id->asString();
		
		// create the link
		LinkCommands::LinkUserAndProject($projectModel, $userModel);
		
		// assert that the reference is there
		$this->assertTrue(in_array($projectId, $userModel->projects->refs), "project $projectId not found in user->projects");
		$this->assertTrue(in_array($userId, $projectModel->users->refs), "user $userId not found in project->users");
		
		// remove the reference
		LinkCommands::UnlinkUserAndProject($projectModel, $userModel);
		
		// read from disk
		$otherUser = new UserModel($userId);
		$otherProject = new ProjectModel($projectId);
		
		$this->assertFalse(in_array($projectId, $otherUser->projects->refs), "project $projectId is still in user->projects");
		$this->assertFalse(in_array($userId, $otherProject->users->refs), "user $userId is still in project->users");
		
	}
	
	function testLinkUserAndProject_LinkTwice_LinkedOnce() {
		$e = new MongoTestEnvironment();
		
		// setup user and projects
		$userId = $e->createUser('jsmith', 'joe smith', 'joe@email.com');
		$userModel = new UserModel($userId);
		$projectModel = $e->createProject(SF_TESTPROJECT);
		$projectId = $projectModel->id->asString();
		
		// link once
		LinkCommands::LinkUserAndProject($projectModel, $userModel);
		
		// read from disk
		$otherUser = new UserModel($userId);
		$otherProject = new ProjectModel($projectId);
		
		$this->assertEqual(1, count($otherUser->projects->refs));
		$this->assertEqual(1, count($otherProject->users->refs));
		
		// link again
		LinkCommands::LinkUserAndProject($projectModel, $userModel);
		
		// read from disk again
		$otherProject->read($projectId);
		$otherUser->read($userId);
		
		$this->assertEqual(1, count($otherUser->projects->refs));
		$this->assertEqual(1, count($otherProject->users->refs));
		
	}
	
}

?>