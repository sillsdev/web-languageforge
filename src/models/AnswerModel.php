<?php

namespace models;

use models\mapper\MapOf;

class AnswerModel extends CommentModel
{
	public function __construct() {
		parent::__construct();
		$this->comments = new MapOf(
			function($data) {
				return new CommentModel();
			}
		);
	}
	
	public function fixDecode() {
		if ($this->score == null) {
			$this->score = 0;
		}
	}
	
	/**
	 * @var MapOf<CommentModel>
	 */
	public $comments;
	
	public $textHightlight;
	
	/**
	 * @var int
	 */
	public $score;
}

?>