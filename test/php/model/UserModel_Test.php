<?php
require_once(dirname(__FILE__) . '/../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

require_once(SourcePath . "models/user_model.php");

class TestUserModel extends UnitTestCase {

	function __construct() {
	}
	
	function testWrite_ReadBackSame() {
		$model = new User_model();
		$model->email = "user@example.com";
		$model->userName = "SomeUser";
		$id = $model->write();
		$this->assertNotNull($id);
		$this->assertIsA($id, 'string');
		$otherModel = new User_model($id);
		$this->assertEqual($id, $otherModel->id);
		$this->assertEqual('user@example.com', $otherModel->email);
		$this->assertEqual('SomeUser', $otherModel->userName);
	}
	
}

?>