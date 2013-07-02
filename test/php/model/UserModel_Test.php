<?php
require_once(dirname(__FILE__) . '/../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

require_once(TestPath . 'common/MongoTestEnvironment.php');

require_once(SourcePath . "models/user_model.php");

class TestUserModel extends UnitTestCase {

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
		$model->imageRef = "images/avatar/pinkbat.png";
		$id = $model->write();
		$this->assertNotNull($id);
		$this->assertIsA($id, 'string');
		$otherModel = new User_model($id);
		$this->assertEqual($id, $otherModel->id);
		$this->assertEqual('user@example.com', $otherModel->email);
		$this->assertEqual('SomeUser', $otherModel->username);
		$this->assertEqual('Some User', $otherModel->name);
		$this->assertEqual('images/avatar/pinkbat.png', $otherModel->imageRef);
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
	
}

?>