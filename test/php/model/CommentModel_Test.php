<?php

use models\CommentModel;
use models\AnswerModel;

//use models\QuestionListModel;
//use models\mapper\MongoStore;
//use models\ProjectModel;
use models\QuestionModel;

require_once dirname(__FILE__) . '/../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';

require_once TestPath . 'common/MongoTestEnvironment.php';

require_once SourcePath . "models/ProjectModel.php";
require_once SourcePath . "models/QuestionModel.php";

class TestCommentModel extends UnitTestCase
{
    public function __construct()
    {
        $e = new MongoTestEnvironment();
        $e->clean();
    }

    public function testAnswerCRUD_Works()
    {
        $e = new MongoTestEnvironment();
        $textRef = MongoTestEnvironment::mockId();
        $projectModel = new MockProjectModel();

        // Create Question
        $question = new QuestionModel($projectModel);
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
        $id = QuestionModel::writeComment($projectModel->databaseName(), $questionId, $answerId, $comment);
        $this->assertNotNull($id);
        $this->assertIsA($id, 'string');
        $this->assertEqual(24, strlen($id));
        $this->assertEqual($id, $comment->id->asString());

        // Read back
        $otherQuestion = new QuestionModel($projectModel, $questionId);
        $otherComment = $otherQuestion->answers[$answerId]->comments[$id];
        $this->assertEqual($id, $otherComment->id->asString());
        $this->assertEqual('Some comment', $otherComment->content);
// 		var_dump($id);
// 		var_dump($otherAnswer->id->asString());

        // Update
        $otherComment->content= 'Other comment';
        $otherId = $question->writeComment($projectModel->databaseName(), $questionId, $answerId, $otherComment);
        $this->assertEqual($id, $otherId);

        // Read back
        $otherQuestion = new QuestionModel($projectModel, $questionId);
        $otherComment = $otherQuestion->answers[$answerId]->comments[$id];
        $this->assertEqual($id, $otherComment->id->asString());
        $this->assertEqual('Other comment', $otherComment->content);

        // List
        $count = count($otherQuestion->answers[$answerId]->comments);
        $this->assertEqual(1, $count);

        // Delete
        QuestionModel::removeComment($projectModel->databaseName(), $questionId, $answerId, $id);

        // List
        $otherQuestion->read($questionId);
        $count = count($otherQuestion->answers[$answerId]->comments);
        $this->assertEqual(0, $count);

    }

}
