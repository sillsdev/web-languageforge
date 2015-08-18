<?php
use Api\Model\ProjectModel;
use Api\Model\UserVoteModel;

require_once __DIR__ . '/../TestConfig.php';
require_once SimpleTestPath . 'autorun.php';
require_once TestPath . 'common/MongoTestEnvironment.php';

class TestUserUserVoteModel extends UnitTestCase
{

    public function testCRUD_Works()
    {
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

        // UserVoteModel::remove($projectModel->databaseName(), $id);
    }
}
