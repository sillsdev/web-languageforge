<?php

use Api\Model\Shared\UserVoteModel;
use PHPUnit\Framework\TestCase;

class UserVoteModelTest extends TestCase
{
    public function testCRUD_Works()
    {
        $environ = new MongoTestEnvironment();
        $environ->clean();

        $userId = $environ->mockId();
        $projectId = $environ->mockId();
        $questionId = $environ->mockId();
        $answerId = $environ->mockId();

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
        $this->assertIsString($id);
        $this->assertEquals($vote->id->asString(), $id);

        // Read back
        $otherVote = new UserVoteModel($userId, $projectId, $questionId);
        $this->assertIsString($otherVote->id->id);
        $this->assertEquals($vote->id->asString(), $id);
        $result = $otherVote->hasVote($answerId);
        $this->assertTrue($result);

        // Update
        $answer2Id = $environ->mockId();
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
