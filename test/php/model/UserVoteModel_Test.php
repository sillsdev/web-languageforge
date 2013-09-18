<?php

use models\dto\UsxHelper;

use models\VoteListModel;

use models\mapper\MongoStore;
use models\ProjectModel;
use models\UserVoteModel;

require_once(dirname(__FILE__) . '/../TestConfig.php');
require_once(SimpleTestPath . 'autorun.php');

require_once(TestPath . 'common/MongoTestEnvironment.php');
require_once(TestPath . 'common/MockProjectModel.php');

require_once(SourcePath . "models/ProjectModel.php");
require_once(SourcePath . "models/UserVoteModel.php");

class TestUserUserVoteModel extends UnitTestCase {

	function __construct() {
	}

	function testCRUD_Works() {
		$e = new MongoTestEnvironment();
		$e->clean();
		
		$userId = $e->mockId();
		$projectId = $e->mockId();
		$questionId = $e->mockId();
		$answerId = $e->mockId();
		
		// Create
		$vote = new UserVoteModel($userId, $projectId, $questionId);
		$this->assertNotNull($vote);
		$this->assertTrue(empty($vote->id->id));

		// Has vote should fail, answer is not yet present.
		$result = $vote->hasVote($answerId);
		$this->assertFalse($result);
		
		// Add vote, should then be present.
		$vote->addVote($answerId);
		$result = $vote->hasVote($answerId);
		$this->assertTrue($result);
		
		$id = $vote->write();
		$this->assertNotNull($id);
		$this->assertIsA($id, 'string');
		$this->assertEqual($id, $vote->id->asString());
		
		// Read back
		$otherVote = new UserVoteModel($userId, $projectId, $questionId);
		$this->assertIsA($otherVote->id->id, 'string');
		$this->assertEqual($id, $vote->id->asString());
		$result = $otherVote->hasVote($answerId);
		$this->assertTrue($result);
		
		// Update
		$answer2Id = $e->mockId();
		$otherVote->addVote($answer2Id);
		$otherVote->write();
		
		// Read back
		$otherVote = new UserVoteModel($userId, $projectId, $questionId);
		$result = $otherVote->hasVote($answerId);
		$this->assertTrue($result);
		$result = $otherVote->hasVote($answer2Id);
		$this->assertTrue($result);
		
		// Remove vote, should no longer be present.
		$vote->removeVote($answerId);
		$result = $vote->hasVote($answerId);
		$this->assertFalse($result);
		
// 		UserVoteModel::remove($projectModel->databaseName(), $id);
		
	}
	
}

?>
