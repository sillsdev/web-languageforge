<?php
use models\commands\LinkCommands;

require_once(dirname(__FILE__) . '/../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

require_once(TestPath . 'common/MongoTestEnvironment.php');

require_once(SourcePath . "models/ProjectModel.php");
require_once(SourcePath . "models/UserModel.php");

use models\UserModel;
use models\ProjectModel;

class TestMultipleModel extends UnitTestCase {

	function __construct()
	{
		$e = new MongoTestEnvironment();
		$e->clean();
	}
	
	function testWrite_TwoModels_ReadBackBothModelsOk()
	{
		$model = new UserModel();
		$model->email = "user@example.com";
		$model->username = "SomeUser";
		$id = $model->write();
		$this->assertNotNull($id);
		$this->assertIsA($id, 'string');
		$otherModel = new UserModel($id);
		$this->assertEqual($id, $otherModel->id->asString());
		$this->assertEqual('user@example.com', $otherModel->email);
		$this->assertEqual('SomeUser', $otherModel->username);

		$model = new ProjectModel();
		$model->language = "SomeLanguage";
		$model->projectName = "SomeProject";
		$id = $model->write();
		$this->assertNotNull($id);
		$this->assertIsA($id, 'string');
		$otherModel = new ProjectModel($id);
		$this->assertEqual($id, $otherModel->id->asString());
		$this->assertEqual('SomeLanguage', $otherModel->language);
		$this->assertEqual('SomeProject', $otherModel->projectName);
	}

	function testUserList_HadOnlyUsers()
	{
		$model = new models\UserListModel();
		$model->read();
		
		foreach ($model->entries as $entry) {
			$this->assertTrue(array_key_exists("username", $entry), "Key 'username' not found " . print_r($entry, true));
		}
	}

	function testProjectList_HadOnlyProjects()
	{
		$model = new models\ProjectListModel();
		$model->read();
		
		foreach ($model->entries as $entry) {
			$this->assertTrue(array_key_exists("projectName", $entry));
		}
	}
}

?>