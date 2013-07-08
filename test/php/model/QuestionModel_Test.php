<?php

use models\QuestionListModel;

use libraries\sf\MongoStore;
use models\ProjectModel;
use models\QuestionModel;

require_once(dirname(__FILE__) . '/../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

require_once(TestPath . 'common/MongoTestEnvironment.php');

require_once(SourcePath . "models/ProjectModel.php");
require_once(SourcePath . "models/QuestionModel.php");


class TestQuestionModel extends UnitTestCase {

	private $_someQuestionId;

	function __construct()
	{
		$e = new MongoTestEnvironment();
		$e->clean();
	}

	function testWrite_ReadBackSame()
	{
		$model = new QuestionModel(SF_TESTPROJECT);
		$model->question = "SomeQuestion";
		$id = $model->write();
		$this->assertNotNull($id);
		$this->assertIsA($id, 'string');
		$otherModel = new QuestionModel(SF_TESTPROJECT, $id);
		$this->assertEqual($id, $otherModel->id);
		$this->assertEqual('SomeQuestion', $otherModel->question);

		$this->_someQuestionId = $id;
	}

	function testProjectList_HasCountAndEntries()
	{
		$model = new QuestionListModel(SF_TESTPROJECT);
		$model->read();

		$this->assertNotEqual(0, $model->count);
		$this->assertNotNull($model->entries);
	}

}

?>
