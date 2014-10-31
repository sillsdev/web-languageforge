<?php

use models\languageforge\lexicon\commands\LexCommentCommands;
use models\languageforge\lexicon\LexCommentModel;
use models\languageforge\lexicon\LexCommentListModel;

require_once dirname(__FILE__) . '/../../../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPath . 'common/MongoTestEnvironment.php';

class TestLexCommentCommands extends UnitTestCase
{
    public function testUpdateComment_NewComment_CommentAdded()
    {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $userId = $e->createUser('joe', 'joe', 'joe');

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
        $this->assertEqual($commentList->count, 0);

        LexCommentCommands::updateComment($project->id->asString(), $userId, $e->website, $data);

        $commentList->read();
        $this->assertEqual($commentList->count, 1);
        $commentArray = $commentList->entries[0];
        $this->assertEqual($commentArray['content'], $commentContent);
        $this->assertEqual($commentArray['regarding'], $regarding);
        $this->assertEqual($commentArray['score'], 0);
        $this->assertEqual($commentArray['status'], 'open');
    }

    public function testUpdateComment_ExistingComment_CommentUpdated()
    {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $userId = $e->createUser('joe', 'joe', 'joe');

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
        $commentId = LexCommentCommands::updateComment($project->id->asString(), $userId, $e->website, $data);

        $newCommentContent = "My first comment";

        $data = array(
            'id' => $commentId,
            'content' => $newCommentContent,
        );
        LexCommentCommands::updateComment($project->id->asString(), $userId, $e->website, $data);

        $comment = new LexCommentModel($project, $commentId);

        $this->assertEqual($comment->content, $newCommentContent);
        $this->assertEqual($comment->score, 0);
        $this->assertEqual($comment->status, 'open');

    }

    public function testUpdateReply_NewReply_ReplyAdded()
    {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $userId = $e->createUser('joe', 'joe', 'joe');

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
        $commentId = LexCommentCommands::updateComment($project->id->asString(), $userId, $e->website, $data);
        $comment = new LexCommentModel($project, $commentId);
        $replyData = array(
            'id' => '',
            'content' => 'my first reply'
        );

        $this->assertEqual(count($comment->replies), 0);

        $replyId = LexCommentCommands::updateReply($project->id->asString(), $userId, $e->website, $commentId, $replyData);
        $comment->read($commentId);

        $reply = $comment->getReply($replyId);

        $this->assertEqual(count($comment->replies), 1);
        $this->assertEqual($reply->content, $replyData['content']);
    }

    public function testUpdateReply_ExistingReply_ReplyAdded()
    {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $userId = $e->createUser('joe', 'joe', 'joe');

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
        $commentId = LexCommentCommands::updateComment($project->id->asString(), $userId, $e->website, $data);
        $comment = new LexCommentModel($project, $commentId);
        $replyData = array(
            'id' => '',
            'content' => 'my first reply'
        );

        // add two replies
        LexCommentCommands::updateReply($project->id->asString(), $userId, $e->website, $commentId, $replyData);
        $replyId = LexCommentCommands::updateReply($project->id->asString(), $userId, $e->website, $commentId, $replyData);

        $comment->read($commentId);
        $reply = $comment->getReply($replyId);

        $this->assertEqual($reply->content, $replyData['content']);

        $replyData = array(
            'id' => $replyId,
            'content' => 'an updated reply'
        );

        LexCommentCommands::updateReply($project->id->asString(), $userId, $e->website, $commentId, $replyData);
        $comment->read($commentId);
        $reply = $comment->getReply($replyId);

        $this->assertEqual(count($comment->replies), 2);
        $this->assertEqual($reply->content, $replyData['content']);
    }

