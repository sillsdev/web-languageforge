<?php

namespace models;

use models\mapper\ArrayOf;

class AnswerModel extends CommentModel
{
	public function __construct() {
		parent::__construct();
		$this->comments = new ArrayOf(
			ArrayOf::OBJECT,
			function() {
				return new CommentModel();
			}
		);
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