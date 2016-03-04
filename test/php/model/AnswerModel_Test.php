<?php
use Api\Model\AnswerModel;
use Api\Model\CommentModel;
use Api\Model\ProjectModel;
use Api\Model\QuestionModel;

require_once __DIR__ . '/../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPhpPath . 'common/MongoTestEnvironment.php';

class TestAnswerModel extends UnitTestCase
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
        $question->read($questionId);
        $count = count($question->answers);
        $this->assertEqual(0, $count);

        // Create
        $answer = new AnswerModel();
        $answer->content = 'Some answer';
        $id = $question->writeAnswer($answer);
        $comment = new CommentModel();
        $comment->content = 'Some comment';
        $commentId = QuestionModel::writeComment($project->databaseName(), $questionId, $id, $comment);
        $this->assertNotNull($id);
        $this->assertIsA($id, 'string');
        $this->assertEqual(24, strlen($id));
        $this->assertEqual($id, $answer->id->asString());

        // Read back
        $otherQuestion = new QuestionModel($project, $questionId);
        $otherAnswer = $otherQuestion->answers[$id];
        $this->assertEqual($id, $otherAnswer->id->asString());
        $this->assertEqual('Some answer', $otherAnswer->content);
        $this->assertEqual(1, count($otherAnswer->comments));

        // Update
        $otherAnswer->content = 'Other answer';
        // Note: Updates to the AnswerModel should not clobber child nodes such as comments. Hence this test.
        // See https://github.com/sillsdev/sfwebchecks/issues/39
        unset($otherAnswer->comments[$commentId]);
        $otherQuestion->read($otherQuestion->id->asString());
        $otherId = $otherQuestion->writeAnswer($otherAnswer);
        $this->assertEqual($id, $otherId);

        // Read back
        $otherQuestion = new QuestionModel($project, $questionId);
        $otherAnswer = $otherQuestion->answers[$id];
        $this->assertEqual($id, $otherAnswer->id->asString());
        $this->assertEqual('Other answer', $otherAnswer->content);
        $this->assertEqual(1, count($otherAnswer->comments));

        // List
        $this->assertEqual(1, count($otherQuestion->answers));

        // Delete
        QuestionModel::removeAnswer($project->databaseName(), $questionId, $id);

        // List
        $otherQuestion->read($questionId);
        $this->assertEqual(0, count($otherQuestion->answers));
    }
}
