<?php

namespace models;

class AnswerModel extends CommentModel
{
	public function __construct() {
		// TODO: we need to pass in an id here of type id
		
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