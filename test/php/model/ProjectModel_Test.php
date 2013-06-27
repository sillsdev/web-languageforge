<?php
require_once(dirname(__FILE__) . '/../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

require_once(SourcePath . "models/project_model.php");

class TestProjectModel extends UnitTestCase {

	function __construct()
	{
	}
	
	function testWrite_ReadBackSame()
	{
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

	function testProjectList_HadCountAndEntries()
	{
		$model = new Project_list_model();
		$model->read();
		
		$this->assertNotEqual(0, $model->count);
		$this->assertNotNull($model->entries);
		
	}
	
}

?>