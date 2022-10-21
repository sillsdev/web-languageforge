<?php

namespace Api\Model\Shared;

use Api\Model\Shared\Mapper\ArrayOf;
use Api\Model\Shared\Mapper\IdReference;
use Api\Model\Shared\Mapper\MongoMapper;

class UserVoteModel extends UserRelationModel
{
    /**
     * @param string $userId
     * @param string $projectId
     * @param string $questionId
     */
    public function __construct($userId, $projectId, $questionId)
    {
        $this->questionRef = new IdReference($questionId);
        $this->votes = new ArrayOf(function () {
            return new Vote();
        });
        parent::__construct("vote", $userId, $projectId);
        $this->read();
    }

    /** @var IdReference */
    public $questionRef;

    /** @var ArrayOf IdReference */
    public $votes;

    public function read($id = "")
    {
        $mapper = self::mapper();
        $exists = $mapper->readByProperties($this, [
            "type" => "vote",
            "userRef" => MongoMapper::mongoID($this->userRef->asString()),
            "projectRef" => MongoMapper::mongoID($this->projectRef->asString()),
            "questionRef" => MongoMapper::mongoID($this->questionRef->asString()),
        ]);
    }

    /**
     * Adds $answerId to the votes array.
     * @param string $answerId
     */
    public function addVote($answerId)
    {
        $vote = new Vote();
        $vote->answerRef->id = $answerId;
        if (in_array($vote, (array) $this->votes)) {
            return;
        }
        $this->votes[] = $vote;
    }

    /**
     * Removes $answerId from the votes array.
     * @param string $answerId
     */
    public function removeVote($answerId)
    {
        foreach ($this->votes as $key => $value) {
            if ($value->answerRef->id == $answerId) {
                unset($this->votes[$key]);
                break;
            }
        }
    }

    /**
     * Returns true if the $answerId exists in the votes array.
     * @param string $answerId
     * @return bool
     */
    public function hasVote($answerId)
    {
        $vote = new Vote();
        $vote->answerRef->id = $answerId;
        if (in_array($vote, (array) $this->votes)) {
            return true;
        }
        return false;
    }
}

class Vote
{
    public function __construct()
    {
        $this->answerRef = new IdReference();
    }

    public $answerRef;
}
