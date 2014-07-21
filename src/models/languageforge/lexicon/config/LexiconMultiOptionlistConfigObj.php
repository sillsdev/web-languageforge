<?php

namespace models\languageforge\lexicon\config;

use models\mapper\ArrayOf;
use models\mapper\MapOf;

class LexiconMultiOptionlistConfigObj extends LexiconOptionlistConfigObj {
	public function __construct() {
		$this->type = LexiconConfigObj::MULTIOPTIONLIST;
	}
}


?>
