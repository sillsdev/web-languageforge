<?php

use Api\Model\Scriptureforge\Sfchecks\Command\QuestionCommands;
use Api\Model\Scriptureforge\Sfchecks\Dto\QuestionCommentDto;
use Api\Model\Scriptureforge\Sfchecks\QuestionModel;
use Api\Model\Scriptureforge\Sfchecks\TextModel;
use Api\Model\Shared\Command\ActivityCommands;
use Api\Model\Shared\UserModel;
use Api\Model\Shared\UnreadActivityModel;
use Api\Model\Shared\UnreadAnswerModel;
use Api\Model\Shared\UnreadQuestionModel;
use PHPUnit\Framework\TestCase;

class UserUnreadModelTest extends TestCase
{
    /** @var MongoTestEnvironment */
    private static $environ;

    public function setUp(): void
    {
        self::$environ = new MongoTestEnvironment();
        self::$environ->clean();
    }

    public function testUnreadActivityModel_MarkUnreadForProjectMembers_noExistingRead_allMarkedUnread()
    {
        $project = self::$environ->createProject("unread_test", "unreadCode");

        $userId1 = self::$environ->createUser('user1', 'user1', 'user1');
        $user1 = new UserModel($userId1);
        $user1->addProject($project->id->asString());
        $user1->write();

        $userId2 = self::$environ->createUser('user2', 'user2', 'user2');
        $user2 = new UserModel($userId2);
        $user2->addProject($project->id->asString());
        $user2->write();

        $userId3 = self::$environ->createUser('user3', 'user3', 'user3');
        $user3 = new UserModel($userId3);
        $user3->addProject($project->id->asString());
        $user3->write();

        $activityId = ActivityCommands::addUserToProject($project, $userId1);

        UnreadActivityModel::markUnreadForProjectMembers($activityId, $project);

        $unreadModel = new UnreadActivityModel($userId1, $project->id->asString());
        $this->assertTrue($unreadModel->isUnread($activityId));

        $unreadModel = new UnreadActivityModel($userId2, $project->id->asString());
        $this->assertTrue($unreadModel->isUnread($activityId));

        $unreadModel = new UnreadActivityModel($userId3, $project->id->asString());
        $this->assertTrue($unreadModel->isUnread($activityId));
    }

    public function testUnreadActivityModel_isUnread_markedUnread_true()
    {
        $project = self::$environ->createProject("unread_test", "unreadCode");
        $userId1 = self::$environ->createUser('user1', 'user1', 'user1');
        $activityId = ActivityCommands::addUserToProject($project, $userId1);

        $unreadModel = new UnreadActivityModel($userId1, $project->id->asString());
        $this->assertFalse($unreadModel->isUnread($activityId));
        $unreadModel->markUnread($activityId);
        $unreadModel->write();

        $otherUnreadModel = new UnreadActivityModel($userId1, $project->id->asString());
        $this->assertTrue($otherUnreadModel->isUnread($activityId));
    }

    public function testUnreadActivityModel_isUnread_markedRead_false()
    {
        $project = self::$environ->createProject("unread_test", "unreadCode");
        $userId1 = self::$environ->createUser('user1', 'user1', 'user1');
        $activityId = ActivityCommands::addUserToProject($project, $userId1);

        $unreadModel = new UnreadActivityModel($userId1, $project->id->asString());
        $this->assertFalse($unreadModel->isUnread($activityId));
        $unreadModel->markUnread($activityId);
        $unreadModel->write();

        $otherUnreadModel = new UnreadActivityModel($userId1, $project->id->asString());
        $otherUnreadModel->markRead($activityId);
        $otherUnreadModel->write();

        // Re-read the unread activity
        $unreadModel = new UnreadActivityModel($userId1, $project->id->asString());
        $unreadModel->read();
        $this->assertFalse($unreadModel->isUnread($activityId));

    }

