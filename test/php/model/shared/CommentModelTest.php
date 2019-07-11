<?php

use Api\Model\Scriptureforge\Sfchecks\AnswerModel;
use Api\Model\Scriptureforge\Sfchecks\QuestionModel;
use Api\Model\Shared\CommentModel;
use PHPUnit\Framework\TestCase;

class CommentModelTest extends TestCase
{
    public function testAnswerCRUD_Works()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();
        $textRef = MongoTestEnvironment::mockId();
        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        // Create Question
        $question = new QuestionModel($project);
        $question->title = "Some Question";
        $question->textRef->id = $textRef;
        $questionId = $question->write();

        // Create Answer
        $answer = new AnswerModel();
        $answer->content = 'Some answer';
        $answerId = $question->writeAnswer($answer);

        // List
        $question = new QuestionModel($project, $questionId);
        $count = count($question->answers[$answerId]->comments);
        $this->assertEquals(0, $count);

        // Create
        $comment = new CommentModel();
        $comment->content = 'Some comment';
        $id = QuestionModel::writeComment($project->databaseName(), $questionId, $answerId, $comment);
        $this->assertNotNull($id);
        $this->assertIsString($id);
        $this->assertEquals(24, strlen($id));
        $this->assertEquals($comment->id->asString(), $id);

        // Read back
        $otherQuestion = new QuestionModel($project, $questionId);
        $otherComment = $otherQuestion->answers[$answerId]->comments[$id];
        $this->assertEquals($id, $otherComment->id->asString());
        $this->assertEquals('Some comment', $otherComment->content);

        // Update
        $otherComment->content = 'Other comment';
        $otherId = $question->writeComment($project->databaseName(), $questionId, $answerId, $otherComment);
        $this->assertEquals($id, $otherId);

        // Read back
        $otherQuestion = new QuestionModel($project, $questionId);
        $otherComment = $otherQuestion->answers[$answerId]->comments[$id];
        $this->assertEquals($id, $otherComment->id->asString());
        $this->assertEquals('Other comment', $otherComment->content);

        // List
        $count = count($otherQuestion->answers[$answerId]->comments);
        $this->assertEquals(1, $count);

        // Delete
        QuestionModel::removeComment($project->databaseName(), $questionId, $answerId, $id);

        // List
        $otherQuestion = new QuestionModel($project, $questionId);
        $count = count($otherQuestion->answers[$answerId]->comments);
        $this->assertEquals(0, $count);
    }
}
