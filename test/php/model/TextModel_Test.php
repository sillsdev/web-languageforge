<?php

use models\TextListModel;

use libraries\sf\MongoStore;
use models\ProjectModel;
use models\TextModel;

require_once(dirname(__FILE__) . '/../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

require_once(TestPath . 'common/MongoTestEnvironment.php');

require_once(SourcePath . "models/ProjectModel.php");
require_once(SourcePath . "models/TextModel.php");


class TestTextModel extends UnitTestCase {

	private $_someTextId;

	function __construct()
	{
		$e = new MongoTestEnvironment();
		$e->clean();
	}

	function testUpdateThenRemove_NewProject_CreatesThenRemovesProjectDatabase() {
		$e = new MongoTestEnvironment();
		$projectId = $e->createProject(SF_TESTPROJECT);
		
		$mongo = new \Mongo();
		$mongoDatabases = $mongo->listDBs();
		$result = array_filter($mongoDatabases['databases'], function($item) { return $item['name'] == SF_TESTPROJECT; });
		$this->assertEqual(array(), $result);
			
		$text = new TextModel(SF_TESTPROJECT);
		$text->name = 'SomeTextName';
		$text->write();
		
		$this->assertTrue(MongoStore::hasDB(SF_TESTPROJECT));
		
		$project = new ProjectModel($projectId);
		$project->remove();
	
		$this->assertFalse(MongoStore::hasDB(SF_TESTPROJECT));
	}

	function testWrite_ReadBackSame()
	{
		$model = new TextModel(SF_TESTPROJECT);
		$model->name = "SomeName";
		$id = $model->write();
		$this->assertNotNull($id);
		$this->assertIsA($id, 'string');
		$otherModel = new TextModel(SF_TESTPROJECT, $id);
		$this->assertEqual($id, $otherModel->id);
		$this->assertEqual('SomeName', $otherModel->name);

		$this->_someTextId = $id;
	}

	function testProjectList_HasCountAndEntries()
	{
		$model = new TextListModel(SF_TESTPROJECT);
		$model->read();

		$this->assertNotEqual(0, $model->count);
		$this->assertNotNull($model->entries);
	}

}

?>
