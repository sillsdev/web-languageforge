<?php

namespace models\languageforge\lexicon;


use models\mapper\ArrayOf;

class LexiconMultiValueFieldWithComments extends LexiconMultiValueField {
	
	public function __construct() {
		$this->comments = new ArrayOf(
			function($data) {
				return new LexComment();
			}
		);
	}
	
	public $comments;
}

?>
