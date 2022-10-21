<?php

namespace Api\Model\Shared;

use Api\Model\Shared\Mapper\ArrayOf;
use Api\Model\Shared\Mapper\IdReference;
use Api\Model\Shared\Mapper\MongoMapper;

class UserGenericVoteModel extends UserRelationModel
{
    /**
     * @param string $userId
     * @param string $projectId
     * @param string $namespace - an arbitrary string representing a namespace for this vote model within the project
     */
    public function __construct($userId, $projectId, $namespace)
    {
        $this->votes = new ArrayOf(function () {
            return new GenericVote();
        });
        $this->namespace = $namespace;
        parent::__construct("vote", $userId, $projectId);
        $this->read();
    }

    /**@var ArrayOf GenericVote */
    public $votes;

    /** @var string */
    public $namespace;

    public function read($id = "")
    {
        $mapper = self::mapper();
        $mapper->readByProperties($this, [
            "type" => "vote",
            "namespace" => $this->namespace,
            "userRef" => MongoMapper::mongoID($this->userRef->asString()),
            "projectRef" => MongoMapper::mongoID($this->projectRef->asString()),
        ]);
    }

    /**
     * Adds $answerId to the votes array.
     * @param string $id
     */
    public function addVote($id)
    {
        $vote = new GenericVote();
        $vote->ref->id = $id;
        if (in_array($vote, (array) $this->votes)) {
            return;
        }
        $this->votes[] = $vote;
    }

    /**
     * Removes $answerId from the votes array.
     * @param string $id
     */
    public function removeVote($id)
    {
        foreach ($this->votes as $key => $value) {
            if ($value->ref->id == $id) {
                unset($this->votes[$key]);
                break;
            }
        }
    }

    /**
     * Returns true if the $answerId exists in the votes array.
     * @param string $id
     * @return bool
     */
    public function hasVote($id)
    {
        $vote = new GenericVote();
        $vote->ref->id = $id;
        if (in_array($vote, (array) $this->votes)) {
            return true;
        }

        return false;
    }
}

class GenericVote
{
    public function __construct()
    {
        $this->ref = new IdReference();
    }

    public $ref;
}
