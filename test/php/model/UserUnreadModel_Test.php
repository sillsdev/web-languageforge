<?php


use models\UnreadQuestionModel;

use models\QuestionModel;

use models\UserModel;

use models\commands\ActivityCommands;

use models\UnreadActivityModel;

use models\rights\Roles;

use models\mapper\MongoStore;
use models\ProjectModel;

require_once(dirname(__FILE__) . '/../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

require_once(TestPath . 'common/MongoTestEnvironment.php');
require_once(TestPath . 'common/MockProjectModel.php');

require_once(SourcePath . "models/ProjectModel.php");

class TestUserUnreadModel extends UnitTestCase {

	function __construct() {
	}
	
	function testUnreadActivityModel_MarkUnreadForProjectMembers_noExistingRead_allMarkedUnread() {
		$e = new MongoTestEnvironment();
		$e->clean();
		
		$project = $e->createProject("unread_test");
		
		$userId1 = $e->createUser('user1', 'user1', 'user1');
		$user1 = new UserModel($userId1);
		$user1->addProject($project->id->asString());
		$user1->write();
		
		$userId2 = $e->createUser('user2', 'user2', 'user2');
		$user2 = new UserModel($userId2);
		$user2->addProject($project->id->asString());
		$user2->write();
		
		$userId3 = $e->createUser('user3', 'user3', 'user3');
		$user3 = new UserModel($userId3);
		$user3->addProject($project->id->asString());
		$user3->write();
		
		$activityId = ActivityCommands::addUserToProject($project, $userId1);
		
		UnreadActivityModel::markUnreadForProjectMembers($activityId, $project);	
		
		$unreadModel = new UnreadActivityModel($userId1);
		$this->assertTrue($unreadModel->isUnread($activityId));
		
		$unreadModel = new UnreadActivityModel($userId2);
		$this->assertTrue($unreadModel->isUnread($activityId));
		
		$unreadModel = new UnreadActivityModel($userId3);
		$this->assertTrue($unreadModel->isUnread($activityId));
	}
	
	function testUnreadActivityModel_isUnread_markedUnread_true() {
		$e = new MongoTestEnvironment();
		$e->clean();
		
		$project = $e->createProject("unread_test");
		$userId1 = $e->createUser('user1', 'user1', 'user1');
		$activityId = ActivityCommands::addUserToProject($project, $userId1);
		
		$unreadModel = new UnreadActivityModel($userId1);
		$this->assertFalse($unreadModel->isUnread($activityId));
		$unreadModel->markUnread($activityId);
		$unreadModel->write();
		
		$otherUnreadModel = new UnreadActivityModel($userId1);
		$this->assertTrue($otherUnreadModel->isUnread($activityId));
	}
	
	function testUnreadActivityModel_isUnread_markedRead_false() {
		$e = new MongoTestEnvironment();
		$e->clean();
		
		$project = $e->createProject("unread_test");
		$userId1 = $e->createUser('user1', 'user1', 'user1');
		$activityId = ActivityCommands::addUserToProject($project, $userId1);
		
		$unreadModel = new UnreadActivityModel($userId1);
		$this->assertFalse($unreadModel->isUnread($activityId));
		$unreadModel->markUnread($activityId);
		$unreadModel->write();
		
		$otherUnreadModel = new UnreadActivityModel($userId1);
		$otherUnreadModel->markRead($activityId);
		$otherUnreadModel->write();
		
		$unreadModel->read();
		$this->assertFalse($unreadModel->isUnread($activityId));
		
	}
	
	function testUnreadActivityModel_markAllRead_unreadItems_noUnreadItems() {
		$e = new MongoTestEnvironment();
		$e->clean();
		
		$project = $e->createProject("unread_test");
		$userId1 = $e->createUser('user1', 'user1', 'user1');
		$userId2 = $e->createUser('user2', 'user2', 'user2');
		$activityId1 = ActivityCommands::addUserToProject($project, $userId1);
		$activityId2 = ActivityCommands::addUserToProject($project, $userId2);
		
		$unreadModel = new UnreadActivityModel($userId1);
		$unreadModel->markUnread($activityId1);
		$unreadModel->markUnread($activityId2);
		$unreadModel->write();
		
		$otherUnreadModel = new UnreadActivityModel($userId1);
		$this->assertTrue($otherUnreadModel->isUnread($activityId1));
		$this->assertTrue($otherUnreadModel->isUnread($activityId2));
		$otherUnreadModel->markAllRead();
		$otherUnreadModel->write();
		
		$unreadModel->read();
		$this->assertFalse($unreadModel->isUnread($activityId1));
		$this->assertFalse($unreadModel->isUnread($activityId2));
	}
	
	function testUnreadActivityModel_unreadItems_itemsAreUnread_listsUnreadItems() {
		$e = new MongoTestEnvironment();
		$e->clean();
		
		$project = $e->createProject("unread_test");
		$userId1 = $e->createUser('user1', 'user1', 'user1');
		$userId2 = $e->createUser('user2', 'user2', 'user2');
		$activityId1 = ActivityCommands::addUserToProject($project, $userId1);
		$activityId2 = ActivityCommands::addUserToProject($project, $userId2);
		
		$unreadModel = new UnreadActivityModel($userId1);
		$unreadModel->markUnread($activityId1);
		$unreadModel->markUnread($activityId2);
		$unreadModel->write();
		
		$otherUnreadModel = new UnreadActivityModel($userId1);
		
		$unreadItems = $otherUnreadModel->unreadItems();
		$this->assertEqual(count($unreadItems), 2);
		
		$otherUnreadModel->markRead($activityId1);
		$otherUnreadModel->write();
		
		$unreadModel->read();
		$unreadItems = $unreadModel->unreadItems();
		$this->assertEqual(count($unreadItems), 1);
	}
	
	function testUnreadQuestionModel_markAllRead_unreadItems_noUnreadItems() {
		$e = new MongoTestEnvironment();
		$e->clean();
		
		$project = $e->createProject("unread_test");
		$userId1 = $e->createUser('user1', 'user1', 'user1');
		$userId2 = $e->createUser('user2', 'user2', 'user2');
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
		
		$unreadModel->read();
		$this->assertFalse($unreadModel->isUnread($qId1));
		$this->assertFalse($unreadModel->isUnread($qId2));
	}
}

?>
