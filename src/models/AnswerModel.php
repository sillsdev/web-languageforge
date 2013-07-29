<?php

namespace models;

class AnswerModel extends CommentModel
{
	public function __construct($projectModel, $id = NULL) {
		parent::__construct($projectModel, $id);
		$this->comments = array();
	}
	
	/**
	 * @var array<CommentModel>
	 */
	public $comments;
	
	/**
	 * 
	 * @var int
	 */
	public $score;
}

?>