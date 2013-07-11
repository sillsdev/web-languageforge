<?php

use models\TextListModel;

use libraries\sf\MongoStore;
use models\ProjectModel;
use models\TextModel;

require_once(dirname(__FILE__) . '/../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

require_once(TestPath . 'common/MongoTestEnvironment.php');
require_once(TestPath . 'common/MockProjectModel.php');

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
		$projectModel = $e->createProject(SF_TESTPROJECT);
		$databaseName = $projectModel->databaseName();
		
		$this->assertFalse(MongoStore::hasDB($databaseName));
					
		$text = new TextModel($projectModel);
		$text->title = 'Some Title';
		$text->write();
		
		$this->assertTrue(MongoStore::hasDB($databaseName));
		
		$projectModel->remove();
		
		$this->assertFalse(MongoStore::hasDB($databaseName));
	}

	function testWrite_ReadBackSame()
	{
		$model = new TextModel(new MockProjectModel());
		$model->title = "Some Title";
		$id = $model->write();
		$this->assertNotNull($id);
		$this->assertIsA($id, 'string');
		$this->assertEqual($id, $model->id);
		$otherModel = new TextModel(new MockProjectModel(), $id);
		$this->assertEqual($id, $otherModel->id);
		$this->assertEqual('Some Title', $otherModel->title);

		$this->_someTextId = $id;
	}
	
	function testWriteRemove_ListCorrect() {
		$e = new MongoTestEnvironment();
		$e->clean();
		$projectModel = new MockProjectModel();

		$list = new TextListModel($projectModel);
		$list->read();
		$this->assertEqual(0, $list->count);
		$this->assertEqual(null, $list->entries);
		
		$text = new TextModel($projectModel);
		$text->title = "Some Title";
		$id = $text->write();

		$list = new TextListModel($projectModel);
		$list->read();
		$this->assertEqual(1, $list->count);
		$this->assertEqual(array(array('title' => 'Some Title', 'id' => $id)), $list->entries);

		TextModel::remove($projectModel->databaseName(), $id);
		
		$list = new TextListModel($projectModel);
		$list->read();
		$this->assertEqual(0, $list->count);
		$this->assertEqual(null, $list->entries);
	}

}

?>
