<?php

namespace models\languageforge\lexicon;

use models\mapper\ArrayOf;

class LexiconFieldWithComments extends LexiconField {
	
	public $comments;
	
	function __construct() {
		$this->comments = new ArrayOf(
			function($data) {
				return new LexComment();
			}
		);
	}
}

?>
