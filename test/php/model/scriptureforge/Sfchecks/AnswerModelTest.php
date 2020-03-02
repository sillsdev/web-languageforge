<?php

use Api\Model\Scriptureforge\Sfchecks\AnswerModel;
use Api\Model\Scriptureforge\Sfchecks\QuestionModel;
use Api\Model\Shared\CommentModel;
use PHPUnit\Framework\TestCase;

class AnswerModelTest extends TestCase
{
    public function testAnswerCRUD_Works()
    {
        $e = new MongoTestEnvironment();
        $e->clean();
        $textRef = MongoTestEnvironment::mockId();
        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        // Create Question
        $question = new QuestionModel($project);
        $question->title = "Some Question";
        $question->textRef->id = $textRef;
        $questionId = $question->write();

        // List
        $question = new QuestionModel($project, $questionId);
        $this->assertCount(0, $question->answers);

        // Create
        $answer = new AnswerModel();
        $answer->content = 'Some answer';
        $id = $question->writeAnswer($answer);
        $comment = new CommentModel();
        $comment->content = 'Some comment';
        $commentId = QuestionModel::writeComment($project->databaseName(), $questionId, $id, $comment);
        $this->assertNotNull($id);
        $this->assertIsString($id);
        $this->assertEquals(24, strlen($id));
        $this->assertEquals($answer->id->asString(), $id);

        // Read back
        $otherQuestion = new QuestionModel($project, $questionId);
        $otherAnswer = $otherQuestion->answers[$id];
        $this->assertEquals($id, $otherAnswer->id->asString());
        $this->assertEquals('Some answer', $otherAnswer->content);
        $this->assertCount(1, $otherAnswer->comments);

        // Update
        $otherAnswer->content = 'Other answer';
        // Note: Updates to the AnswerModel should not clobber child nodes such as comments. Hence this test.
        // See https://github.com/sillsdev/sfwebchecks/issues/39
        unset($otherAnswer->comments[$commentId]);
        // Re-read
        $otherQuestion = new QuestionModel($project, $otherQuestion->id->asString());
        $otherId = $otherQuestion->writeAnswer($otherAnswer);
        $this->assertEquals($id, $otherId);

        // Read back
        $otherQuestion = new QuestionModel($project, $questionId);
        $otherAnswer = $otherQuestion->answers[$id];
        $this->assertEquals($id, $otherAnswer->id->asString());
        $this->assertEquals('Other answer', $otherAnswer->content);
        $this->assertCount(1, $otherAnswer->comments);

        // List
        $this->assertCount(1, $otherQuestion->answers);

        // Delete
        QuestionModel::removeAnswer($project->databaseName(), $questionId, $id);

        // List
        $otherQuestion = new QuestionModel($project, $questionId);
        $this->assertCount(0, $otherQuestion->answers);
    }
}
