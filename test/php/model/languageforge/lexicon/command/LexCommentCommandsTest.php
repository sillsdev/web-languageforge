<?php

use Api\Model\Languageforge\Lexicon\Command\LexCommentCommands;
use Api\Model\Languageforge\Lexicon\LexCommentModel;
use Api\Model\Languageforge\Lexicon\LexCommentListModel;
use PHPUnit\Framework\TestCase;

class LexCommentCommandsTest extends TestCase
{
    /** @var mixed[] Data storage between tests */
    private static $save;

    public static function setUpBeforeClass()
    {
        self::$save = [];
    }

    public function testUpdateComment_NewComment_CommentAdded()
    {
        $environ = new LexiconMongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $userId = $environ->createUser('joe', 'joe', 'joe');

        $commentContent = "My first comment";

        $regarding = array(
            'field' => 'lexeme',
            'fieldValue' => 'Word 1',
            'fieldNameForDisplay' => 'Word',
            'inputSystemAbbreviation' => 'th',
            'inputSystem' => 'th',
            'word' => '',
            'meaning' => ''
        );

        $data = array(
            'id' => '',
            'content' => $commentContent,
            'regarding' => $regarding
        );

        $commentList = new LexCommentListModel($project);
        $commentList->read();
        $this->assertEquals(0, $commentList->count);

        LexCommentCommands::updateComment($project->id->asString(), $userId, $environ->website, $data);

        $commentList->read();
        $this->assertEquals(1, $commentList->count);
        $commentArray = $commentList->entries[0];
        $this->assertEquals($commentContent, $commentArray['content']);
        $this->assertEquals($regarding, $commentArray['regarding']);
        $this->assertEquals(0, $commentArray['score']);
        $this->assertEquals('open', $commentArray['status']);
    }

    public function testUpdateComment_ExistingComment_CommentUpdated()
    {
        $environ = new LexiconMongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $userId = $environ->createUser('joe', 'joe', 'joe');

        $regarding = array(
            'field' => 'lexeme',
            'fieldValue' => 'Word 1',
            'inputSystem' => 'th',
            'word' => '',
            'meaning' => ''
        );
        $data = array(
            'id' => '',
            'content' => 'hi there!',
            'regarding' => $regarding
        );
        $commentId = LexCommentCommands::updateComment($project->id->asString(), $userId, $environ->website, $data);

        $newCommentContent = "My first comment";

        $data = array(
            'id' => $commentId,
            'content' => $newCommentContent,
        );
        LexCommentCommands::updateComment($project->id->asString(), $userId, $environ->website, $data);

        $comment = new LexCommentModel($project, $commentId);

        $this->assertEquals($newCommentContent, $comment->content);
        $this->assertEquals(0, $comment->score);
        $this->assertEquals('open', $comment->status);
    }

    public function testUpdateReply_NewReply_ReplyAdded()
    {
        $environ = new LexiconMongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $userId = $environ->createUser('joe', 'joe', 'joe');

        $regarding = array(
            'field' => 'lexeme',
            'fieldValue' => 'Word 1',
            'inputSystem' => 'th',
            'word' => '',
            'meaning' => ''
        );
        $data = array(
            'id' => '',
            'content' => 'hi there!',
            'regarding' => $regarding
        );
        $commentId = LexCommentCommands::updateComment($project->id->asString(), $userId, $environ->website, $data);
        $comment = new LexCommentModel($project, $commentId);
        $replyData = array(
            'id' => '',
            'content' => 'my first reply'
        );

        $this->assertCount(0, $comment->replies);

        $replyId = LexCommentCommands::updateReply($project->id->asString(), $userId, $environ->website, $commentId, $replyData);
        $comment->read($commentId);

        $reply = $comment->getReply($replyId);

        $this->assertCount(1, $comment->replies);
        $this->assertEquals($replyData['content'], $reply->content);
    }

