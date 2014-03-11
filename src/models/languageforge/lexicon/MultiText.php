<?php

namespace models\languageforge\lexicon;

use models\mapper\MapOf;

class MultiText extends MapOf {
	
	public function __construct() {
		parent::__construct(function($data) {
			return new LexiconFieldWithComments();
		});
	}

}

?>
