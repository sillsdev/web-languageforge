<?php
require_once(dirname(__FILE__) . '/../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

require_once(TestPath . 'common/MongoTestEnvironment.php');

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
	
	/*
	function testUserListUsers_TwoUsers_ListHasDetails() {
		$e = new MongoTestEnvironment();
		$userId1 = $e->createUser('user1', 'User One', 'user1@example.com');
		$userId2 = $e->createUser('user2', 'User Two', 'user2@example.com');
	
		$project = new User_model($this->_someUserId);
	
		// Check the list users is empty
		$result = $project->listUsers();
		$this->assertEqual(array(), $result);
	
		// Add our two users
		$project->_addProject($userId1);
		$project->_addProject($userId2);
		$project->write();
	
		$otherProject = new User_model($this->_someUserId);
		$result = $project->listUsers();
		$this->assertEqual(array('Bogus'), $result);
	
		User_model::remove($userId1);
		User_model::remove($userId2);
	}
	*/
	
	
}

?>