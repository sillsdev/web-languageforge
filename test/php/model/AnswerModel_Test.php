<?php

use models\AnswerModel;

use models\QuestionListModel;

use models\mapper\MongoStore;
use models\ProjectModel;
use models\QuestionModel;

require_once(dirname(__FILE__) . '/../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

require_once(TestPath . 'common/MongoTestEnvironment.php');

require_once(SourcePath . "models/ProjectModel.php");
require_once(SourcePath . "models/QuestionModel.php");


class TestAnswerModel extends UnitTestCase {

	function __construct() {
		$e = new MongoTestEnvironment();
		$e->clean();
	}

	function testAnswerCRUD_Works() {
		$e = new MongoTestEnvironment();
		$textRef = MongoTestEnvironment::mockId();
		$projectModel = new MockProjectModel();

		// Create Question
		$question = new QuestionModel($projectModel);
		$question->title = "Some Question";
		$question->textRef->id = $textRef;
		$questionId = $question->write();
		
		// List
		$question->read($questionId);
		$count = count($question->answers->data);
		$this->assertEqual(0, $count);
		
		// Create
		$answer = new AnswerModel();
		$answer->content = 'Some answer';
		$id = $question->writeAnswer($projectModel->databaseName(), $questionId, $answer);
		$this->assertNotNull($id);
		$this->assertIsA($id, 'string');
		$this->assertEqual(24, strlen($id));
		$this->assertEqual($id, $answer->id->asString());
		
		// Read back
		$otherQuestion = new QuestionModel($projectModel, $questionId);
		$otherAnswer = $otherQuestion->answers->data[$id];
		$this->assertEqual($id, $otherAnswer->id->asString());
		$this->assertEqual('Some answer', $otherAnswer->content);
// 		var_dump($id);
// 		var_dump($otherAnswer->id->asString());
		
		// Update
		$otherAnswer->content= 'Other answer';
		$otherId = $question->writeAnswer($projectModel->databaseName(), $questionId, $otherAnswer);
		$this->assertEqual($id, $otherId);
		
		// Read back
		$otherQuestion = new QuestionModel($projectModel, $questionId);
		$otherAnswer = $otherQuestion->answers->data[$id];
		$this->assertEqual($id, $otherAnswer->id->asString());
		$this->assertEqual('Other answer', $otherAnswer->content);
				
		// List
		$this->assertEqual(1, count($otherQuestion->answers->data));

		// Delete
		QuestionModel::removeAnswer($projectModel->databaseName(), $questionId, $id);
		
		// List
		$otherQuestion->read($questionId);
		$this->assertEqual(0, count($otherQuestion->answers->data));
		
	}

}

?>
