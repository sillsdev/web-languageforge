<?php

namespace models\languageforge\lexicon;

use models\mapper\MapOf;

class MultiText extends MapOf {
	
	public function __construct() {
		parent::__construct(function($data) {
			return new LexiconFieldWithComments();
		});
	}
	
	public function form($inputSystem, $value) {
		if (array_key_exists($inputSystem, $this)) {
			$this[$inputSystem]->value = $value;
		} else {
			$this[$inputSystem] = new LexiconFieldWithComments($value);
		}
	}

}

?>
