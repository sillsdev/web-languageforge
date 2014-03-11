<?php

namespace models\languageforge\lexicon;

use models\mapper\MapOf;

class MultiText extends MapOf {
	
	public function __construct() {
		parent::__construct(function($data) {
			return new LexiconFieldWithComments();
		});
	}
	
	public function updateForm($inputSystem, $text) {
		if (array_key_exists($inputSystem, $this)) {
			$this[$inputSystem]->value = $text;
		} else {
			$this[$inputSystem] = new LexiconFieldWithComments($text);
		}
	}

}

?>
