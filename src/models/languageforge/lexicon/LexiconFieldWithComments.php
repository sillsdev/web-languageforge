<?php

namespace models\languageforge\lexicon;

use models\mapper\ArrayOf;

class LexiconFieldWithComments extends LexiconField {
	
	public $comments;
	
	function __construct($value = '') {
		$this->comments = new ArrayOf(
			function($data) {
				return new LexComment();
			}
		);
		parent::__construct($value);
	}
	
	/**
	 * 
	 * @param string $id
	 * @return LexComment
	 */
	public function getComment($id) {
		foreach ($this->comments as $comment) {
			if ($comment->id == $id) {
				return $comment;
			}
		}
	}

	public function setComment($id, $model) {
		foreach ($this->comments as $key => $comment) {
			if ($comment->id == $id) {
				$this->comments[$key] = $model;
				break;
			}
		}
	}
}

?>
