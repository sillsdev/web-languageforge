<?php
use models\rights\Roles;

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
		LinkCommands::LinkUserAndProject($projectModel, $userModel, Roles::USER);
		
		// read from disk
		$otherUser = new UserModel($userId);
		$otherProject = new ProjectModel($projectId);
		
		$this->assertTrue(in_array($projectId, $otherUser->projects->refs), "project $projectId not found in user->projects");
		$this->assertTrue(array_key_exists($userId, $otherProject->users->data), "'$userId' not found in project.");
	}

	function testUnlinkUserAndProject_UserInProject_Unlinked() {
		$e = new MongoTestEnvironment();
		
		// setup user and projects
		$userId = $e->createUser('jsmith', 'joe smith', 'joe@email.com');
		$userModel = new UserModel($userId);
		$projectModel = $e->createProject(SF_TESTPROJECT);
		$projectId = $projectModel->id->asString();
		
		// create the link
		LinkCommands::LinkUserAndProject($projectModel, $userModel, Roles::USER);
		
		// assert that the reference is there
		$this->assertTrue(in_array($projectId, $userModel->projects->refs), "project $projectId not found in user->projects");
		$this->assertTrue(array_key_exists($userId, $projectModel->users->data), "'$userId' not found in project.");
		
		// remove the reference
		LinkCommands::UnlinkUserAndProject($projectModel, $userModel);
		
		// read from disk
		$otherUser = new UserModel($userId);
		$otherProject = new ProjectModel($projectId);
		
		$this->assertFalse(in_array($projectId, $otherUser->projects->refs), "project $projectId is still in user->projects");
		$this->assertFalse(array_key_exists($userId, $otherProject->users->data), "'$userId' found in project.");
		
	}
	
	function testLinkUserAndProject_LinkTwice_LinkedOnce() {
		$e = new MongoTestEnvironment();
		
		// setup user and projects
		$userId = $e->createUser('jsmith', 'joe smith', 'joe@email.com');
		$userModel = new UserModel($userId);
		$projectModel = $e->createProject(SF_TESTPROJECT);
		$projectId = $projectModel->id->asString();
		
		// link once
		LinkCommands::LinkUserAndProject($projectModel, $userModel, Roles::USER);
		
		// read from disk
		$otherUser = new UserModel($userId);
		$otherProject = new ProjectModel($projectId);
		
		$this->assertEqual(1, count($otherUser->projects->refs));
		$this->assertEqual(1, count($otherProject->users->data));
		
		// link again
		LinkCommands::LinkUserAndProject($projectModel, $userModel, Roles::USER);
		
		// read from disk again
		$otherProject->read($projectId);
		$otherUser->read($userId);
		
		$this->assertEqual(1, count($otherUser->projects->refs));
		$this->assertEqual(1, count($otherProject->users->data));
		
	}
	
}

?>