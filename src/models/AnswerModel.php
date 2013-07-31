<?php

namespace models;

class AnswerModel extends CommentModel
{
	public function __construct() {
		parent::__construct();
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