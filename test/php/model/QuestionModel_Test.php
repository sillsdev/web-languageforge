<?php


use models\QuestionListModel;

use models\ProjectModel;
use models\QuestionModel;

require_once dirname(__FILE__) . '/../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';

require_once TestPath . 'common/MongoTestEnvironment.php';

require_once SourcePath . "models/ProjectModel.php";
require_once SourcePath . "models/QuestionModel.php";

class TestQuestionModel extends UnitTestCase
{
    public function __construct()
    {
        $e = new MongoTestEnvironment();
        $e->clean();
    }

    public function testCRUD_Works()
    {
        $e = new MongoTestEnvironment();
        $textRef = MongoTestEnvironment::mockId();
        $projectModel = new MockProjectModel();

        // List
        $list = new QuestionListModel($projectModel, $textRef);
        $list->read();
        $this->assertEqual(0, $list->count);

        // Create
        $question = new QuestionModel($projectModel);
        $question->title = "SomeQuestion";
        $question->description = "SomeQuestion";
        $question->textRef->id = $textRef;
        $id = $question->write();
        $this->assertNotNull($id);
        $this->assertIsA($id, 'string');
        $this->assertEqual($id, $question->id->asString());

        // Read back
        $otherQuestion = new QuestionModel($projectModel, $id);
        $this->assertEqual($id, $otherQuestion->id->asString());
        $this->assertEqual('SomeQuestion', $otherQuestion->title);
        $this->assertEqual($textRef, $otherQuestion->textRef->id);

        // Update
        $otherQuestion->description = 'OtherQuestion';
        $otherQuestion->write();

        // Read back
        $otherQuestion = new QuestionModel($projectModel, $id);
        $this->assertEqual('OtherQuestion', $otherQuestion->description);

        // List
        $list->read();
        $this->assertEqual(1, $list->count);

        // Delete
        QuestionModel::remove($projectModel->databaseName(), $id);

        // List
        $list->read();
        $this->assertEqual(0, $list->count);

    }

    public function testTextReference_NullRefValidRef_AllowsNullRef()
    {
        $projectModel = new MockProjectModel();
        $mockTextRef = (string) new \MongoId();

        // Test create with null textRef
        $question = new QuestionModel($projectModel);
        $id = $question->write();

        $otherQuestion = new QuestionModel($projectModel, $id);
        $this->assertEqual('', $otherQuestion->textRef->id);

        // Test update with textRef
        $question->textRef->id = $mockTextRef;
        $question->write();

        $otherQuestion = new QuestionModel($projectModel, $id);
        $this->assertEqual($mockTextRef, $otherQuestion->textRef->id);

    }

}