    public function testUnreadActivityModel_markAllRead_unreadItems_noUnreadItems()
    {
        $project = self::$environ->createProject("unread_test", "unreadCode");
        $userId1 = self::$environ->createUser('user1', 'user1', 'user1');
        $userId2 = self::$environ->createUser('user2', 'user2', 'user2');
        $activityId1 = ActivityCommands::addUserToProject($project, $userId1);
        $activityId2 = ActivityCommands::addUserToProject($project, $userId2);

        $unreadModel = new UnreadActivityModel($userId1, $project->id->asString());
        $unreadModel->markUnread($activityId1);
        $unreadModel->markUnread($activityId2);
        $unreadModel->write();

        $otherUnreadModel = new UnreadActivityModel($userId1, $project->id->asString());
        $this->assertTrue($otherUnreadModel->isUnread($activityId1));
        $this->assertTrue($otherUnreadModel->isUnread($activityId2));
        $otherUnreadModel->markAllRead();
        $otherUnreadModel->write();

        // Re-read the unread activity
        $unreadModel = new UnreadActivityModel($userId1, $project->id->asString());
        $unreadModel->read();
        $this->assertFalse($unreadModel->isUnread($activityId1));
        $this->assertFalse($unreadModel->isUnread($activityId2));
    }

    public function testUnreadActivityModel_unreadItems_itemsAreUnread_listsUnreadItems()
    {
        $project = self::$environ->createProject("unread_test", "unreadCode");
        $userId1 = self::$environ->createUser('user1', 'user1', 'user1');
        $userId2 = self::$environ->createUser('user2', 'user2', 'user2');
        $activityId1 = ActivityCommands::addUserToProject($project, $userId1);
        $activityId2 = ActivityCommands::addUserToProject($project, $userId2);

        $unreadModel = new UnreadActivityModel($userId1, $project->id->asString());
        $unreadModel->markUnread($activityId1);
        $unreadModel->markUnread($activityId2);
        $unreadModel->write();

        $otherUnreadModel = new UnreadActivityModel($userId1, $project->id->asString());

        $unreadItems = $otherUnreadModel->unreadItems();
        $this->assertCount(2, $unreadItems);

        $otherUnreadModel->markRead($activityId1);
        $otherUnreadModel->write();

        $unreadModel->read();
        $unreadItems = $unreadModel->unreadItems();
        $this->assertCount(1, $unreadItems);
    }

    public function testUnreadQuestionModel_markAllRead_unreadItems_noUnreadItems()
    {
        $project = self::$environ->createProject("unread_test", "unreadCode");
        $userId1 = self::$environ->createUser('user1', 'user1', 'user1');
        self::$environ->createUser('user2', 'user2', 'user2');
        $q1 = new QuestionModel($project);
        $q1->title = "Question 1";
        $qId1 = $q1->write();
        $q2 = new QuestionModel($project);
        $q2->title = "Question 2";
        $qId2 = $q2->write();

        $unreadModel = new UnreadQuestionModel($userId1, $project->id->asString());
        $unreadModel->markUnread($qId1);
        $unreadModel->markUnread($qId2);
        $unreadModel->write();

        $otherUnreadModel = new UnreadQuestionModel($userId1, $project->id->asString());
        $this->assertTrue($otherUnreadModel->isUnread($qId1));
        $this->assertTrue($otherUnreadModel->isUnread($qId2));
        $otherUnreadModel->markAllRead();
        $otherUnreadModel->write();

        // Re-read the unread question model
        $unreadModel = new UnreadQuestionModel($userId1, $project->id->asString());
        $unreadModel->read();
        $this->assertFalse($unreadModel->isUnread($qId1));
        $this->assertFalse($unreadModel->isUnread($qId2));
    }

    public function testUnreadAnswerModel_multipleUsers_authorIsNotMarkedUnread()
    {
        $project = self::$environ->createProject("unread_test", "unreadCode");
        $projectId = $project->id->asString();

        $userId1 = self::$environ->createUser('user1', 'user1', 'user1');
        $user1 = new UserModel($userId1);
        $user1->addProject($project->id->asString());
        $user1->write();

        $userId2 = self::$environ->createUser('user2', 'user2', 'user2');
        $user2 = new UserModel($userId2);
        $user2->addProject($project->id->asString());
        $user2->write();

        $userId3 = self::$environ->createUser('user3', 'user3', 'user3');
        $user3 = new UserModel($userId3);
        $user3->addProject($project->id->asString());
        $user3->write();

        $answer = array('content' => "test answer", 'id' => '');

        $text = new TextModel($project);
        $text->title = "Text 1";
        $usx = MongoTestEnvironment::usxSample();
        $text->content = $usx;
        $textId = $text->write();

        $question = new QuestionModel($project);
        $question->title = "test question";
        $question->textRef->id = $textId;
        $questionId = $question->write();
        $answerDto = QuestionCommands::updateAnswer($projectId, $questionId, $answer, $userId1);
        $answer = array_pop($answerDto);
        $answerId = $answer['id'];

        // the answer author does NOT get their answer marked as unread
        $unreadModel = new UnreadAnswerModel($userId1, $projectId, $questionId);
        $this->assertFalse($unreadModel->isUnread($answerId));

        $unreadModel = new UnreadAnswerModel($userId2, $projectId, $questionId);
        $this->assertTrue($unreadModel->isUnread($answerId));
        $unreadModel = new UnreadAnswerModel($userId3, $projectId, $questionId);
        $this->assertTrue($unreadModel->isUnread($answerId));
    }

