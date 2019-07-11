<?php

use Api\Library\Scriptureforge\Sfchecks\ParatextExport;
use Api\Model\Scriptureforge\Sfchecks\AnswerModel;
use Api\Model\Scriptureforge\Sfchecks\QuestionModel;
use Api\Model\Scriptureforge\Sfchecks\TextModel;
use Api\Model\Shared\CommentModel;
use PHPUnit\Framework\TestCase;

class ParatextExportTest extends TestCase
{
    /** @var MongoTestEnvironment Local store of mock test environment */
    private static $environ;

    public static function setUpBeforeClass(): void
    {
        self::$environ = new MongoTestEnvironment();
        self::$environ->clean();
    }

    public function testExportCommentsForText_ExportAll_AllExported()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        $text = new TextModel($project);
        $text->title = 'Text 1';
        $usx = MongoTestEnvironment::usxSample();
        $text->content = $usx;
        $textId = $text->write();

        $user1Id = self::$environ->createUser('user1', 'user1', 'user1@email.com');
        $user2Id = self::$environ->createUser('user2', 'user2', 'user2@email.com');
        $user3Id = self::$environ->createUser('user3', 'user3', 'user3@email.com');

        // Workflow is first to create a question
        $question = new QuestionModel($project);
        $question->title = 'the question';
        $question->description = 'question description';
        $question->textRef->id = $textId;
        $questionId = $question->write();

        // Then to add an answer to a question
        $answer = new AnswerModel();
        $answer->content = 'first answer';
        $answer->score = 10;
        $answer->userRef->id = $user3Id;
        $answer->tags->exchangeArray(array('export', 'to review'));
        $answer->textHightlight = 'text highlight';
        $answerId = $question->writeAnswer($answer);

        // Followed by comments
        $comment1 = new CommentModel();
        $comment1->content = 'first comment';
        $comment1->userRef->id = $user1Id;
        QuestionModel::writeComment($project->databaseName(), $questionId, $answerId, $comment1);

        $comment2 = new CommentModel();
        $comment2->content = 'second comment';
        $comment2->userRef->id = $user2Id;
        QuestionModel::writeComment($project->databaseName(), $questionId, $answerId, $comment2);

        $params = array(
            'textId' => $textId,
            'exportComments' => true,
            'exportFlagged' => false,
            'tags' => array()
        );
        $download = ParatextExport::exportCommentsForText($project->id->asString(), $textId, $params);

        $this->assertRegExp('/<Contents>\(user1 commented in reply to user3\) first comment/', $download['xml']);
        $this->assertRegExp('/\(Tags: export, to review\) \(10 Votes\)<\/Contents>/', $download['xml']);
    }

    public function testExportCommentsForText_OnlyExportFlagged_OnlyFlaggedExportedExceptArchived()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        $text = new TextModel($project);
        $text->title = 'Text 1';
        $usx = MongoTestEnvironment::usxSample();
        $text->content = $usx;
        $textId = $text->write();

        $user1Id = self::$environ->createUser('user1', 'user1', 'user1@email.com');
        $user2Id = self::$environ->createUser('user2', 'user2', 'user2@email.com');
        $user3Id = self::$environ->createUser('user3', 'user3', 'user3@email.com');

        // Workflow is first to create a question
        $question = new QuestionModel($project);
        $question->title = 'the question';
        $question->description = 'question description';
        $question->textRef->id = $textId;
        $question->write();

        // Then to add an answer to a question
        $answer = new AnswerModel();
        $answer->content = 'first answer';
        $answer->score = 10;
        $answer->userRef->id = $user1Id;
        $answer->tags->exchangeArray(array('export', 'to review'));
        $answer->isToBeExported = true;
        $question->writeAnswer($answer);

        // Then to add an answer to a question
        $answer = new AnswerModel();
        $answer->content = 'second answer - very long';
        $answer->score = 2;
        $answer->userRef->id = $user2Id;
        $answer->tags->exchangeArray(array('to review'));
        $answer->isToBeExported = false;
        $question->writeAnswer($answer);

        // Then to add an answer to a question
        $answer = new AnswerModel();
        $answer->content = 'third answer - very very very very long';
        $answer->userRef->id = $user3Id;
        $answer->tags->exchangeArray(array('export'));
        $answer->isToBeExported = true;
        $question->writeAnswer($answer);

        $params = array(
            'textId' => $textId,
            'exportComments' => true,
            'exportFlagged' => true,
            'tags' => array()
        );
        $download = ParatextExport::exportCommentsForText($project->id->asString(), $textId, $params);
        //echo '<pre>' . print_r($download) . '</pre>';

        $this->assertRegExp('/<Contents>\(Question\) the question \(Answered by user3\) third answer - very very very very long/', $download['xml']);
        $this->assertNotRegExp('/second answer/', $download['xml']);
        $this->assertRegExp('/first answer/', $download['xml']);
    }

    public function testExportCommentsForText_QuestionArchived_NoneExported()
    {
        $project = self::$environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);

        $text = new TextModel($project);
        $text->title = 'Text 1';
        $usx = MongoTestEnvironment::usxSample();
        $text->content = $usx;
        $textId = $text->write();

        $user1Id = self::$environ->createUser('user1', 'user1', 'user1@email.com');
        $user2Id = self::$environ->createUser('user2', 'user2', 'user2@email.com');
        $user3Id = self::$environ->createUser('user3', 'user3', 'user3@email.com');

        // Workflow is first to create a question
        $question = new QuestionModel($project);
        $question->title = 'the question';
        $question->description = 'question description';
        $question->textRef->id = $textId;
        $question->isArchived = true;
        $question->write();

        // Then to add an answer to a question
        $answer = new AnswerModel();
        $answer->content = 'first answer';
        $answer->score = 10;
        $answer->userRef->id = $user1Id;
        $answer->tags->exchangeArray(array('export', 'to review'));
        $answer->isToBeExported = true;
        $question->writeAnswer($answer);

        // Then to add an answer to a question
        $answer = new AnswerModel();
        $answer->content = 'second answer - very long';
        $answer->score = 2;
        $answer->userRef->id = $user2Id;
        $answer->tags->exchangeArray(array('to review'));
        $answer->isToBeExported = false;
        $question->writeAnswer($answer);

        // Then to add an answer to a question
        $answer = new AnswerModel();
        $answer->content = 'third answer - very very very very long';
        $answer->userRef->id = $user3Id;
        $answer->tags->exchangeArray(array('export'));
        $answer->isToBeExported = true;
        $question->writeAnswer($answer);

        $params = array(
            'textId' => $textId,
            'exportComments' => true,
            'exportFlagged' => true,
            'tags' => array()
        );
        $download = ParatextExport::exportCommentsForText($project->id->asString(), $textId, $params);
//        echo '<pre>' . print_r($download) . '</pre>';

        $this->assertNotRegExp('/<Contents>third answer - very very very very long \(by user3/', $download['xml']);
        $this->assertNotRegExp('/<Contents>second answer/', $download['xml']);
        $this->assertNotRegExp('/<Contents>first answer/', $download['xml']);
    }
}
