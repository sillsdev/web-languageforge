<?php

namespace models\languageforge\lexicon;


use models\mapper\ArrayOf;

class LexiconMultiValueFieldWithComments extends LexiconMultiValueField {
	
	public function __construct($values = array()) {
		$this->comments = new ArrayOf(
			function($data) {
				return new LexComment();
			}
		);
		parent::__construct($values);
	}
	
	public $comments;
	
	
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
