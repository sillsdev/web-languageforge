<?php
use Api\Model\AnswerModel;
use Api\Model\CommentModel;
use Api\Model\QuestionModel;

require_once __DIR__ . '/../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPhpPath . 'common/MongoTestEnvironment.php';

class TestCommentModel extends UnitTestCase
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

        // Create Answer
        $answer = new AnswerModel();
        $answer->content = 'Some answer';
        $answerId = $question->writeAnswer($answer);

        // List
        $question->read($questionId);
        $count = count($question->answers[$answerId]->comments);
        $this->assertEqual(0, $count);

        // Create
        $comment = new CommentModel();
        $comment->content = 'Some comment';
        $id = QuestionModel::writeComment($project->databaseName(), $questionId, $answerId, $comment);
        $this->assertNotNull($id);
        $this->assertIsA($id, 'string');
        $this->assertEqual(24, strlen($id));
        $this->assertEqual($id, $comment->id->asString());

        // Read back
        $otherQuestion = new QuestionModel($project, $questionId);
        $otherComment = $otherQuestion->answers[$answerId]->comments[$id];
        $this->assertEqual($id, $otherComment->id->asString());
        $this->assertEqual('Some comment', $otherComment->content);

        // Update
        $otherComment->content = 'Other comment';
        $otherId = $question->writeComment($project->databaseName(), $questionId, $answerId, $otherComment);
        $this->assertEqual($id, $otherId);

        // Read back
        $otherQuestion = new QuestionModel($project, $questionId);
        $otherComment = $otherQuestion->answers[$answerId]->comments[$id];
        $this->assertEqual($id, $otherComment->id->asString());
        $this->assertEqual('Other comment', $otherComment->content);

        // List
        $count = count($otherQuestion->answers[$answerId]->comments);
        $this->assertEqual(1, $count);

        // Delete
        QuestionModel::removeComment($project->databaseName(), $questionId, $answerId, $id);

        // List
        $otherQuestion->read($questionId);
        $count = count($otherQuestion->answers[$answerId]->comments);
        $this->assertEqual(0, $count);
    }
}
