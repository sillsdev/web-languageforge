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
	public function __construct($id = '') {
		$this->questionRef = new IdReference();
		$this->votes = new ArrayOf(ArrayOf::OBJECT, function($data) { return new Vote(); } );
		parent::__construct('vote', $id);
	}
	
	/**
	 * Returns the UserVoteModel for the users votes on the given $questionId if it exists.
	 * Otherwise returns a new UserVoteModel.
	 * @param string $userId
	 * @param string $projectId
	 * @param string $questionId
	 * @return UserVoteModel
	 */
	public static function getOrCreateVotesForQuestion($userId, $projectId, $questionId) {
		$mapper = self::mapper();
		$userVoteModel = new UserVoteModel();
		$exists = $mapper->readByProperties($userVoteModel, array(
				'type' => 'vote', 
				'userRef' => MongoMapper::mongoID($userId), 
				'projectRef' => MongoMapper::mongoID($projectId), 
				'questionRef' => MongoMapper::mongoID($questionId)
		));
		if (!$exists) {
			$userVoteModel->userRef->id = $userId;
			$userVoteModel->projectRef->id = $projectId;
			$userVoteModel->questionRef->id = $questionId;
		}
		return $userVoteModel;
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