    public function testMultipleUnreadModels_multipleUsers_multipleUpdates_multipleVisitsToQuestionPage_usersHaveDifferentUnreadStates()
    {
        $project = self::$environ->createProject("unread_test", "unreadCode");
        $projectId = $project->id->asString();

        $userId1 = self::$environ->createUser('user1', 'user1', 'user1');
        $user1 = new UserModel($userId1);
        $user1->addProject($project->id->asString());
        $user1->write();

        $userId2 = self::$environ->createUser('user2', 'user2', 'user2');
        $user2 = new UserModel($userId2);
        $user2->addProject($project->id->asString());
        $user2->write();

        $userId3 = self::$environ->createUser('user3', 'user3', 'user3');
        $user3 = new UserModel($userId3);
        $user3->addProject($project->id->asString());
        $user3->write();

        $answer1 = array('content' => "test answer 1", 'id' => '');
        $answer2 = array('content' => "test answer 2", 'id' => '');

        $text = new TextModel($project);
        $text->title = "Text 1";
        $usx = MongoTestEnvironment::usxSample();
        $text->content = $usx;
        $textId = $text->write();

        $question = new QuestionModel($project);
        $question->title = "test question";
        $question->textRef->id = $textId;
        $questionId = $question->write();
        QuestionCommands::updateAnswer($projectId, $questionId, $answer1, $userId1);
        QuestionCommands::updateAnswer($projectId, $questionId, $answer2, $userId2);

        // the answer author does NOT get their answer marked as unread
        $unreadModel = new UnreadAnswerModel($userId1, $projectId, $questionId);
        $this->assertCount(1, $unreadModel->unreadItems());

        // the answer author does NOT get their answer marked as unread
        $unreadModel = new UnreadAnswerModel($userId2, $projectId, $questionId);
        $this->assertCount(1, $unreadModel->unreadItems());

        $unreadModel = new UnreadAnswerModel($userId3, $projectId, $questionId);
        $this->assertCount(2, $unreadModel->unreadItems());

        // user1 visits question page
        QuestionCommentDto::encode($projectId, $questionId, $userId1);
        $unreadModel = new UnreadAnswerModel($userId1, $projectId, $questionId);
        $this->assertCount(0, $unreadModel->unreadItems());
        $unreadModel = new UnreadAnswerModel($userId2, $projectId, $questionId);
        $this->assertCount(1, $unreadModel->unreadItems());
        $unreadModel = new UnreadAnswerModel($userId3, $projectId, $questionId);
        $this->assertCount(2, $unreadModel->unreadItems());

        // user2 visits question page
        QuestionCommentDto::encode($projectId, $questionId, $userId2);
        $unreadModel = new UnreadAnswerModel($userId1, $projectId, $questionId);
        $this->assertCount(0, $unreadModel->unreadItems());
        $unreadModel = new UnreadAnswerModel($userId2, $projectId, $questionId);
        $this->assertCount(0, $unreadModel->unreadItems());
        $unreadModel = new UnreadAnswerModel($userId3, $projectId, $questionId);
        $this->assertCount(2, $unreadModel->unreadItems());

        // user2 visits question page
        QuestionCommentDto::encode($projectId, $questionId, $userId3);
        $unreadModel = new UnreadAnswerModel($userId1, $projectId, $questionId);
        $this->assertCount(0, $unreadModel->unreadItems());
        $unreadModel = new UnreadAnswerModel($userId2, $projectId, $questionId);
        $this->assertCount(0, $unreadModel->unreadItems());
        $unreadModel = new UnreadAnswerModel($userId3, $projectId, $questionId);
        $this->assertCount(0, $unreadModel->unreadItems());
    }
}
