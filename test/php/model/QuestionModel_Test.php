<?php

use models\QuestionListModel;

use models\mapper\MongoStore;
use models\ProjectModel;
use models\QuestionModel;

require_once(dirname(__FILE__) . '/../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

require_once(TestPath . 'common/MongoTestEnvironment.php');

require_once(SourcePath . "models/ProjectModel.php");
require_once(SourcePath . "models/QuestionModel.php");


class TestQuestionModel extends UnitTestCase {

	function __construct() {
		$e = new MongoTestEnvironment();
		$e->clean();
	}

	function testCRUD_Works() {
		$projectModel = new MockProjectModel();
		// List
		$list = new QuestionListModel($projectModel);
		$list->read();
		$this->assertEqual(0, $list->count);
		
		// Create
		$question = new QuestionModel($projectModel);
		$question->title = "SomeQuestion";
		$id = $question->write();
		$this->assertNotNull($id);
		$this->assertIsA($id, 'string');
		$this->assertEqual($id, $question->id->asString());
		
		// Read back
		$otherQuestion = new QuestionModel($projectModel, $id);
		$this->assertEqual($id, $otherQuestion->id->asString());
		$this->assertEqual('SomeQuestion', $otherQuestion->title);
		
		// Update
		$otherQuestion->title = 'OtherQuestion';
		$otherQuestion->write();

		// Read back
		$otherQuestion = new QuestionModel($projectModel, $id);
		$this->assertEqual('OtherQuestion', $otherQuestion->title);
		
		// List
		$list->read();
		$this->assertEqual(1, $list->count);

		// Delete
		QuestionModel::remove($projectModel->databaseName(), $id);
		
		// List
		$list->read();
		$this->assertEqual(0, $list->count);
		
	}

}

?>
