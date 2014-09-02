<?php

use libraries\scriptureforge\sfchecks\ParatextExport;
use models\TextModel;
use models\QuestionModel;
use models\AnswerModel;
use models\CommentModel;

require_once dirname(__FILE__) . '/../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPath . 'common/MongoTestEnvironment.php';

class TestParatextExport extends UnitTestCase
{
    public function __construct()
    {
        $e = new MongoTestEnvironment();
        $e->clean();
    }

    public function testExportCommentsForText_ExportAll_AllExported()
    {
        $e = new MongoTestEnvironment();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        $text = new TextModel($project);
        $text->title = "Text 1";
        $usx = MongoTestEnvironment::usxSample();
        $text->content = $usx;
        $textId = $text->write();

        $user1Id = $e->createUser("user1", "user1", "user1@email.com");
        $user2Id = $e->createUser("user2", "user2", "user2@email.com");
        $user3Id = $e->createUser("user3", "user3", "user3@email.com");

        // Workflow is first to create a question
        $question = new QuestionModel($project);
        $question->title = "the question";
        $question->description = "question description";
        $question->textRef->id = $textId;
        $questionId = $question->write();

        // Then to add an answer to a question
        $answer = new AnswerModel();
        $answer->content = "first answer";
        $answer->score = 10;
        $answer->userRef->id = $user3Id;
        $answer->tags->exchangeArray(array('export', 'to review'));
        $answer->textHightlight = "text highlight";
        $answerId = $question->writeAnswer($answer);

        // Followed by comments
        $comment1 = new CommentModel();
        $comment1->content = "first comment";
        $comment1->userRef->id = $user1Id;
        $comment1Id = QuestionModel::writeComment($project->databaseName(), $questionId, $answerId, $comment1);

        $comment2 = new CommentModel();
        $comment2->content = "second comment";
        $comment2->userRef->id = $user2Id;
        $comment2Id = QuestionModel::writeComment($project->databaseName(), $questionId, $answerId, $comment2);

        $params = array(
            'textId' => $textId,
            'exportComments' => true,
            'exportFlagged' => false,
            'tags' => array()
        );
        $download = ParatextExport::exportCommentsForText($project->id->asString(), $textId, $params);

        $this->assertPattern('/<Contents>first comment \(by user1/', $download['xml']);
        $this->assertPattern('/\(Tags: export, to review\) \(10 Votes\)<\/Contents>/', $download['xml']);
    }

    public function testExportCommentsForText_OnlyExportFlagged_OnlyFlaggedExportedExceptArchived()
    {
        $e = new MongoTestEnvironment();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        $text = new TextModel($project);
        $text->title = "Text 1";
        $usx = MongoTestEnvironment::usxSample();
        $text->content = $usx;
        $textId = $text->write();

        $user1Id = $e->createUser("user1", "user1", "user1@email.com");
        $user2Id = $e->createUser("user2", "user2", "user2@email.com");
        $user3Id = $e->createUser("user3", "user3", "user3@email.com");

        // Workflow is first to create a question
        $question = new QuestionModel($project);
        $question->title = "the question";
        $question->description = "question description";
        $question->textRef->id = $textId;
        $questionId = $question->write();

        // Then to add an answer to a question
        $answer = new AnswerModel();
        $answer->content = "first answer";
        $answer->score = 10;
        $answer->userRef->id = $user1Id;
        $answer->tags->exchangeArray(array('export', 'to review'));
        $answer->isToBeExported = true;
        $answerId = $question->writeAnswer($answer);

        // Then to add an answer to a question
        $answer = new AnswerModel();
        $answer->content = "second answer - very long";
        $answer->score = 2;
        $answer->userRef->id = $user2Id;
        $answer->tags->exchangeArray(array('to review'));
        $answer->isToBeExported = false;
        $answerId = $question->writeAnswer($answer);

        // Then to add an answer to a question
        $answer = new AnswerModel();
        $answer->content = "third answer - very very very very long";
        $answer->userRef->id = $user3Id;
        $answer->tags->exchangeArray(array('export'));
        $answer->isToBeExported = true;
        $answerId = $question->writeAnswer($answer);

        $params = array(
            'textId' => $textId,
            'exportComments' => true,
            'exportFlagged' => true,
            'tags' => array()
        );
        $download = ParatextExport::exportCommentsForText($project->id->asString(), $textId, $params);
        //echo "<pre>" . print_r($download) . "</pre>";

        $this->assertPattern('/<Contents>third answer - very very very very long \(by user3/', $download['xml']);
        $this->assertNoPattern('/<Contents>second answer/', $download['xml']);
        $this->assertPattern('/<Contents>first answer/', $download['xml']);
    }

    public function testExportCommentsForText_QuestionArchived_NoneExported()
    {
        $e = new MongoTestEnvironment();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        $text = new TextModel($project);
        $text->title = "Text 1";
        $usx = MongoTestEnvironment::usxSample();
        $text->content = $usx;
        $textId = $text->write();

        $user1Id = $e->createUser("user1", "user1", "user1@email.com");
        $user2Id = $e->createUser("user2", "user2", "user2@email.com");
        $user3Id = $e->createUser("user3", "user3", "user3@email.com");

        // Workflow is first to create a question
        $question = new QuestionModel($project);
        $question->title = "the question";
        $question->description = "question description";
        $question->textRef->id = $textId;
        $question->isArchived = true;
        $questionId = $question->write();

        // Then to add an answer to a question
        $answer = new AnswerModel();
        $answer->content = "first answer";
        $answer->score = 10;
        $answer->userRef->id = $user1Id;
        $answer->tags->exchangeArray(array('export', 'to review'));
        $answer->isToBeExported = true;
        $answerId = $question->writeAnswer($answer);

        // Then to add an answer to a question
        $answer = new AnswerModel();
        $answer->content = "second answer - very long";
        $answer->score = 2;
        $answer->userRef->id = $user2Id;
        $answer->tags->exchangeArray(array('to review'));
        $answer->isToBeExported = false;
        $answerId = $question->writeAnswer($answer);

        // Then to add an answer to a question
        $answer = new AnswerModel();
        $answer->content = "third answer - very very very very long";
        $answer->userRef->id = $user3Id;
        $answer->tags->exchangeArray(array('export'));
        $answer->isToBeExported = true;
        $answerId = $question->writeAnswer($answer);

        $params = array(
            'textId' => $textId,
            'exportComments' => true,
            'exportFlagged' => true,
            'tags' => array()
        );
        $download = ParatextExport::exportCommentsForText($project->id->asString(), $textId, $params);
        //echo "<pre>" . print_r($download) . "</pre>";

        $this->assertNoPattern('/<Contents>third answer - very very very very long \(by user3/', $download['xml']);
        $this->assertNoPattern('/<Contents>second answer/', $download['xml']);
        $this->assertNoPattern('/<Contents>first answer/', $download['xml']);
    }

}
