<?php
use models\mapper\Id;

use models\mapper\MongoStore;

require_once(dirname(__FILE__) . '/../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

require_once(TestPath . 'common/MongoTestEnvironment.php');

require_once(SourcePath . "models/UserModel.php");
require_once(SourcePath . "models/ProjectModel.php");

use models\UserModel;
use models\ProjectModel;

class TestProjectModel extends UnitTestCase {

	private $_someProjectId;
	
	function __construct()
	{
		$e = new MongoTestEnvironment();
		$e->clean();
	}
	
	function testWrite_ReadBackSame()
	{
		$model = new ProjectModel();
		$model->language = "SomeLanguage";
		$model->projectname = "SomeProject";
		//$model->users->refs = array('1234');
		$id = $model->write();
		$this->assertNotNull($id);
		$this->assertIsA($id, 'string');
		$this->assertEqual($id, $model->id);
		$otherModel = new ProjectModel(new Id($id));
		$this->assertEqual($id, $otherModel->id->id);
		$this->assertEqual('SomeLanguage', $otherModel->language);
		$this->assertEqual('SomeProject', $otherModel->projectname);
		//$this->assertEqual(array('1234'), $otherModel->users->refs);
		
		$this->_someProjectId = $id;
	}

	function testProjectList_HasCountAndEntries()
	{
		$model = new models\ProjectListModel();
		$model->read();
		
		$this->assertNotEqual(0, $model->count);
		$this->assertNotNull($model->entries);
	}
	
	function testProjectAddUser_ExistingProject_ReadBackAdded() {
		$e = new MongoTestEnvironment();
		
		// setup user and projects
		$userId = $e->createUser('jsmith', 'joe smith', 'joe@email.com');
		$userModel = new UserModel(new Id($userId));
		$projectModel = $e->createProject('new project');
		$projectId = $projectModel->id;
		
		// create the reference
		$projectModel->addUser($userId);
		$userModel->addProject($projectId);
		$projectModel->write();
		$userModel->write();
		
		$this->assertTrue(in_array($userId, $projectModel->users->refs));
		$otherProject = new ProjectModel($projectId);
		$this->assertTrue(in_array($userId, $otherProject->users->refs), "'$userId' not found in project.");
	}
	
	
	// TODO move Project <--> User operations to a separate ProjectUserCommands tests
	
	function testProjectRemoveUser_ExistingProject_Removed() {
		$e = new MongoTestEnvironment();
		
		// setup user and projects
		$userId = $e->createUser('jsmith', 'joe smith', 'joe@email.com');
		$userModel = new UserModel(new Id($userId));
		$projectModel = $e->createProject('new project');
		$projectId = $projectModel->id;

		// create the reference
		$projectModel->addUser($userId);
		$userModel->addProject($projectId);
		$projectModel->write();
		$userModel->write();
		
		// assert the reference is there		
		$this->assertTrue(in_array($userId, $projectModel->users->refs));
		$otherProject = new ProjectModel($projectId);
		$this->assertTrue(in_array($userId, $otherProject->users->refs), "'$userId' not found in project.");
		
		// remove the reference
		$projectModel->removeUser($userId);
		$userModel->removeProject($projectId);
		$projectModel->write();
		$userModel->write();
		
		// testing
		$this->assertFalse(in_array($userId, $projectModel->users->refs));
		$otherProject = new ProjectModel(new Id($this->_someProjectId));
		$this->assertFalse(in_array($userId, $otherProject->users->refs), "'$userId' should not be found in project.");
		$project = new ProjectModel(new Id($this->_someProjectId));
	}
	
	function testProjectAddUser_TwiceToSameProject_AddedOnce() {
		// note I am not testing the reciprocal reference here - 2013-07-09 CJH
		$e = new MongoTestEnvironment();
		
		// setup user and projects
		$userId = $e->createUser('jsmith', 'joe smith', 'joe@email.com');
		$userModel = new UserModel(new Id($userId));
		$projectModel = $e->createProject('new project');
		$projectId = $projectModel->id;
		
		$projectModel->addUser($userId);
		$this->assertEqual(1, count($projectModel->users));
		$projectModel->addUser($userId);
		$this->assertEqual(1, count($projectModel->users));
	}
	
	function testProjectListUsers_TwoUsers_ListHasDetails() {
		$e = new MongoTestEnvironment();
		$userId1 = $e->createUser('user1', 'User One', 'user1@example.com');
		$um1 = new UserModel(new Id($userId1));
		$userId2 = $e->createUser('user2', 'User Two', 'user2@example.com');
		$um2 = new UserModel(new Id($userId2));
		$project = $e->createProject(SF_TESTPROJECT);
		$projectId = $project->id;
		
		// Check the list users is empty
		$result = $project->listUsers();
		$this->assertEqual(0, $result->count);
		$this->assertEqual(array(), $result->entries);
				
		// Add our two users
		$project->addUser($userId1);
		$um1->addProject($projectId);
		$um1->write();
		
		$project->addUser($userId2);
		$um2->addProject($projectId);
		$um2->write();
		$project->write();
		
		$otherProject = new ProjectModel($projectId);
		$result = $otherProject->listUsers();
		$this->assertEqual(2, $result->count);
		$this->assertEqual(
			array(
				array(
		          'email' => 'user1@example.com',
		          'name' => 'User One',
		          'username' => 'user1',
		          'id' => $userId1
				), 
				array(
		          'email' => 'user2@example.com',
		          'name' => 'User Two',
		          'username' => 'user2',
		          'id' => $userId2
				)
			), $result->entries
		);
		
	}
	
	function testRemove_RemovesProject() {
		$e = new MongoTestEnvironment();
		$project = new ProjectModel(new Id($this->_someProjectId));
		$project->remove();
		
		$e->inhibitErrorDisplay();
		$this->expectException(new \Exception("Could not find id '$this->_someProjectId'"));
		$project = new ProjectModel($this->_someProjectId);
		$e->restoreErrorDisplay();
	}
	
	function testDatabaseName_Ok() {
		$project = new ProjectModel();
		$project->projectname = 'Some Project';
		$result = $project->databaseName();
		$this->assertEqual('sf_some_project', $result);
	}
		
}

?>