<?php
namespace models;

use models\mapper\ArrayOf;

use models\mapper\MongoMapper;
use models\mapper\Id;
use models\mapper\IdReference;

class Vote
{
	public function __construct() {
		$this->ref = new IdReference();
	}
	
	public $ref;
}

class UserGenericVoteModel extends UserRelationModel
{
	/**
	 * @param string $userId
	 * @param string $projectId
	 */
	public function __construct($userId, $projectId) {
		$this->votes = new ArrayOf(function($data) { return new Vote(); } );
		parent::__construct('vote', $userId, $projectId);
		$this->read();
	}
	
	public function read($id = '') {
		$mapper = self::mapper();
		$mapper->readByProperties($this, array(
				'type' => 'vote',
				'userRef' => MongoMapper::mongoID($this->userRef->asString()),
				'projectRef' => MongoMapper::mongoID($this->projectRef->asString())
		));
	}
	
	/**
	 * Adds $answerId to the votes array.
	 * @param string $id
	 */
	public function addVote($id) {
		$vote = new Vote();
		$vote->ref->id = $id;
		if (in_array($vote, (array)$this->votes)) {
			return;
		}
		$this->votes[] = $vote;
	}
	
	/**
	 * Removes $answerId from the votes array.
	 * @param string $id
	 */
	public function removeVote($id) {
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
	public function hasVote($id) {
		$vote = new Vote();
		$vote->ref->id = $id;
		if (in_array($vote, (array)$this->votes)) {
			return true;
		}
		return false;
	}
	
	/**
	 * @var ArrayOf IdReference
	 */
	public $votes;
	
}

?>
