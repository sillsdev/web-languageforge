<?php

namespace models\languageforge\lexicon;

use models\mapper\MapOf;

class MultiText extends MapOf {

	public function getAllLanguages() {
		return array_keys((array)$this);
	}
	
}

?>
