<?php

namespace models\dto;

class CommentDto
{
	/**
	 * 
	 * @var string - the Id of the user who authored this comment
	 */
	public $userId;
	
	/**
	 * 
	 * @var string - the comment author's username
	 */
	public $by;

	/**
	 * 
	 * @var string Date on which the comment was given
	 */
	public $date;
	
	/**
	 * 
	 * @var string Comment content - a comment on an answer to a question
	 */
	public $content;
	
	public function __construct() {
	}
	
	public function build() {
	}
}

?>