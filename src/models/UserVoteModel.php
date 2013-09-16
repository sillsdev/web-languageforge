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
	 * Returns the UserVoteModel for the users vote on the given $answerId if it exists.  Otherwise returns null.
	 * @param string $userId
	 * @param string $projectId
	 * @param string $questionId
	 * @param string $answerId
	 * @return UserVoteModel
	 */
	public static function getVotesForQuestion($userId, $projectId, $questionId, $answerId) {
		
	}
	
	/**
	 * Adds a UserVoteModel to the database for the $userId on the given $answerId.
	 * No additional check is made to see if this is permitted.
	 * @param string $userId
	 * @param string $projectId
	 * @param string $questionId
	 * @param string $answerId
	 */
	public static function addVote($userId, $projectId, $questionId, $answerId) {
		
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