    public function testUpdateReply_ExistingReply_ReplyAdded()
    {
        $environ = new LexiconMongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $userId = $environ->createUser('joe', 'joe', 'joe');

        $regarding = array(
            'field' => 'lexeme',
            'fieldValue' => 'Word 1',
            'inputSystem' => 'th',
            'word' => '',
            'meaning' => ''
        );
        $data = array(
            'id' => '',
            'content' => 'hi there!',
            'regarding' => $regarding
        );
        $commentId = LexCommentCommands::updateComment($project->id->asString(), $userId, $environ->website, $data);
        $comment = new LexCommentModel($project, $commentId);
        $replyData = array(
            'id' => '',
            'content' => 'my first reply'
        );

        // add two replies
        LexCommentCommands::updateReply($project->id->asString(), $userId, $environ->website, $commentId, $replyData);
        $replyId = LexCommentCommands::updateReply($project->id->asString(), $userId, $environ->website, $commentId, $replyData);

        $comment->read($commentId);
        $reply = $comment->getReply($replyId);

        $this->assertEquals($replyData['content'], $reply->content);

        $replyData = array(
            'id' => $replyId,
            'content' => 'an updated reply'
        );

        LexCommentCommands::updateReply($project->id->asString(), $userId, $environ->website, $commentId, $replyData);
        $comment->read($commentId);
        $reply = $comment->getReply($replyId);

        $this->assertCount(2, $comment->replies);
        $this->assertEquals($replyData['content'], $reply->content);
    }

    public function testDeleteComment_CommentMarkedDeletedAndNotInList()
    {
        $environ = new LexiconMongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $userId = $environ->createUser('joe', 'joe', 'joe');

        $regarding = array(
            'field' => 'lexeme',
            'fieldValue' => 'Word 1',
            'inputSystem' => 'th',
            'word' => '',
            'meaning' => ''
        );
        $data = array(
            'id' => '',
            'content' => 'hi there!',
            'regarding' => $regarding
        );
        $commentId = LexCommentCommands::updateComment($project->id->asString(), $userId, $environ->website, $data);
        $comment = new LexCommentModel($project, $commentId);
        $this->assertFalse($comment->isDeleted);

        $commentList = new LexCommentListModel($project);
        $commentList->read();
        $this->assertEquals(1, $commentList->count);

        LexCommentCommands::deleteComment($project->id->asString(), $userId, $environ->website, $commentId);

        $commentList->read();
        $comment->read($commentId);

        $this->assertEquals(0, $commentList->count);
        $this->assertTrue($comment->isDeleted);
    }

    public function testDeleteReply_ReplyDeleted()
    {
        $environ = new LexiconMongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $userId = $environ->createUser('joe', 'joe', 'joe');

        $regarding = array(
            'field' => 'lexeme',
            'fieldValue' => 'Word 1',
            'inputSystem' => 'th',
            'word' => '',
            'meaning' => ''
        );
        $data = array(
            'id' => '',
            'content' => 'hi there!',
            'regarding' => $regarding
        );
        $commentId = LexCommentCommands::updateComment($project->id->asString(), $userId, $environ->website, $data);
        $comment = new LexCommentModel($project, $commentId);
        $replyData = array(
            'id' => '',
            'content' => 'my first reply'
        );

        // add two replies
        LexCommentCommands::updateReply($project->id->asString(), $userId, $environ->website, $commentId, $replyData);
        $replyId = LexCommentCommands::updateReply($project->id->asString(), $userId, $environ->website, $commentId, $replyData);

        $comment->read($commentId);

        $this->assertCount(2, $comment->replies);

        LexCommentCommands::deleteReply($project->id->asString(), $userId, $environ->website, $commentId, $replyId);

        $comment->read($commentId);
        $this->assertCount(1, $comment->replies);
    }

    public function testUpdateCommentStatus_ValidStatus_StatusUpdated()
    {
        $environ = new LexiconMongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $userId = $environ->createUser('joe', 'joe', 'joe');

        $regarding = array(
            'field' => 'lexeme',
            'fieldValue' => 'Word 1',
            'inputSystem' => 'th',
            'word' => '',
            'meaning' => ''
        );
        $data = array(
            'id' => '',
            'content' => 'hi there!',
            'regarding' => $regarding
        );
        $commentId = LexCommentCommands::updateComment($project->id->asString(), $userId, $environ->website, $data);
        $comment = new LexCommentModel($project, $commentId);

        $this->assertEquals(LexCommentModel::STATUS_OPEN, $comment->status);

        LexCommentCommands::updateCommentStatus($project->id->asString(), $commentId, LexCommentModel::STATUS_RESOLVED);

        $comment->read($commentId);

        $this->assertEquals(LexCommentModel::STATUS_RESOLVED, $comment->status);
    }

