<?php
require_once(dirname(__FILE__) . '/TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

require_once(SourcePath . "libraries/mongo/Mongo_store.php");
require_once(SourcePath . "models/user_model.php");

class TestUserModel extends UnitTestCase {

	function __construct() {
	}
	
	function testWrite_ReadBackSame() {
		$model = new UserModel();
		$model->email = "user@example.com";
		$model->userName = "SomeUser";
		$id = $model->write();
		$this->assertNotNull($id);
		$otherModel = new UserModel($id);
		$this->assertEqual($id, $otherModel->id);
		$this->assertEqual('user@example.com', $otherModel->email);
		$this->assertEqual('SomeUser', $otherModel->userName);
	}
	
}

?>