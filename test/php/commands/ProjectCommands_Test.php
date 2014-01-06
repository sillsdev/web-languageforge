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
		
		ProjectCommands::deleteProjects(array($projectId), 'bogus userid');
	}

	function testUpdateUserRole_UpdateUserInProject_UserJoinedProject() {
		$e = new MongoTestEnvironment();
		$e->clean();
	
		// setup parameters: user, project and params
		$userId = $e->createUser("existinguser", "Existing Name", "existing@example.com");
		$user = new UserModel($userId);
		$project = $e->createProject(SF_TESTPROJECT);
		$projectId = $project->id->asString();
		$params = array(
				'id' => $user->id->asString(),
				'role' => Roles::PROJECT_ADMIN,
		);
	
		// update user role in project
		$updatedUserId = ProjectCommands::updateUserRole($projectId, $params, 'bogus userid');
	
		// read from disk
		$updatedUser = new UserModel($updatedUserId);
		$sameProject = new ProjectModel($projectId);
		
		// user updated and joined to project
		$this->assertEqual($updatedUser->id, $userId);
		$this->assertNotEqual($updatedUser->role, Roles::PROJECT_ADMIN);
		$projectUser = $sameProject->listUsers()->entries[0];
		$this->assertEqual($projectUser['name'], "Existing Name");
		$userProject = $updatedUser->listProjects()->entries[0];
		$this->assertEqual($userProject['projectname'], SF_TESTPROJECT);
	}
	
	function testUpdateUserRole_JoinTwice_JoinedOnce() {
		$e = new MongoTestEnvironment();
		$e->clean();
		
		// setup user and project
		$project = $e->createProject(SF_TESTPROJECT);
		$projectId = $project->id->asString();
		$userId = $e->createUser("existinguser", "Existing Name", "existing@example.com");
		$params = array(
				'id' => $userId,
		);
		
		// update user role in project once
		$updatedUserId = ProjectCommands::updateUserRole($projectId, $params, 'bogus userid');
		
		// read from disk
		$sameUser = new UserModel($updatedUserId);
		$sameProject = new ProjectModel($projectId);
		
		// user in project once and project has one user
		$this->assertEqual($sameProject->listUsers()->count, 1);
		$this->assertEqual($sameUser->listProjects()->count, 1);
		
		// update user role in project again
		$updatedUserId = ProjectCommands::updateUserRole($projectId, $params, 'bogus userid');
		
		// read from disk again
		$sameProject->read($projectId);
		$sameUser->read($updatedUserId);
		
		// user still in project once and project still has one user
		$this->assertEqual($sameProject->listUsers()->count, 1);
		$this->assertEqual($sameUser->listProjects()->count, 1);
	}
	
	function testRemoveUsers_NoUsers_NoThrow() {
		$e = new MongoTestEnvironment();
		$e->clean();
		
		// setup parameters: project and users
		$project = $e->createProject(SF_TESTPROJECT);
		$projectId = $project->id->asString();
		$userIds = array();
		
		// there are no users in project
		$this->assertEqual($project->listUsers()->count, 0);
		
		// remove users from project with no users - no throw expected
		ProjectCommands::removeUsers($projectId, $userIds, 'bogus auth userid');
	}

	function testRemoveUsers_UsersInProject_RemovedFromProject() {
		$e = new MongoTestEnvironment();
		$e->clean();

		// setup project and users
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
		
		// read from disk
		$otherProject = new ProjectModel($projectId);
		$otherUser1 = new UserModel($user1Id);
		$otherUser2 = new UserModel($user2Id);
		$otherUser3 = new UserModel($user3Id);
		
		// each user in project, project has each user
		$user1Project = $otherUser1->listProjects()->entries[0];
		$this->assertEqual($user1Project['projectname'], SF_TESTPROJECT);
		$user2Project = $otherUser1->listProjects()->entries[0];
		$this->assertEqual($user2Project['projectname'], SF_TESTPROJECT);
		$user3Project = $otherUser1->listProjects()->entries[0];
		$this->assertEqual($user3Project['projectname'], SF_TESTPROJECT);
		$projectUser1 = $otherProject->listUsers()->entries[0];
		$this->assertEqual($projectUser1['username'], "user1name");
		$projectUser2 = $otherProject->listUsers()->entries[1];
		$this->assertEqual($projectUser2['username'], "user2name");
		$projectUser3 = $otherProject->listUsers()->entries[2];
		$this->assertEqual($projectUser3['username'], "user3name");
		
		// remove users from project
		$userIds = array($user1->id->asString(), $user2->id->asString(), $user3->id->asString());
		ProjectCommands::removeUsers($projectId, $userIds, 'bogus auth userids');
		
		// read from disk
		$sameProject = new ProjectModel($projectId);
		$sameUser1 = new UserModel($user1Id);
		$sameUser2 = new UserModel($user2Id);
		$sameUser3 = new UserModel($user3Id);
		
		// project has no users, each user not in project
		$this->assertEqual($sameProject->listUsers()->count, 0);
		$this->assertEqual($sameUser1->listProjects()->count, 0);
		$this->assertEqual($sameUser2->listProjects()->count, 0);
		$this->assertEqual($sameUser3->listProjects()->count, 0);
	}
	
}

?>