    public function testUpdateCommentStatus_InvalidStatus_Exception()
    {
        $this->expectException(Exception::class);

        $environ = new LexiconMongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $userId = $environ->createUser('joe', 'joe', 'joe');

        $regarding = array(
            'field' => 'lexeme',
            'fieldValue' => 'Word 1',
            'inputSystem' => 'th',
            'word' => '',
            'meaning' => ''
        );
        $data = array(
            'id' => '',
            'content' => 'hi there!',
            'regarding' => $regarding
        );
        $commentId = LexCommentCommands::updateComment($project->id->asString(), $userId, $environ->website, $data);
        $comment = new LexCommentModel($project, $commentId);

        $this->assertEquals(LexCommentModel::STATUS_OPEN, $comment->status);

        // save data for rest of this test
        self::$save['environ'] = $environ;
        self::$save['commentId'] = $commentId;
        self::$save['comment'] = $comment;
        $environ->inhibitErrorDisplay();

        LexCommentCommands::updateCommentStatus($project->id->asString(), $commentId, 'malicious code; rm -rf');

        // nothing runs in the current test function after an exception. IJH 2014-11
    }
    /**
     * @depends testUpdateCommentStatus_InvalidStatus_Exception
     */
    public function testUpdateCommentStatus_InvalidStatus_RestoreErrorDisplay()
    {
        // restore error display after last test
        self::$save['environ']->restoreErrorDisplay();
        self::$save['comment']->read(self::$save['commentId']);

        $this->assertEquals(LexCommentModel::STATUS_OPEN, self::$save['comment']->status);
    }

    public function testPlusOneComment_UserFirstTime_IncreasedScore()
    {
        $environ = new LexiconMongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $user1Id = $environ->createUser('joe', 'joe', 'joe');
        $user2Id = $environ->createUser('jim', 'jim', 'jim');

        $regarding = array(
            'field' => 'lexeme',
            'fieldValue' => 'Word 1',
            'inputSystem' => 'th',
            'word' => '',
            'meaning' => ''
        );
        $data = array(
            'id' => '',
            'content' => 'hi there!',
            'regarding' => $regarding
        );
        $commentId = LexCommentCommands::updateComment($project->id->asString(), $user1Id, $environ->website, $data);
        $comment = new LexCommentModel($project, $commentId);

        $this->assertEquals(0, $comment->score);
        LexCommentCommands::plusOneComment($project->id->asString(), $user1Id, $commentId);
        LexCommentCommands::plusOneComment($project->id->asString(), $user2Id, $commentId);

        $comment->read($commentId);
        $this->assertEquals(2, $comment->score);
    }

    public function testPlusOneComment_UserAlready_ScoreIsSame()
    {
        $environ = new LexiconMongoTestEnvironment();
        $environ->clean();

        $project = $environ->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $user1Id = $environ->createUser('joe', 'joe', 'joe');

        $regarding = array(
            'field' => 'lexeme',
            'fieldValue' => 'Word 1',
            'inputSystem' => 'th',
            'word' => '',
            'meaning' => ''
        );
        $data = array(
            'id' => '',
            'content' => 'hi there!',
            'regarding' => $regarding
        );
        $commentId = LexCommentCommands::updateComment($project->id->asString(), $user1Id, $environ->website, $data);
        $comment = new LexCommentModel($project, $commentId);

        $this->assertEquals(0, $comment->score);
        LexCommentCommands::plusOneComment($project->id->asString(), $user1Id, $commentId);
        LexCommentCommands::plusOneComment($project->id->asString(), $user1Id, $commentId);

        $comment->read($commentId);
        $this->assertEquals(1, $comment->score);
    }
}
