<?php
require_once(dirname(__FILE__) . '/../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

require_once(TestPath . 'common/MongoTestEnvironment.php');

require_once(SourcePath . "models/ProjectModel.php");
require_once(SourcePath . "models/UserModel.php");

use models\UserModel;
use models\ProjectModel;

class TestUserModel extends UnitTestCase {

	private $_someUserId;
	private $_e;
	
	function __construct()
	{
		$e = new MongoTestEnvironment();
		$e->clean();
	}
	
	function testWrite_ReadBackSame()
	{
		$model = new UserModel();
		$model->email = "user@example.com";
		$model->username = "SomeUser";
		$model->name = "Some User";
		$model->avatarRef = "images/avatar/pinkbat.png";
		$id = $model->write();
		$this->assertNotNull($id);
		$this->assertIsA($id, 'string');
		$otherModel = new UserModel($id);
		$this->assertEqual($id, $otherModel->id);
		$this->assertEqual('user@example.com', $otherModel->email);
		$this->assertEqual('SomeUser', $otherModel->username);
		$this->assertEqual('Some User', $otherModel->name);
		$this->assertEqual('images/avatar/pinkbat.png', $otherModel->avatarRef);
		
		$this->_someUserId = $id;
	}

	function testUserList_HasCountAndEntries()
	{
		$model = new models\UserListModel();
		$model->read();
		
		$this->assertEqual(1, $model->count);
		$this->assertNotNull($model->entries);
		
	}
	
	function testUserTypeahead_HasSomeEntries()
	{
		$model = new models\UserTypeaheadModel('');
		$model->read();
		
		$this->assertEqual(1, $model->count);
		$this->assertNotNull($model->entries);
		$this->assertEqual('Some User', $model->entries[0]['name']);
	}
	
	function testUserTypeahead_HasMatchingEntries()
	{
		$model = new models\UserTypeaheadModel('ome');
		$model->read();
		
		$this->assertEqual(1, $model->count);
		$this->assertNotNull($model->entries);
		$this->assertEqual('Some User', $model->entries[0]['name']);
	}
	
	function testUserTypeahead_HasNoMatchingEntries()
	{
		$model = new models\UserTypeaheadModel('Bogus');
		$model->read();
		
		$this->assertEqual(0, $model->count);
		$this->assertEqual(array(), $model->entries);
	}
	
	function testUserAddProject_ExistingUser_ReadBackAdded() {
		$e = new MongoTestEnvironment();
		
		// setup user and projects
		$userId = $e->createUser('jsmith', 'joe smith', 'joe@email.com');
		$userModel = new UserModel($userId);
		$projectId = $e->createProject('new project');
		$projectModel = new ProjectModel($projectId);
		
		// create the reference
		$userModel->addProject($projectId);
		$userModel->projects->addRef($projectId, $projectModel->users, $userId);
		$userModel->write();
		$projectModel->write();
		
		// read from disk
		$otherUser = new UserModel($userId);
		$otherProject = new ProjectModel($projectId);
		
		$this->assertTrue(in_array($projectId, $otherUser->projects->refs), "project $projectId not found in user->projects");
		$this->assertTrue(in_array($userId, $otherProject->users->refs), "user $userId not found in project->users");
	}
	
	function testUserRemoveProject_ExistingUser_Removed() {
		$e = new MongoTestEnvironment();
		
		// setup user and projects
		$userId = $e->createUser('jsmith', 'joe smith', 'joe@email.com');
		$userModel = new UserModel($userId);
		$projectId = $e->createProject('new project');
		$projectModel = new ProjectModel($projectId);
		
		// create the reference
		$userModel->projects->addRef($projectId, $projectModel->users, $userId);
		$userModel->write();
		$projectModel->write();
		
		// assert that the reference is there
		$this->assertTrue(in_array($projectId, $userModel->projects->refs), "project $projectId not found in user->projects");
		$this->assertTrue(in_array($userId, $projectModel->users->refs), "user $userId not found in project->users");
		
		// remove the reference
		$userModel->projects->removeRef($projectId, $projectModel->users, $userId);
		$userModel->write();
		$projectModel->write();
		
		// read from disk
		$otherUser = new UserModel($userId);
		$otherProject = new ProjectModel($projectId);
		
		$this->assertFalse(in_array($projectId, $otherUser->projects->refs), "project $projectId is still in user->projects");
		$this->assertFalse(in_array($userId, $otherProject->users->refs), "user $userId is still in project->users");
		
	}
	
	function testUserAddProject_TwiceToSameUser_AddedOnce() {
		$e = new MongoTestEnvironment();
		
		// setup user and projects
		$userId = $e->createUser('jsmith', 'joe smith', 'joe@email.com');
		$userModel = new UserModel($userId);
		$projectId = $e->createProject('new project');
		$projectModel = new ProjectModel($projectId);
		
		// create the reference
		$userModel->projects->addRef($projectId, $projectModel->users, $userId);
		$userModel->write();
		$projectModel->write();
		
		// read from disk
		$otherUser = new UserModel($userId);
		$otherProject = new ProjectModel($projectId);
		
		$this->assertEqual(1, count($otherUser->projects->refs));
		$this->assertEqual(1, count($otherProject->users->refs));
		
		// create the same reference again
		$userModel->projects->addRef($projectId, $projectModel->users, $userId);
		$userModel->write();
		$projectModel->write();
		
		// read from disk again
		$otherProject->read();
		$otherUser->read();
		
		$this->assertEqual(1, count($otherUser->projects->refs));
		$this->assertEqual(1, count($otherProject->users->refs));
		
	}
	
	function testUserListProjects_TwoProjects_ListHasDetails() {
		$e = new MongoTestEnvironment();
		
		$p1 = $e->createProject('p1');
		$p1m = new ProjectModel($p1);
		$p2 = $e->createProject('p2');
		$p2m = new ProjectModel($p2);
		
		$userId = $e->createUser('jsmith', 'joe smith', 'joe@smith.com');
		$userModel = new UserModel($userId);
		
		
		
		
		
		// Check that list projects is empty
		$result = $userModel->listProjects();
		$this->assertEqual(0, $result->count);
		$this->assertEqual(array(), $result->entries);
				
		// Add our two projects
		$userModel->addProject($p1);
		$userModel->addProject($p2);
		$result = $userModel->listProjects();
		$this->assertEqual(2, $result->count);
		$this->assertEqual(
			array(
				array(
		          'projectname' => 'p1',
		          'id' => $p1
				),
				array(
		          'projectname' => 'p2',
		          'id' => $p2
				)
			), $result->entries
		);
	}
	
}

?>