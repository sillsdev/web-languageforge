<?php
require_once(dirname(__FILE__) . '/../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

require_once(TestPath . 'common/MongoTestEnvironment.php');

require_once(SourcePath . "models/project_model.php");

require_once(SourcePath . "models/user_model.php");

class TestUserModel extends UnitTestCase {

	private $_someUserId;
	
	function __construct()
	{
		$e = new MongoTestEnvironment();
		$e->clean();
	}
	
	function testWrite_ReadBackSame()
	{
		$model = new User_model();
		$model->email = "user@example.com";
		$model->username = "SomeUser";
		$model->name = "Some User";
		$model->avatarRef = "images/avatar/pinkbat.png";
		$id = $model->write();
		$this->assertNotNull($id);
		$this->assertIsA($id, 'string');
		$otherModel = new User_model($id);
		$this->assertEqual($id, $otherModel->id);
		$this->assertEqual('user@example.com', $otherModel->email);
		$this->assertEqual('SomeUser', $otherModel->username);
		$this->assertEqual('Some User', $otherModel->name);
		$this->assertEqual('images/avatar/pinkbat.png', $otherModel->avatarRef);
		
		$this->_someUserId = $id;
	}

	function testUserList_HasCountAndEntries()
	{
		$model = new User_list_model();
		$model->read();
		
		$this->assertEqual(1, $model->count);
		$this->assertNotNull($model->entries);
		
	}
	
	function testUserTypeahead_HasSomeEntries()
	{
		$model = new User_typeahead_model('');
		$model->read();
		
		$this->assertEqual(1, $model->count);
		$this->assertNotNull($model->entries);
		$this->assertEqual('Some User', $model->entries[0]['name']);
	}
	
	function testUserTypeahead_HasMatchingEntries()
	{
		$model = new User_typeahead_model('ome');
		$model->read();
		
		$this->assertEqual(1, $model->count);
		$this->assertNotNull($model->entries);
		$this->assertEqual('Some User', $model->entries[0]['name']);
	}
	
	function testUserTypeahead_HasNoMatchingEntries()
	{
		$model = new User_typeahead_model('Bogus');
		$model->read();
		
		$this->assertEqual(0, $model->count);
		$this->assertEqual(array(), $model->entries);
	}
	
	function testUserAddProject_ExistingUser_ReadBackAdded() {
		$user = new User_model($this->_someUserId);
	
		$projectId = 'BogusId'; // Note: The user doesn't really need to exist for this test.
		$user->_addProject($projectId);
		$user->write();
	
		$this->assertTrue(in_array($projectId, $user->projects));
		$otherUser = new User_model($this->_someUserId);
		$this->assertTrue(in_array($projectId, $otherUser->projects), "'$projectId' not found in user.");
	}
	
	function testUserRemoveProject_ExistingUser_Removed() {
		$user = new User_model($this->_someUserId);
	
		$projectId = 'BogusId'; // Note: The user doesn't really need to exist for this test.
		$user->_addProject($projectId);
		$user->write();
	
		$this->assertTrue(in_array($projectId, $user->projects));
		$otherUser = new User_model($this->_someUserId);
		$this->assertTrue(in_array($projectId, $otherUser->projects), "'$projectId' not found in user.");
	
		// Test really starts here.
		$user->_removeProject($projectId);
		$user->write();
	
		$this->assertFalse(in_array($projectId, $user->projects));
		$otherUser = new User_model($this->_someUserId);
		$this->assertFalse(in_array($projectId, $otherUser->projects), "'$projectId' should not be found in user.");
	
	}
	
	function testUserAddProject_TwiceToSameUser_AddedOnce() {
		$user = new User_model($this->_someUserId);
	
		$projectId = 'BogusId'; // Note: The user doesn't really need to exist for this test.
		$user->_addProject($projectId);
		// Note: We intentionall don't write for this test. It is unnecessary for this test.
	
		$this->assertEqual(1, count($user->projects));
		$user->_addProject($projectId);
		$this->assertEqual(1, count($user->projects));
	}
	
	function testUserRemoveProject_NonExistingProject_Throws() {
		$e = new MongoTestEnvironment();
		$user = new User_model($this->_someUserId);
	
		$projectId = 'BogusId'; // Note: The user doesn't really need to exist for this test.
		$e->inhibitErrorDisplay();
		try {
			$user->_removeProject($projectId);
		} catch (Exception $ex) {
			$caught = true;
		}
		$this->assertTrue($caught);
		$e->restoreErrorDisplay();
	}
	
	function testUserListProjects_TwoProjects_ListHasDetails() {
		$e = new MongoTestEnvironment();
		$e->clean();
		
		$userId1 = $e->createUser('user1', 'User One', 'user1@example.com');
		$userId2 = $e->createUser('user2', 'User Two', 'user2@example.com');
		
		$projectId = $e->createProject("Project One");
		$project = new Project_model($projectId);
		
		// Check the list users is empty
		$result = $project->listUsers();
		$this->assertEqual(0, $result->count);
		$this->assertEqual(array(), $result->entries);
				
		// Add our two users
		$project->addUser($userId1);
		$project->addUser($userId2);
		$project->write();
				
		$otherUser = new User_model($userId1);
		$result = $otherUser->listProjects();
		$this->assertEqual(1, $result->count);
		$this->assertEqual(
			array(
				array(
		          'projectname' => 'Project One',
		          'id' => $projectId
				)
			), $result->entries
		);

 		User_model::remove($userId1);
 		User_model::remove($userId2);
 		Project_model::remove($projectId);
	}
	
}

?>