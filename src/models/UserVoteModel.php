<?php
namespace models;

use models\mapper\ArrayOf;

use models\mapper\MongoMapper;
use models\mapper\Id;
use models\mapper\IdReference;

class Vote
{
	public function __construct() {
		$this->answerRef = new IdReference();
	}
	
	public $answerRef;
}

class UserVoteModel extends UserRelationModel
{
	/**
	 * @param string $userId
	 * @param string $projectId
	 * @param string $questionId
	 */
	public function __construct($userId, $projectId, $questionId) {
		$this->questionRef = new IdReference($questionId);
		$this->votes = new ArrayOf(ArrayOf::OBJECT, function($data) { return new Vote(); } );
		parent::__construct('vote', $userId, $projectId);
		$this->read();
	}
	
	public function read($id = '') {
		$mapper = self::mapper();
		$exists = $mapper->readByProperties($this, array(
				'type' => 'vote',
				'userRef' => MongoMapper::mongoID($this->userRef->asString()),
				'projectRef' => MongoMapper::mongoID($this->projectRef->asString()),
				'questionRef' => MongoMapper::mongoID($this->questionRef->asString())
		));
	}
	
	/**
	 * Adds $answerId to the votes array.
	 * @param string $answerId
	 */
	public function addVote($answerId) {
		$vote = new Vote();
		$vote->answerRef->id = $answerId;
		if (in_array($vote, $this->votes->data)) {
			return;
		}
		$this->votes->data[] = $vote;
	}
	
	/**
	 * Removes $answerId from the votes array.
	 * @param string $answerId
	 */
	public function removeVote($answerId) {
		foreach ($this->votes->data as $key => $value) {
			if ($value->answerRef->id == $answerId) {
				unset($this->votes->data[$key]);
				break;
			}
		}
	}
	
	/**
	 * Returns true if the $answerId exists in the votes array.
	 * @param string $answerId
	 * @return bool
	 */
	public function hasVote($answerId) {
		$vote = new Vote();
		$vote->answerRef->id = $answerId;
		if (in_array($vote, $this->votes->data)) {
			return true;
		}
		return false;
	}
	
	/**
	 * @var IdReference
	 */
	public $questionRef;
	
	/**
	 * @var ArrayOf IdReference
	 */
	public $votes;
	
}

?>