    public function testDeleteComment_CommentMarkedDeletedAndNotInList()
    {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $userId = $e->createUser('joe', 'joe', 'joe');

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
        $commentId = LexCommentCommands::updateComment($project->id->asString(), $userId, $e->website, $data);
        $comment = new LexCommentModel($project, $commentId);
        $this->assertFalse($comment->isDeleted);

        $commentList = new LexCommentListModel($project);
        $commentList->read();
        $this->assertEqual($commentList->count, 1);

        LexCommentCommands::deleteComment($project->id->asString(), $userId, $e->website, $commentId);

        $commentList->read();
        $comment->read($commentId);

        $this->assertEqual($commentList->count, 0);
        $this->assertTrue($comment->isDeleted);
    }

    public function testDeleteReply_ReplyDeleted()
    {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $userId = $e->createUser('joe', 'joe', 'joe');

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
        $commentId = LexCommentCommands::updateComment($project->id->asString(), $userId, $e->website, $data);
        $comment = new LexCommentModel($project, $commentId);
        $replyData = array(
            'id' => '',
            'content' => 'my first reply'
        );

        // add two replies
        LexCommentCommands::updateReply($project->id->asString(), $userId, $e->website, $commentId, $replyData);
        $replyId = LexCommentCommands::updateReply($project->id->asString(), $userId, $e->website, $commentId, $replyData);

        $comment->read($commentId);

        $this->assertEqual(count($comment->replies), 2);

        LexCommentCommands::deleteReply($project->id->asString(), $userId, $e->website, $commentId, $replyId);

        $comment->read($commentId);
        $this->assertEqual(count($comment->replies), 1);
    }

    public function testUpdateCommentStatus_ValidStatus_StatusUpdated()
    {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $userId = $e->createUser('joe', 'joe', 'joe');

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
        $commentId = LexCommentCommands::updateComment($project->id->asString(), $userId, $e->website, $data);
        $comment = new LexCommentModel($project, $commentId);

        $this->assertEqual($comment->status, LexCommentModel::STATUS_OPEN);

        LexCommentCommands::updateCommentStatus($project->id->asString(), $commentId, LexCommentModel::STATUS_RESOLVED);

        $comment->read($commentId);

        $this->assertEqual($comment->status, LexCommentModel::STATUS_RESOLVED);
    }

    public function testUpdateCommentStatus_InvalidStatus_Throws()
    {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $userId = $e->createUser('joe', 'joe', 'joe');

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
        $commentId = LexCommentCommands::updateComment($project->id->asString(), $userId, $e->website, $data);
        $comment = new LexCommentModel($project, $commentId);

        $this->assertEqual($comment->status, LexCommentModel::STATUS_OPEN);

        $this->expectException();
        $e->inhibitErrorDisplay();
        LexCommentCommands::updateCommentStatus($project->id->asString(), $commentId, 'malicious code; rm -rf');
        $e->restoreErrorDisplay();

        $comment->read($commentId);

        $this->assertEqual($comment->status, LexCommentModel::STATUS_OPEN);

    }

    public function testPlusOneComment_UserFirstTime_IncreasedScore()
    {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $user1Id = $e->createUser('joe', 'joe', 'joe');
        $user2Id = $e->createUser('jim', 'jim', 'jim');

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
        $commentId = LexCommentCommands::updateComment($project->id->asString(), $user1Id, $e->website, $data);
        $comment = new LexCommentModel($project, $commentId);

        $this->assertEqual($comment->score, 0);
        LexCommentCommands::plusOneComment($project->id->asString(), $user1Id, $commentId);
        LexCommentCommands::plusOneComment($project->id->asString(), $user2Id, $commentId);

        $comment->read($commentId);
        $this->assertEqual($comment->score, 2);
    }

    public function testPlusOneComment_UserAlready_ScoreIsSame()
    {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $user1Id = $e->createUser('joe', 'joe', 'joe');

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
        $commentId = LexCommentCommands::updateComment($project->id->asString(), $user1Id, $e->website, $data);
        $comment = new LexCommentModel($project, $commentId);

        $this->assertEqual($comment->score, 0);
        LexCommentCommands::plusOneComment($project->id->asString(), $user1Id, $commentId);
        LexCommentCommands::plusOneComment($project->id->asString(), $user1Id, $commentId);

        $comment->read($commentId);
        $this->assertEqual($comment->score, 1);

    }

}
