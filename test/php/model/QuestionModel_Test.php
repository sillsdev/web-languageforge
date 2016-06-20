<?php
use Api\Model\ProjectModel;
use Api\Model\QuestionListModel;
use Api\Model\QuestionModel;

require_once __DIR__ . '/../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPhpPath . 'common/MongoTestEnvironment.php';
require_once SourcePath . "Api/Model/QuestionModel.php";

class TestQuestionModel extends UnitTestCase
{

    public function testCRUD_Works()
    {
        $e = new MongoTestEnvironment();
        $e->clean();
        $textRef = MongoTestEnvironment::mockId();
        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        // List
        $list = new QuestionListModel($project, $textRef);
        $list->read();
        $this->assertEqual(0, $list->count);

        // Create
        $question = new QuestionModel($project);
        $question->title = "SomeQuestion";
        $question->description = "SomeQuestion";
        $question->textRef->id = $textRef;
        $id = $question->write();
        $this->assertNotNull($id);
        $this->assertIsA($id, 'string');
        $this->assertEqual($id, $question->id->asString());

        // Read back
        $otherQuestion = new QuestionModel($project, $id);
        $this->assertEqual($id, $otherQuestion->id->asString());
        $this->assertEqual('SomeQuestion', $otherQuestion->title);
        $this->assertEqual($textRef, $otherQuestion->textRef->id);

        // Update
        $otherQuestion->description = 'OtherQuestion';
        $otherQuestion->write();

        // Read back
        $otherQuestion = new QuestionModel($project, $id);
        $this->assertEqual('OtherQuestion', $otherQuestion->description);

        // List
        $list->read();
        $this->assertEqual(1, $list->count);

        // Delete
        QuestionModel::remove($project->databaseName(), $id);

        // List
        $list->read();
        $this->assertEqual(0, $list->count);
    }

    public function testTextReference_NullRefValidRef_AllowsNullRef()
    {
        $e = new MongoTestEnvironment();
        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        $mockTextRef = (string) \Api\Model\Mapper\MongoMapper::mongoID();

        // Test create with null textRef
        $question = new QuestionModel($project);
        $id = $question->write();

        $otherQuestion = new QuestionModel($project, $id);
        $this->assertEqual('', $otherQuestion->textRef->id);

        // Test update with textRef
        $question->textRef->id = $mockTextRef;
        $question->write();

        $otherQuestion = new QuestionModel($project, $id);
        $this->assertEqual($mockTextRef, $otherQuestion->textRef->id);
    }
}
