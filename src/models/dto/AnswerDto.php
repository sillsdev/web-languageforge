<?php

namespace models\dto;

use models\UserModel;

class AnswerDto
{
	/**
	 * 
	 * @var string - the Id of the user who authored this answer
	 */
	public $userId;
	
	/**
	 * 
	 * @var string - the author's username
	 */
	public $by;

	/**
	 * 
	 * @var int - the current score/vote of this answer
	 */
	public $score;
	
	/**
	 * 
	 * @var string the avatar URL of the author
	 */
	public $avatar_ref;
	
	
	/**
	 * 
	 * @var string
	 */
	public $answerId;
	
	/**
	 * 
	 * @var string Date on which the answer was first given
	 */
	public $dateCreated;
	
	/**
	 * 
	 * @var string Date on which the answer was last edited
	 */
	public $dateEdited;
	
	/**
	 * 
	 * @var string Answer content - a direct answer to a question
	 */
	public $answer;
	
	/**
	 * 
	 * @var array Array of CommentDto
	 */
	public $comments;
	
	/**
	 * 
	 * @var AnswerModel
	 */
	private $_m;
	
	/**
	 * 
	 * @param AnswerModel $answerModel
	 */
	public function __construct($answerModel) {
		$this->answerId = $answerModel->id;
		/* Note the answerModel is already populated with data at this point,
		 * since a questionModel is actually the document node, and answer models are just sub-documents of
		 * the questionModel, which was already read.
		 */
		$this->_m = $answerModel;
	}
	
	public function build() {
		$this->userId = $_m->userId;
		$this->dateCreated = $_m->dateCreated;
		$this->dateEdited = $_m->dateEdited;
		$this->answer = $_m->comment;
		$this->score = $_m->score;
		
		$userModel = new UserModel($_m->userId);
		$userModel->read();
		$this->avatar_ref = $userModel->avatar_ref;
		$this->by = $userModel->username;
	}
}

?>