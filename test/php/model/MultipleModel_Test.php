<?php
require_once(dirname(__FILE__) . '/../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

require_once(SourcePath . "models/project_model.php");
require_once(SourcePath . "models/user_model.php");

class TestMultipleModel extends UnitTestCase {

	function __construct()
	{
	}
	
	function testWrite_TwoModels_ReadBackBothModelsOk()
	{
		$model = new User_model();
		$model->email = "user@example.com";
		$model->username = "SomeUser";
		$id = $model->write();
		$this->assertNotNull($id);
		$this->assertIsA($id, 'string');
		$otherModel = new User_model($id);
		$this->assertEqual($id, $otherModel->id);
		$this->assertEqual('user@example.com', $otherModel->email);
		$this->assertEqual('SomeUser', $otherModel->username);

		$model = new Project_model();
		$model->language = "SomeLanguage";
		$model->projectname = "SomeProject";
		$id = $model->write();
		$this->assertNotNull($id);
		$this->assertIsA($id, 'string');
		$otherModel = new Project_model($id);
		$this->assertEqual($id, $otherModel->id);
		$this->assertEqual('SomeLanguage', $otherModel->language);
		$this->assertEqual('SomeProject', $otherModel->projectname);
	}

	function testUserList_HadOnlyUsers()
	{
		$model = new User_list_model();
		$model->read();
		
		foreach ($model->entries as $entry) {
			$this->assertTrue(array_key_exists("username", $entry), "Key 'username' not found " . print_r($entry, true));
		}
	}

	function testProjectList_HadOnlyProjects()
	{
		$model = new Project_list_model();
		$model->read();
		
		foreach ($model->entries as $entry) {
			$this->assertTrue(array_key_exists("projectname", $entry));
		}
	}
	
}

?>