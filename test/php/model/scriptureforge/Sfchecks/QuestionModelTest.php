<?php

use Api\Model\Scriptureforge\Sfchecks\QuestionListModel;
use Api\Model\Scriptureforge\Sfchecks\QuestionModel;
use Api\Model\Shared\Mapper\MongoMapper;
use PHPUnit\Framework\TestCase;

class QuestionModelTest extends TestCase
{
    public function testCRUD_Works()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();
        $textRef = MongoTestEnvironment::mockId();
        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        // List
        $list = new QuestionListModel($project, $textRef);
        $list->read();
        $this->assertEquals(0, $list->count);

        // Create
        $question = new QuestionModel($project);
        $question->title = 'SomeQuestion';
        $question->description = 'SomeQuestion';
        $question->textRef->id = $textRef;
        $id = $question->write();
        $this->assertNotNull($id);
        $this->assertIsString($id);
        $this->assertEquals($question->id->asString(), $id);

        // Read back
        $otherQuestion = new QuestionModel($project, $id);
        $this->assertEquals($id, $otherQuestion->id->asString());
        $this->assertEquals('SomeQuestion', $otherQuestion->title);
        $this->assertEquals($textRef, $otherQuestion->textRef->id);

        // Update
        $otherQuestion->description = 'OtherQuestion';
        $otherQuestion->write();

        // Read back
        $otherQuestion = new QuestionModel($project, $id);
        $this->assertEquals('OtherQuestion', $otherQuestion->description);

        // List
        $list->read();
        $this->assertEquals(1, $list->count);

        // Delete
        QuestionModel::remove($project->databaseName(), $id);

        // List
        $list->read();
        $this->assertEquals(0, $list->count);
    }

    public function testTextReference_NullRefValidRef_AllowsNullRef()
    {
        $environ = new MongoTestEnvironment();
        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        $mockTextRef = (string) MongoMapper::mongoID();

        // Test create with null textRef
        $question = new QuestionModel($project);
        $id = $question->write();

        $otherQuestion = new QuestionModel($project, $id);
        $this->assertEquals('', $otherQuestion->textRef->id);

        // Test update with textRef
        $question->textRef->id = $mockTextRef;
        $question->write();

        $otherQuestion = new QuestionModel($project, $id);
        $this->assertEquals($mockTextRef, $otherQuestion->textRef->id);
    }
}
