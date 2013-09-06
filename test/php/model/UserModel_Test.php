<?php
use models\rights\Roles;

use models\mapper\Id;

use models\commands\LinkCommands;
use models\UserModel;
use models\UserListModel;
use models\ProjectModel;

require_once(dirname(__FILE__) . '/../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

require_once(TestPath . 'common/MongoTestEnvironment.php');

require_once(SourcePath . "models/ProjectModel.php");
require_once(SourcePath . "models/UserModel.php");

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
		$model->avatar_ref = "images/avatar/pinkbat.png";
		$id = $model->write();
		$this->assertNotNull($id);
		$this->assertIsA($id, 'string');
		$this->assertEqual($id, $model->id);
		$otherModel = new UserModel($id);
		$this->assertEqual($id, $otherModel->id);
		$this->assertEqual('user@example.com', $otherModel->email);
		$this->assertEqual('SomeUser', $otherModel->username);
		$this->assertEqual('Some User', $otherModel->name);
		$this->assertEqual('images/avatar/pinkbat.png', $otherModel->avatar_ref);
		
		$this->_someUserId = $id;
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
	
	
	function testUserListProjects_TwoProjects_ListHasDetails() {
		$e = new MongoTestEnvironment();
		$e->clean();
		
		$p1m = $e->createProject('p1');
		$p1 = $p1m->id->asString();
		$p1m = new ProjectModel($p1);
		$p2m = $e->createProject('p2');
		$p2 = $p2m->id->asString();
		
		$userId = $e->createUser('jsmith', 'joe smith', 'joe@smith.com');
		$userModel = new UserModel($userId);
		
		// Check that list projects is empty
		$result = $userModel->listProjects();
		$this->assertEqual(0, $result->count);
		$this->assertEqual(array(), $result->entries);
				
		// Add our two projects
		LinkCommands::LinkUserAndProject($p1m, $userModel, Roles::USER);
		LinkCommands::LinkUserAndProject($p2m, $userModel, Roles::USER);
		
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
	
	function testReadByUserName_userFound_UserModelPopulated() {
		$e = new MongoTestEnvironment();
		$e->clean();
		
		$emailAddress = 'joe@smith.com';
		$e->createUser('jsmith', 'joe smith', $emailAddress);
		
		$user = new UserModel();
		$result = $user->readByUserName('jsmith');
		$this->assertTrue($result);
		$this->assertEqual($user->email, $emailAddress);
	}
	
	function testReadByUserName_userNotFound_EmptyModel() {
		$e = new MongoTestEnvironment();
		$e->clean();
		
		$e->createUser('jsmith', 'joe smith','joe@smith.com');
		
		$user = new UserModel();
		$result = $user->readByUserName('adam');
		$this->assertFalse($result);
		$this->assertEqual($user->email, '');
	}
	
	function testUserNameExists_userExists_true() {
		$e = new MongoTestEnvironment();
		$e->clean();
		
		$e->createUser('jsmith', 'joe smith','joe@smith.com');
		$result = UserModel::userNameExists('jsmith');
		$this->assertTrue($result);
		
	}
	function testUserNameExists_doesNotExist_false() {
		$e = new MongoTestEnvironment();
		$e->clean();
		
		$result = UserModel::userNameExists('jsmith');
		$this->assertFalse($result);
	}
/*
	function testWriteRemove_ListCorrect() {
		$e = new MongoTestEnvironment();
		$e->clean();
	
		$list = new UserListModel();
		$list->read();
		$this->assertEqual(0, $list->count);
		$this->assertEqual(null, $list->entries);
	
		$user = new UserModel();
		$user->name = "Some Name";
		$id = $user->write();
	
		$list = new UserListModel();
		$list->read();
		$this->assertEqual(1, $list->count);
		$this->assertEqual(
			array(array(
				'avatar_ref' => null,
				'email' => null,
				'name' => 'Some Name',
				'username' => null,
				'id' => $id
			)),
			$list->entries
		);
		$user->remove();
	
		$list = new UserListModel();
		$list->read();
		$this->assertEqual(0, $list->count);
		$this->assertEqual(null, $list->entries);
	}
	*/
}

?>