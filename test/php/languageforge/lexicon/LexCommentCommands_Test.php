<?php

use models\languageforge\lexicon\commands\LexCommentCommands;
use models\languageforge\lexicon\commands\LexEntryCommands;
use models\languageforge\lexicon\commands\LexProjectCommands;
use models\languageforge\lexicon\config\LexiconConfigObj;
use models\languageforge\lexicon\Example;
use models\languageforge\lexicon\LexCommentModel;
use models\languageforge\lexicon\LexCommentReply;
use models\languageforge\lexicon\LexEntryModel;
use models\languageforge\lexicon\LexiconProjectModel;
use models\languageforge\lexicon\Sense;
use models\languageforge\lexicon\LexCommentListModel;

require_once(dirname(__FILE__) . '/../../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');
require_once(TestPath . 'common/MongoTestEnvironment.php');

class TestLexCommentCommands extends UnitTestCase {

    function testUpdateComment_NewComment_CommentAdded() {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $userId = $e->createUser('joe', 'joe', 'joe');

        $commentContent = "My first comment";

        $regarding = array(
            'fieldName' => 'lexeme',
            'content' => 'Word 1',
            'inputSystem' => 'th',
            'entryContext' => '',
            'senseContext' => ''
        );

        $data = array(
            'id' => '',
            'content' => $commentContent,
            'regarding' => $regarding
        );

        $commentList = new LexCommentListModel($project);
        $commentList->read();
        $this->assertEqual($commentList->count, 0);

        LexCommentCommands::updateComment($project->id->asString(), $userId, $data);

        $commentList->read();
        $this->assertEqual($commentList->count, 1);
        $commentArray = $commentList->entries[0];
        $this->assertEqual($commentArray['content'], $commentContent);
        $this->assertEqual($commentArray['regarding'], $regarding);
        $this->assertEqual($commentArray['score'], 0);
        $this->assertEqual($commentArray['status'], 'open');
    }

    function testUpdateComment_ExistingComment_CommentUpdated() {
        $e = new LexiconMongoTestEnvironment();
        $e->clean();

        $project = $e->createProject(SF_TESTPROJECT, SF_TESTPROJECTCODE);
        $userId = $e->createUser('joe', 'joe', 'joe');

        $regarding = array(
            'fieldName' => 'lexeme',
            'content' => 'Word 1',
            'inputSystem' => 'th',
            'entryContext' => '',
            'senseContext' => ''
        );
        $data = array(
            'id' => '',
            'content' => 'hi there!',
            'regarding' => $regarding
        );
        $commentId = LexCommentCommands::updateComment($project->id->asString(), $userId, $data);

        $newCommentContent = "My first comment";

        $data = array(
            'id' => $commentId,
            'content' => $newCommentContent,
        );
        LexCommentCommands::updateComment($project->id->asString(), $userId, $data);

        $comment = new LexCommentModel($project, $commentId);

        $this->assertEqual($comment->content, $newCommentContent);
        $this->assertEqual($comment->score, 0);
        $this->assertEqual($comment->status, 'open');

    }

    function testUpdateReply_NewReply_ReplyAdded() {}

    function testUpdateReply_ExistingReply_ReplyAdded() {}

    function testDeleteComment_CommentMarkedDeleted() {}

    function testDeleteReply_ReplyDeleted() {}

    function testUpdateCommentStatus_ValidStatus_StatusUpdated() {}

    function testUpdateCommentStatus_InvalidStatus_Throws() {}

    function testPlusOneComment_UserFirstTime_IncreasedScore() {}

    function testPlusOneComment_UserAlready_ScoreIsSame() {}


}

?>
