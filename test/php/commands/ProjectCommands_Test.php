<?php
use models\commands\ProjectCommands;
use models\UserModel;
use models\ProjectModel;
use models\rights\Roles;
use models\mapper\Id;

require_once(dirname(__FILE__) . '/../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

require_once(TestPath . 'common/MongoTestEnvironment.php');

class TestProjectCommands extends UnitTestCase {

	function testDeleteProjects_NoThrow() {
		$e = new MongoTestEnvironment();
		$e->clean();
		
		$project = $e->createProject(SF_TESTPROJECT);
		$projectId = $project->id->asString();
		
		ProjectCommands::deleteProjects(array($projectId));
	}
/* TODO test for no user IJH 2013-11	
	function testAddExistingUser_ProjectAndNoUser() {
		$e = new MongoTestEnvironment();
		$e->clean();
		
		$userId = '12342314';
		$project = $e->createProject(SF_TESTPROJECT);
		$projectId = $project->id->asString();
		
		$updatedUserID = ProjectCommands::addExistingUser($projectId, $userId);
		
		$updatedUser = new UserModel($updatedUserID);
		$this->assertEqual($updatedUser->id, $userId);
		$this->assertEqual($updatedUser->name, "Existing Name");
		$this->assertEqual($updatedUser->email, "existing@example.com");
		$this->assertEqual($project->listUsers()->count, 1);
		$this->assertEqual($updatedUser->listProjects()->count, 1);
	}
*/	
	function testAddExistingUser_ExistingUserAndProject_UserJoinedProject() {
		$e = new MongoTestEnvironment();
		$e->clean();
		
		$userId = $e->createUser("existinguser", "Existing Name", "existing@example.com");
		$user = new UserModel($userId);
		$project = $e->createProject(SF_TESTPROJECT);
		$projectId = $project->id->asString();
		
		$updatedUserID = ProjectCommands::addExistingUser($projectId, $userId);
		
		$updatedUser = new UserModel($updatedUserID);
		$this->assertEqual($updatedUser->id, $userId);
		$this->assertEqual($updatedUser->name, "Existing Name");
		$this->assertEqual($updatedUser->email, "existing@example.com");
		$this->assertEqual($project->listUsers()->count, 1);
		$this->assertEqual($updatedUser->listProjects()->count, 1);
	}
	
	function testRemoveUsers_NoUsers_NoThrow() {
		$e = new MongoTestEnvironment();
		$e->clean();
		
		$project = $e->createProject(SF_TESTPROJECT);
		$projectId = $project->id->asString();
		$userIds = array();
		
		$this->assertEqual($project->listUsers()->count, 0);
		ProjectCommands::removeUsers($projectId, $userIds);
	}

	function testRemoveUsers_UsersInProject_RemovedFromProject() {
		$e = new MongoTestEnvironment();
		$e->clean();

		$project = $e->createProject(SF_TESTPROJECT);
		$projectId = $project->id->asString();
		$user1Id = $e->createUser("user1name", "User1 Name", "user1@example.com");
		$user2Id = $e->createUser("user2name", "User2 Name", "user2@example.com");
		$user3Id = $e->createUser("user3name", "User3 Name", "user3@example.com");
		$user1 = new UserModel($user1Id);
		$user2 = new UserModel($user2Id);
		$user3 = new UserModel($user3Id);
		$project->addUser($user1->id->asString(), Roles::USER);
		$project->addUser($user2->id->asString(), Roles::USER);
		$project->addUser($user3->id->asString(), Roles::USER);
		$project->write();
		$user1->addProject($project->id->asString());
		$user1->write();
		$user2->addProject($project->id->asString());
		$user2->write();
		$user3->addProject($project->id->asString());
		$user3->write();
		$userIds = array($user1->id->asString(), $user2->id->asString(), $user3->id->asString());
		
		$this->assertEqual($project->listUsers()->count, 3);
		$this->assertEqual($user1->listProjects()->count, 1);
		$this->assertEqual($user2->listProjects()->count, 1);
		$this->assertEqual($user3->listProjects()->count, 1);
		
		ProjectCommands::removeUsers($projectId, $userIds);
		
		$this->assertEqual($project->listUsers()->count, 0);
		$this->assertEqual($user1->listProjects()->count, 0);
		$this->assertEqual($user2->listProjects()->count, 0);
		$this->assertEqual($user3->listProjects()->count, 0);
	}
	
}

?>
